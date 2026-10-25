"""HTTP boundary checks; skipped explicitly until Flask is installed."""

import importlib.util
from pathlib import Path
import tempfile
import unittest
import uuid


@unittest.skipUnless(importlib.util.find_spec('flask'), 'Flask is not installed; HTTP checks pending')
class LocalRequestTests(unittest.TestCase):
    def setUp(self):
        from tracker import create_app
        self.temp = tempfile.TemporaryDirectory(prefix='work-tracker-http-')
        self.addCleanup(self.temp.cleanup)
        self.app = create_app(Path(self.temp.name), testing=True)
        self.client = self.app.test_client()
        self.token = self.app.config['REQUEST_TOKEN']

    def payload(self):
        return {'expected_revision': 0, 'request_id': str(uuid.uuid4()), 'title': 'Fictional HTTP project'}

    def test_save_and_state_contract(self):
        result = self.client.post('/api/projects', json=self.payload(), headers={'X-Request-Token': self.token})
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json['revision'], 1)
        self.assertEqual(result.json['data']['projects'][0]['id'], result.json['entity_id'])
        self.assertFalse(result.json['data']['demo_mode'])
        self.assertEqual(self.client.get('/api/state').json, result.json['data'])

    def test_step_note_route_saves_context_without_changing_completion(self):
        headers = {'X-Request-Token': self.token}
        def save(path, fields, method='post'):
            body = {'expected_revision': self.client.get('/api/state').json['revision'],
                    'request_id': str(uuid.uuid4()), **fields}
            result = getattr(self.client, method)(path, json=body, headers=headers)
            self.assertEqual(result.status_code, 200)
            return result.json
        project = save('/api/projects', {'title': 'Notes QA'})['entity_id']
        goal = save('/api/goals', {'title': 'Goal', 'project_id': project})['entity_id']
        step = save('/api/steps', {'title': 'Completed step', 'goal_id': goal})['entity_id']
        completion = save('/api/steps/' + step, {'status': 'completed'}, 'patch')
        result = save('/api/steps/' + step + '/notes', {'text': 'Still open for notes'})
        self.assertEqual(result['data']['steps'], completion['data']['steps'])
        self.assertEqual(result['data']['entries'][-1]['kind'], 'note')
        self.assertEqual(self.client.get('/api/state').json, result['data'])
        refused = self.client.post('/api/steps/' + step + '/notes', json={})
        self.assertEqual(refused.status_code, 403)

    def test_icon_and_archive_restore_routes_preserve_existing_context(self):
        headers = {'X-Request-Token': self.token}
        def save(path, fields, method='post'):
            body = {'expected_revision': self.client.get('/api/state').json['revision'],
                    'request_id': str(uuid.uuid4()), **fields}
            result = getattr(self.client, method)(path, json=body, headers=headers)
            self.assertEqual(result.status_code, 200)
            return result.json
        project = save('/api/projects', {'title': 'Archive QA', 'icon': 'chart'})['entity_id']
        save('/api/projects/' + project, {'icon': 'award'}, 'patch')
        goal = save('/api/goals', {'title': 'Goal', 'project_id': project})['entity_id']
        step = save('/api/steps', {'title': 'Step', 'goal_id': goal})['entity_id']
        save('/api/steps/' + step + '/notes', {'text': 'Keep note'})
        removed = save('/api/steps/' + step + '/archive', {'reason': 'Not needed now'})
        self.assertIsNotNone(removed['data']['steps'][0]['archived_at'])
        restored = save('/api/steps/' + step + '/restore', {})
        self.assertIsNone(restored['data']['steps'][0]['archived_at'])
        self.assertEqual(restored['data']['projects'][0]['icon'], 'award')
        self.assertEqual(sum(e['kind'] == 'note' for e in restored['data']['entries']), 1)
        for suffix in ('archive', 'restore'):
            self.assertEqual(self.client.post('/api/steps/' + step + '/' + suffix, json={}).status_code, 403)
        self.assertEqual(self.client.get('/api/state').json, restored['data'])

    def test_cross_origin_and_missing_token_rejected(self):
        for headers in ({}, {'X-Request-Token': self.token, 'Origin': 'https://elsewhere.example'},
                        {'X-Request-Token': self.token, 'Sec-Fetch-Site': 'cross-site'}):
            with self.subTest(headers=headers):
                result = self.client.post('/api/projects', json=self.payload(), headers=headers)
                self.assertEqual(result.status_code, 403)
        self.assertEqual(self.client.get('/api/state').json['revision'], 0)

    def test_host_validation_and_private_files(self):
        self.assertEqual(self.client.get('/api/state', headers={'Host': 'attacker.example'}).status_code, 403)
        for path in ('/data/tracker.sqlite3', '/backups/test.json', '/devpost/learner-profile.md', '/static/../app.py'):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)

    def test_rename_and_same_project_move_routes(self):
        headers = {'X-Request-Token': self.token}
        def save(path, fields, method='post'):
            body = {'expected_revision': self.client.get('/api/state').json['revision'],
                    'request_id': str(uuid.uuid4()), **fields}
            response = getattr(self.client, method)(path, json=body, headers=headers)
            self.assertEqual(response.status_code, 200)
            return response.json
        project = save('/api/projects', {'title': 'Edit QA'})['entity_id']
        first = save('/api/goals', {'title': 'Before', 'project_id': project})['entity_id']
        later = save('/api/goals', {'title': 'Later', 'project_id': project})['entity_id']
        step = save('/api/steps', {'title': 'Old step', 'goal_id': first})['entity_id']
        save('/api/goals/' + first + '/title', {'title': 'New goal'}, 'patch')
        save('/api/steps/' + step + '/title', {'title': 'New step'}, 'patch')
        moved = save('/api/steps/' + step + '/move', {'goal_id': later})
        self.assertEqual(moved['data']['steps'][0]['title'], 'New step')
        self.assertEqual(moved['data']['steps'][0]['goal_id'], later)
        self.assertEqual(moved['data']['entries'][-1]['details']['source_goal']['title'], 'New goal')
        for path, method, fields in [('/api/goals/' + first + '/title', 'patch', {'title': 'Blocked'}),
                                     ('/api/steps/' + step + '/title', 'patch', {'title': 'Blocked'}),
                                     ('/api/steps/' + step + '/move', 'post', {'goal_id': first})]:
            revision = self.client.get('/api/state').json['revision']
            response = getattr(self.client, method)(path, json={'expected_revision': revision, 'request_id': str(uuid.uuid4()), **fields})
            self.assertEqual(response.status_code, 403)
            self.assertEqual(self.client.get('/api/state').json['revision'], revision)

    def test_invalid_json_fails_without_mutation(self):
        result = self.client.post('/api/projects', data='{"broken":', content_type='application/json',
                                  headers={'X-Request-Token': self.token})
        self.assertEqual(result.status_code, 400)
        self.assertEqual(result.json['error']['code'], 'invalid_input')
        self.assertEqual(self.client.get('/api/state').json['revision'], 0)


if __name__ == '__main__':
    unittest.main()
