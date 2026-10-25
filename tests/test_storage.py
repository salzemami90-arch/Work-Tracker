"""Real file persistence and failures; all content is fictional and temporary."""

from pathlib import Path
import json
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import uuid

from tracker import service, storage


class StorageWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='work-tracker-test-')
        self.addCleanup(self.temp.cleanup)
        self.database = Path(self.temp.name) / 'tracker.sqlite3'
        storage.initialize(self.database)

    def state(self):
        return storage.read_state(self.database)

    def save(self, operation, entity_id=None, **fields):
        body = {'expected_revision': self.state()['revision'], 'request_id': str(uuid.uuid4()), **fields}
        return service.mutate(self.database, operation, body, entity_id)

    def setup_step(self):
        project = self.save('create_project', title='Fictional studio', next_action='Draft the explanation')['entity_id']
        goal = self.save('create_goal', project_id=project, title='Demonstrate a prototype')['entity_id']
        step = self.save('create_step', goal_id=goal, title='Draft explanation')['entity_id']
        return project, goal, step

    def test_completed_achievement_survives_new_work_and_reinitialization(self):
        project, goal, step = self.setup_step()
        self.save('complete_step', step, status='completed', reason='Reviewed independently', agent_name='')
        original = self.state()
        achievement = next(entry for entry in original['entries'] if entry['action'] == 'step_completed')
        self.save('create_step', goal_id=goal, title='Unexpected clarification', reason='A new question appeared', agent_name='Example helper')
        self.save('update_project', project, next_action='Answer the new question')
        self.save('settings', language='ar')
        expected = self.state()
        storage.initialize(self.database)
        restored = self.state()
        self.assertEqual(expected, restored)
        self.assertIn(achievement, restored['entries'])
        self.assertEqual(restored['goals'][0]['status'], 'active')
        self.assertEqual(restored['projects'][0]['status'], 'active')
        self.assertEqual(restored['projects'][0]['next_action'], 'Answer the new question')
        self.assertEqual(restored['steps'][0]['completed_at'], achievement['occurred_at'])
        self.assertEqual(restored['settings']['language'], 'ar')
        self.assertEqual(len(restored['steps']), 2)
        self.assertNotIn('_request', achievement['details'])

    def test_notes_before_and_after_completion_preserve_the_step_and_history(self):
        project, goal, step = self.setup_step()
        self.save('add_step_note', step, text='Before completion')
        self.save('complete_step', step, status='completed', completion_at='2026-01-02T12:00:00+03:00')
        before = self.state()
        self.save('add_step_note', step, text='بعد الإنجاز <b>literal</b>',
                  occurred_at='2026-01-03T10:00:00+03:00', agent_name='')
        self.save('add_step_note', step, text='Another observation', agent_name='Example helper')
        after = self.state()
        self.assertEqual(before['steps'], after['steps'])
        self.assertEqual(before['goals'], after['goals'])
        self.assertEqual(before['projects'], after['projects'])
        for entry in before['entries']:
            self.assertIn(entry, after['entries'])
        notes = [entry for entry in after['entries'] if entry['kind'] == 'note']
        self.assertEqual(len(notes), 3)
        self.assertTrue(all((n['project_id'], n['goal_id'], n['step_id']) == (project, goal, step) for n in notes))
        dated = next(n for n in notes if n['text'].startswith('بعد'))
        self.assertEqual(dated['occurred_at'], '2026-01-03T07:00:00Z')
        self.assertIsNone(dated['agent_name'])
        result = subprocess.run([sys.executable, '-c',
            'import json,sys; from tracker import storage; storage.initialize(sys.argv[1]); print(json.dumps(storage.read_state(sys.argv[1])))',
            str(self.database)], cwd=Path(__file__).resolve().parent.parent, capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout), after)

    def test_note_retry_stale_revision_and_write_failure_do_not_duplicate_or_lose_notes(self):
        _, _, step = self.setup_step()
        body = {'expected_revision': self.state()['revision'], 'request_id': str(uuid.uuid4()), 'text': 'Retried note'}
        service.mutate(self.database, 'add_step_note', body, step)
        self.save('add_step_note', step, text='Later note')
        before = self.state()
        retry = service.mutate(self.database, 'add_step_note', body, step)
        self.assertEqual(retry['data'], before)
        with self.assertRaises(service.AppError) as caught:
            service.mutate(self.database, 'add_step_note', {**body, 'request_id': str(uuid.uuid4())}, step)
        self.assertEqual(caught.exception.code, 'stale_revision')
        with patch('tracker.service.insert_event', side_effect=sqlite3.OperationalError('simulated disk failure')):
            with self.assertRaises(sqlite3.OperationalError):
                self.save('add_step_note', step, text='Never saved')
        self.assertEqual(self.state(), before)

    def test_invalid_notes_leave_existing_work_unchanged(self):
        project, _, step = self.setup_step()
        before = self.state()
        for target, fields in [(step, {'text': '  '}), (step, {'text': []}),
                               (step, {'text': 'Note', 'occurred_at': 'bad'}),
                               (step, {'text': 'Note', 'occurred_at': '2026-01-03T10:00:00'}),
                               (step, {'text': 'Note', 'project_id': project}),
                               (str(uuid.uuid4()), {'text': 'Missing step'}),
                               ('bad-id', {'text': 'Invalid step'})]:
            with self.subTest(target=target, fields=fields):
                with self.assertRaises(service.AppError):
                    self.save('add_step_note', target, **fields)
                self.assertEqual(self.state(), before)

    def test_archive_restore_preserves_completed_step_notes_and_achievement(self):
        project, goal, step = self.setup_step()
        self.save('complete_step', step, status='completed', completion_at='2026-01-02T12:00:00+03:00')
        self.save('add_step_note', step, text='Keep this context')
        original = self.state()
        self.save('archive_step', step, reason='Move out of current plan')
        archived = self.state()
        self.assertIsNotNone(archived['steps'][0]['archived_at'])
        self.assertEqual(archived['projects'], original['projects'])
        self.assertEqual(archived['goals'], original['goals'])
        for key, value in original['steps'][0].items():
            if key not in ('archived_at', 'updated_at'):
                self.assertEqual(archived['steps'][0][key], value)
        for entry in original['entries']:
            self.assertIn(entry, archived['entries'])
        self.save('add_step_note', step, text='Context while removed')
        self.save('restore_step', step, reason='Needed again')
        restored = self.state()
        self.assertIsNone(restored['steps'][0]['archived_at'])
        for key, value in original['steps'][0].items():
            if key != 'updated_at':
                self.assertEqual(restored['steps'][0][key], value)
        self.assertEqual(sum(e['action'] == 'step_completed' for e in restored['entries']), 1)
        self.assertEqual(sum(e['kind'] == 'note' for e in restored['entries']), 2)
        self.assertEqual([e['action'] for e in restored['entries'] if e['action'] in ('step_archived', 'step_restored')],
                         ['step_archived', 'step_restored'])
        storage.initialize(self.database)
        self.assertEqual(restored, self.state())

    def test_archive_restore_requests_are_safe_to_retry_and_reject_invalid_state(self):
        _, _, step = self.setup_step()
        for operation in ('archive_step', 'restore_step'):
            body = {'expected_revision': self.state()['revision'], 'request_id': str(uuid.uuid4()), 'reason': 'QA'}
            first = service.mutate(self.database, operation, body, step)
            self.assertEqual(service.mutate(self.database, operation, body, step), first)
            before = self.state()
            with self.assertRaises(service.AppError):
                self.save(operation, step)
            with self.assertRaises(service.AppError) as caught:
                service.mutate(self.database, operation, {**body, 'request_id': str(uuid.uuid4())}, step)
            self.assertEqual(caught.exception.code, 'stale_revision')
            self.assertEqual(before, self.state())
            if operation == 'archive_step':
                with self.assertRaises(service.AppError):
                    self.save('complete_step', step, status='completed')
                self.assertEqual(before, self.state())
        self.assertEqual(self.state()['steps'][0]['status'], 'pending')

    def test_deferred_step_dates_and_icon_survive_removal_and_new_process(self):
        project, _, step = self.setup_step()
        connection = storage.connect(self.database)
        connection.execute("UPDATE steps SET status='deferred',planned_for='2026-10-24',due_date='2026-10-30' WHERE id=?", (step,))
        connection.close()
        self.save('update_project', project, icon='document')
        original_step = self.state()['steps'][0]
        self.save('archive_step', step)
        expected = self.state()
        result = subprocess.run([sys.executable, '-c',
            'import json,sys; from tracker import storage; storage.initialize(sys.argv[1]); print(json.dumps(storage.read_state(sys.argv[1])))',
            str(self.database)], cwd=Path(__file__).resolve().parent.parent, capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout), expected)
        self.save('restore_step', step)
        for key in ('status', 'planned_for', 'due_date', 'completed_at', 'created_at', 'position'):
            self.assertEqual(self.state()['steps'][0][key], original_step[key])
        self.assertEqual(self.state()['projects'][0]['icon'], 'document')

    def test_archive_restore_roll_back_when_event_write_fails(self):
        _, _, step = self.setup_step()
        for operation in ('archive_step', 'restore_step'):
            if operation == 'restore_step':
                self.save('archive_step', step)
            before = self.state()
            with patch('tracker.service.insert_event', side_effect=sqlite3.OperationalError('simulated disk failure')):
                with self.assertRaises(sqlite3.OperationalError):
                    self.save(operation, step)
            self.assertEqual(before, self.state())

    def test_project_icon_choices_validate_and_preserve_unedited_fields(self):
        project, _, _ = self.setup_step()
        self.assertEqual(self.state()['projects'][0]['icon'], 'folder')
        before = self.state()['projects'][0]
        for icon in sorted(service.PROJECT_ICONS):
            result = self.save('update_project', project, icon=icon)
            saved = result['data']['projects'][0]
            self.assertEqual(saved['icon'], icon)
            for key in ('title', 'description', 'next_action', 'status', 'position', 'created_at'):
                self.assertEqual(saved[key], before[key])
            self.assertEqual(result['data']['entries'][-1]['action'], 'icon_updated')
        self.save('update_project', project, next_action='New next action')
        self.assertEqual(self.state()['projects'][0]['icon'], sorted(service.PROJECT_ICONS)[-1])
        self.save('update_project', project, icon='heart', next_action='Both changed')
        self.assertEqual(self.state()['entries'][-1]['action'], 'project_updated')
        chosen = self.save('create_project', title='Chosen icon', icon='code')['entity_id']
        self.assertEqual(next(p for p in self.state()['projects'] if p['id'] == chosen)['icon'], 'code')
        before = self.state()
        for invalid in ('not-an-icon', '<svg>', None, [], 7, ''):
            for operation, target, extra in [('update_project', project, {}), ('create_project', None, {'title': 'Invalid'})]:
                with self.subTest(invalid=invalid, operation=operation):
                    with self.assertRaises(service.AppError):
                        self.save(operation, target, icon=invalid, **extra)
                    self.assertEqual(before, self.state())
        with self.assertRaises(service.AppError):
            self.save('update_project', project)
        with patch('tracker.service.insert_event', side_effect=sqlite3.OperationalError('simulated disk failure')):
            with self.assertRaises(sqlite3.OperationalError):
                self.save('update_project', project, icon='award')
        self.assertEqual(before, self.state())

    def version_one_copy(self):
        """Build a genuine old-schema fixture from isolated test records."""
        old = Path(self.temp.name) / 'version-one.sqlite3'
        con = sqlite3.connect(old)
        con.executescript(Path(storage.__file__).with_name('schema.sql').read_text())
        source = storage.connect(self.database)
        for table in ('projects', 'goals', 'steps', 'entries'):
            columns = [r[1] for r in con.execute('PRAGMA table_info(' + table + ')')]
            for row in source.execute('SELECT ' + ','.join(columns) + ' FROM ' + table):
                con.execute('INSERT INTO ' + table + ' (' + ','.join(columns) + ') VALUES (' + ','.join('?' for _ in columns) + ')', tuple(row))
        meta = source.execute('SELECT revision,language FROM app_meta').fetchone()
        con.execute('UPDATE app_meta SET revision=?,language=?', tuple(meta))
        con.commit()
        source.close()
        con.close()
        return old

    def test_v1_migration_preserves_existing_work_and_is_idempotent(self):
        _, _, step = self.setup_step()
        self.save('complete_step', step, status='completed')
        self.save('add_step_note', step, text='Migration context')
        old = self.version_one_copy()
        before = storage.read_state(old)
        storage.initialize(old)
        migrated = storage.read_state(old)
        for table in ('projects', 'steps'):
            for original, current in zip(before[table], migrated[table]):
                self.assertTrue(all(current[key] == value for key, value in original.items()))
        self.assertEqual(migrated['projects'][0]['icon'], 'folder')
        self.assertIsNone(migrated['steps'][0]['archived_at'])
        for key in ('goals', 'entries', 'revision', 'settings'):
            self.assertEqual(before[key], migrated[key])
        con = storage.connect(old)
        self.assertEqual(con.execute('PRAGMA user_version').fetchone()[0], 2)
        self.assertEqual(con.execute('SELECT schema_version FROM app_meta').fetchone()[0], 2)
        con.close()
        storage.initialize(old)
        self.assertEqual(migrated, storage.read_state(old))

    def test_migration_mismatch_and_partial_failure_roll_back(self):
        self.setup_step()
        old = self.version_one_copy()
        con = storage.connect(old)
        con.execute('UPDATE app_meta SET schema_version=2')
        con.close()
        with self.assertRaises(RuntimeError):
            storage.initialize(old)
        con = storage.connect(old)
        self.assertNotIn('archived_at', [r[1] for r in con.execute('PRAGMA table_info(steps)')])
        con.execute('UPDATE app_meta SET schema_version=1')
        # Duplicate icon column forces failure after the first ALTER.
        con.execute("ALTER TABLE projects ADD COLUMN icon TEXT DEFAULT 'folder'")
        con.close()
        with self.assertRaises(sqlite3.OperationalError):
            storage.initialize(old)
        con = storage.connect(old)
        self.assertNotIn('archived_at', [r[1] for r in con.execute('PRAGMA table_info(steps)')])
        self.assertEqual(con.execute('PRAGMA user_version').fetchone()[0], 1)
        self.assertEqual(con.execute('SELECT schema_version FROM app_meta').fetchone()[0], 1)
        self.assertEqual(con.execute('SELECT count(*) FROM projects').fetchone()[0], 1)
        con.close()

    def test_status_and_event_both_rollback_if_event_write_fails(self):
        _, _, step = self.setup_step()
        before = self.state()
        with patch('tracker.service.insert_event', side_effect=sqlite3.OperationalError('simulated disk failure')):
            with self.assertRaises(sqlite3.OperationalError):
                self.save('complete_step', step, status='completed')
        self.assertEqual(before, self.state())

    def test_new_python_process_reads_saved_ids_and_achievement(self):
        project, goal, step = self.setup_step()
        self.save('complete_step', step, status='completed')
        expected = self.state()
        result = subprocess.run(
            [sys.executable, '-c',
             'import json,sys; from tracker import storage; storage.initialize(sys.argv[1]); print(json.dumps(storage.read_state(sys.argv[1])))',
             str(self.database)],
            cwd=Path(__file__).resolve().parent.parent, capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout), expected)

    def test_creation_rolls_back_if_event_write_fails(self):
        with patch('tracker.service.insert_event', side_effect=sqlite3.OperationalError('simulated disk failure')):
            with self.assertRaises(sqlite3.OperationalError):
                self.save('create_project', title='Never committed')
        self.assertEqual(self.state()['revision'], 0)
        self.assertEqual(self.state()['projects'], [])

    def test_retry_returns_latest_state_without_duplicate_achievement(self):
        _, goal, step = self.setup_step()
        body = {'expected_revision': self.state()['revision'], 'request_id': str(uuid.uuid4()), 'status': 'completed'}
        first = service.mutate(self.database, 'complete_step', body, step)
        self.save('create_step', goal_id=goal, title='Later new work')
        retry = service.mutate(self.database, 'complete_step', body, step)
        self.assertGreater(retry['revision'], first['revision'])
        self.assertEqual(retry['entity_id'], step)
        self.assertEqual(sum(entry['action'] == 'step_completed' for entry in retry['data']['entries']), 1)
        self.assertEqual(len(retry['data']['steps']), 2)

    def test_conflicting_reuse_of_request_id_rejected_before_stale_revision(self):
        body = {'expected_revision': 0, 'request_id': str(uuid.uuid4()), 'title': 'First'}
        service.mutate(self.database, 'create_project', body)
        before = self.state()
        with self.assertRaises(service.AppError) as caught:
            service.mutate(self.database, 'create_project', {**body, 'title': 'Changed'})
        self.assertEqual(caught.exception.code, 'request_conflict')
        self.assertEqual(before, self.state())

    def test_stale_revision_does_not_write(self):
        self.save('create_project', title='First')
        before = self.state()
        with self.assertRaises(service.AppError) as caught:
            service.mutate(self.database, 'create_project', {'expected_revision': 0, 'request_id': str(uuid.uuid4()), 'title': 'Stale'})
        self.assertEqual(caught.exception.code, 'stale_revision')
        self.assertEqual(before, self.state())

    def test_invalid_references_and_empty_titles_do_not_write(self):
        for operation, fields, code in [
            ('create_goal', {'project_id': str(uuid.uuid4()), 'title': 'Orphan'}, 'not_found'),
            ('create_step', {'goal_id': 'not-a-uuid', 'title': 'Orphan'}, 'invalid_input'),
            ('create_project', {'title': '  \n '}, 'invalid_input'),
            ('create_project', {'title': ['Not text']}, 'invalid_input'),
            ('create_project', {'title': 'Valid', 'unknown': 'field'}, 'invalid_input'),
        ]:
            with self.subTest(operation=operation, fields=fields):
                with self.assertRaises(service.AppError) as caught:
                    self.save(operation, **fields)
                self.assertEqual(caught.exception.code, code)
                self.assertEqual(self.state()['revision'], 0)

    def test_foreign_keys_reject_orphan_even_without_service(self):
        connection = storage.connect(self.database)
        self.addCleanup(connection.close)
        with self.assertRaises(sqlite3.IntegrityError):
            connection.execute('INSERT INTO goals (id,project_id,title,position,created_at,updated_at) VALUES (?,?,?,?,?,?)',
                               (str(uuid.uuid4()), str(uuid.uuid4()), 'Orphan', 0, service.now(), service.now()))

    def test_completion_twice_with_different_requests_adds_no_second_event(self):
        _, _, step = self.setup_step()
        self.save('complete_step', step, status='completed')
        before = self.state()
        with self.assertRaises(service.AppError):
            self.save('complete_step', step, status='completed')
        self.assertEqual(before, self.state())

    def test_literal_unicode_and_earlier_completion_preserved(self):
        project, goal, step = self.setup_step()
        title = '<script>alert("literal")</script> عمل مستقل'
        self.save('create_step', goal_id=goal, title=title)
        self.save('complete_step', step, status='completed', completion_at='2026-01-02T12:00:00+03:00')
        state = self.state()
        self.assertEqual(state['steps'][1]['title'], title)
        event = next(entry for entry in state['entries'] if entry['action'] == 'step_completed')
        self.assertEqual(event['occurred_at'], '2026-01-02T09:00:00Z')
        self.assertNotEqual(event['recorded_at'], event['occurred_at'])
        self.assertEqual(event['details']['project_title'], 'Fictional studio')

    def test_unsupported_existing_schema_is_never_reset(self):
        self.save('create_project', title='Preserve me')
        connection = storage.connect(self.database)
        connection.execute('PRAGMA user_version=99')
        connection.close()
        with self.assertRaises(RuntimeError):
            storage.initialize(self.database)
        self.assertEqual(self.state()['projects'][0]['title'], 'Preserve me')


if __name__ == '__main__':
    unittest.main()
