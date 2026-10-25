"""Editing and moving preserve identity, achievements, and historical context."""
from pathlib import Path
import json
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import uuid

from tracker import service, storage


class EditMoveTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.database = Path(self.temp.name) / 'tracker.sqlite3'
        storage.initialize(self.database)
        self.project = self.save('create_project', title='Fictional workshop')['entity_id']
        self.source = self.save('create_goal', project_id=self.project, title='First release')['entity_id']
        self.target = self.save('create_goal', project_id=self.project, title='Later release')['entity_id']
        self.step = self.save('create_step', goal_id=self.source, title='Draft instructions')['entity_id']

    def state(self):
        return storage.read_state(self.database)

    def save(self, operation, entity_id=None, **fields):
        return service.mutate(self.database, operation, {
            'expected_revision': self.state()['revision'], 'request_id': str(uuid.uuid4()), **fields
        }, entity_id)

    def test_completed_step_names_move_notes_and_history_survive_new_process(self):
        self.save('complete_step', self.step, status='completed', completion_at='2026-10-20T09:30:00Z')
        self.save('add_step_note', self.step, text='Earlier discovery')
        original = self.state()
        original_step = original['steps'][0]
        self.save('rename_goal', self.source, title='النشر الأول', reason='Clarify the result')
        self.save('rename_step', self.step, title='Write <script> literally', reason='More precise')
        self.save('create_step', goal_id=self.target, title='Existing destination step')
        self.save('move_step', self.step, goal_id=self.target, reason='Belongs after release')
        self.save('rename_goal', self.target, title='Next version')
        self.save('add_step_note', self.step, text='Discovery after the move')
        state = self.state()
        step = next(s for s in state['steps'] if s['id'] == self.step)
        for key in ('id', 'status', 'completed_at', 'created_at', 'description', 'archived_at', 'planned_for', 'due_date'):
            self.assertEqual(step[key], original_step[key])
        self.assertEqual(step['goal_id'], self.target)
        self.assertEqual(step['position'], 1)
        self.assertEqual(step['title'], 'Write <script> literally')
        self.assertEqual(state['entries'][:len(original['entries'])], original['entries'])
        notes = [e for e in state['entries'] if e['kind'] == 'note']
        self.assertEqual([e['goal_id'] for e in notes], [self.source, self.target])
        self.assertTrue(all(e['step_id'] == self.step for e in notes))
        move = next(e for e in state['entries'] if e['action'] == 'step_moved')
        self.assertEqual(move['details']['source_goal'], {'id': self.source, 'title': 'النشر الأول'})
        self.assertEqual(move['details']['destination_goal'], {'id': self.target, 'title': 'Later release'})
        self.assertEqual(move['text'], 'Belongs after release')
        rename = next(e for e in state['entries'] if e['action'] == 'step_renamed')
        self.assertEqual(rename['details']['before']['title'], 'Draft instructions')
        self.assertEqual(rename['details']['after']['title'], step['title'])
        code = 'from tracker.storage import read_state; import json,sys; print(json.dumps(read_state(sys.argv[1])))'
        loaded = json.loads(subprocess.check_output([sys.executable, '-c', code, str(self.database)]))
        self.assertEqual(loaded, state)

    def test_pending_and_removed_moves_preserve_status_and_removal(self):
        self.save('move_step', self.step, goal_id=self.target)
        self.assertEqual(self.state()['steps'][0]['status'], 'pending')
        self.save('archive_step', self.step)
        archived = self.state()['steps'][0]
        self.save('rename_step', self.step, title='Removed work renamed')
        self.save('move_step', self.step, goal_id=self.source)
        moved = self.state()['steps'][0]
        self.assertEqual(moved['archived_at'], archived['archived_at'])
        self.assertEqual(moved['status'], 'pending')
        self.save('restore_step', self.step)
        self.assertEqual(self.state()['steps'][0]['goal_id'], self.source)
        self.assertFalse(any(e['action'] == 'step_completed' for e in self.state()['entries']))

    def test_invalid_moves_and_titles_change_nothing(self):
        other = self.save('create_project', title='Other project')['entity_id']
        foreign = self.save('create_goal', project_id=other, title='Not a destination')['entity_id']
        for target in (self.source, foreign, str(uuid.uuid4()), 'invalid'):
            before = self.state()
            with self.assertRaises(service.AppError):
                self.save('move_step', self.step, goal_id=target)
            self.assertEqual(self.state(), before)
        for op, entity in (('rename_goal', self.source), ('rename_step', self.step)):
            for title in ('   ', None, 3):
                before = self.state()
                with self.assertRaises(service.AppError):
                    self.save(op, entity, title=title)
                self.assertEqual(self.state(), before)

    def test_retries_stale_edits_and_failed_history_are_atomic(self):
        body = {'expected_revision': self.state()['revision'], 'request_id': str(uuid.uuid4()), 'goal_id': self.target}
        service.mutate(self.database, 'move_step', body, self.step)
        saved = self.state()
        service.mutate(self.database, 'move_step', body, self.step)
        self.assertEqual(self.state(), saved)
        with self.assertRaises(service.AppError) as raised:
            service.mutate(self.database, 'move_step', {**body, 'goal_id': self.source}, self.step)
        self.assertEqual(raised.exception.code, 'request_conflict')
        # A valid stale request must also be rejected without changing saved work.
        with self.assertRaises(service.AppError) as raised:
            service.mutate(self.database, 'rename_step', {'expected_revision': body['expected_revision'], 'request_id': str(uuid.uuid4()), 'title': 'Stale'}, self.step)
        self.assertEqual(raised.exception.code, 'stale_revision')
        for operation, fields in (('move_step', {'goal_id': self.source}), ('rename_step', {'title': 'Unsaved'}), ('rename_goal', {'title': 'Unsaved'})):
            with patch('tracker.service.insert_event', side_effect=RuntimeError('simulated write failure')):
                with self.assertRaises(RuntimeError):
                    self.save(operation, self.source if operation == 'rename_goal' else self.step, **fields)
            self.assertEqual(self.state(), saved)
