"""Local work operations with immutable history and optimistic revision checks."""

from datetime import datetime, timezone
import hashlib
import json
import uuid

from . import storage

PROJECT_ICONS = frozenset(('folder', 'chart', 'spark', 'award', 'document', 'book', 'code', 'heart'))


class AppError(Exception):
    def __init__(self, code, status=400, fields=None):
        super().__init__(code)
        self.code, self.status, self.fields = code, status, fields or {}


def now():
    return datetime.now(timezone.utc).isoformat(timespec='microseconds').replace('+00:00', 'Z')


def valid_id(value, field):
    try:
        if not isinstance(value, str) or str(uuid.UUID(value)) != value:
            raise ValueError
    except (ValueError, AttributeError):
        raise AppError('invalid_input', fields={field: 'invalid_id'}) from None
    return value


def text_field(body, name, required=False):
    value = body.get(name, '')
    if not isinstance(value, str):
        raise AppError('invalid_input', fields={name: 'invalid_text'})
    if required and not value.strip():
        raise AppError('invalid_input', fields={name: 'required'})
    return value.strip() if name == 'title' else value


def project_icon(body):
    value = body.get('icon', 'folder')
    if not isinstance(value, str) or value not in PROJECT_ICONS:
        raise AppError('invalid_input', fields={'icon': 'invalid_icon'})
    return value


def lookup(connection, table, entity_id, field='id'):
    valid_id(entity_id, field)
    row = connection.execute(f'SELECT * FROM {table} WHERE id=?', (entity_id,)).fetchone()
    if row is None:
        raise AppError('not_found', 404, {field: 'not_found'})
    return dict(row)


def insert_event(connection, event):
    """Separate function is also the fault-injection seam for atomicity tests."""
    columns = ','.join(event)
    placeholders = ','.join('?' for _ in event)
    connection.execute(f'INSERT INTO entries ({columns}) VALUES ({placeholders})', tuple(event.values()))


def mutate(database, operation, body, entity_id=None):
    if not isinstance(body, dict):
        raise AppError('invalid_input', fields={'form': 'invalid_json'})
    request_id = valid_id(body.get('request_id'), 'request_id')
    revision = body.get('expected_revision')
    if type(revision) is not int or revision < 0:
        raise AppError('invalid_input', fields={'expected_revision': 'invalid_revision'})
    allowed = {
        'create_project': {'title', 'description', 'next_action', 'icon'},
        'create_goal': {'project_id', 'title', 'description'},
        'create_step': {'goal_id', 'title', 'description'},
        'update_project': {'next_action', 'icon'},
        'complete_step': {'status', 'completion_at'},
        'add_step_note': {'text', 'occurred_at'},
        'archive_step': set(),
        'restore_step': set(),
        'rename_goal': {'title'},
        'rename_step': {'title'},
        'move_step': {'goal_id'},
        'settings': {'language'},
    }
    unknown = set(body) - allowed[operation] - {'request_id', 'expected_revision', 'reason', 'agent_name'}
    if unknown:
        raise AppError('invalid_input', fields={key: 'unsupported_field' for key in sorted(unknown)})
    reason, helper = text_field(body, 'reason'), text_field(body, 'agent_name')
    fingerprint_data = {'operation': operation, 'entity_id': entity_id,
                        'payload': {key: value for key, value in body.items()
                                    if key not in ('request_id', 'expected_revision')}}
    fingerprint = hashlib.sha256(json.dumps(fingerprint_data, ensure_ascii=False, sort_keys=True,
                                           separators=(',', ':')).encode()).hexdigest()
    connection = storage.connect(database)
    try:
        connection.execute('BEGIN IMMEDIATE')
        duplicate = connection.execute('SELECT details_json FROM entries WHERE request_id=?', (request_id,)).fetchone()
        if duplicate:
            prior = json.loads(duplicate['details_json'])['_request']
            if prior['fingerprint'] != fingerprint:
                raise AppError('request_conflict', 409)
            result = storage.state(connection)
            connection.commit()
            return {'ok': True, 'revision': result['revision'], 'data': result, 'entity_id': prior['entity_id']}
        current = connection.execute('SELECT revision FROM app_meta WHERE singleton=1').fetchone()[0]
        if revision != current:
            raise AppError('stale_revision', 409)
        timestamp = now()
        occurred_at = timestamp
        project_id = goal_id = step_id = None
        before = None
        entity_type = operation.split('_')[-1]
        if operation.startswith('create_'):
            entity_id = str(uuid.uuid4())
            table = entity_type + 's'
            values = {'id': entity_id, 'title': text_field(body, 'title', required=True),
                      'description': text_field(body, 'description'), 'created_at': timestamp,
                      'updated_at': timestamp}
            if entity_type == 'project':
                project_id = entity_id
                values['next_action'] = text_field(body, 'next_action')
                values['icon'] = project_icon(body)
                siblings = connection.execute('SELECT COALESCE(MAX(position),-1)+1 FROM projects').fetchone()[0]
            elif entity_type == 'goal':
                parent = lookup(connection, 'projects', body.get('project_id'), 'project_id')
                project_id, goal_id = parent['id'], entity_id
                values['project_id'] = project_id
                siblings = connection.execute('SELECT COALESCE(MAX(position),-1)+1 FROM goals WHERE project_id=?', (project_id,)).fetchone()[0]
            else:
                parent = lookup(connection, 'goals', body.get('goal_id'), 'goal_id')
                project_id, goal_id, step_id = parent['project_id'], parent['id'], entity_id
                values['goal_id'] = goal_id
                siblings = connection.execute('SELECT COALESCE(MAX(position),-1)+1 FROM steps WHERE goal_id=?', (goal_id,)).fetchone()[0]
            values['position'] = siblings
            connection.execute(f"INSERT INTO {table} ({','.join(values)}) VALUES ({','.join('?' for _ in values)})", tuple(values.values()))
            after = lookup(connection, table, entity_id)
            action = entity_type + '_created'
        elif operation == 'update_project':
            before = lookup(connection, 'projects', entity_id)
            fields = {key for key in ('next_action', 'icon') if key in body}
            if not fields:
                raise AppError('invalid_input', fields={'form': 'missing_change'})
            project_id = entity_id
            values = {}
            if 'next_action' in fields:
                values['next_action'] = text_field(body, 'next_action')
            if 'icon' in fields:
                values['icon'] = project_icon(body)
            values['updated_at'] = timestamp
            connection.execute(f"UPDATE projects SET {','.join(key + '=?' for key in values)} WHERE id=?",
                               (*values.values(), entity_id))
            after = lookup(connection, 'projects', entity_id)
            action = 'icon_updated' if fields == {'icon'} else 'next_action_updated' if fields == {'next_action'} else 'project_updated'
        elif operation in ('rename_goal', 'rename_step'):
            table = 'goals' if operation == 'rename_goal' else 'steps'
            before = lookup(connection, table, entity_id)
            title = text_field(body, 'title', required=True)
            if operation == 'rename_goal':
                project_id, goal_id = before['project_id'], entity_id
            else:
                parent = lookup(connection, 'goals', before['goal_id'])
                project_id, goal_id, step_id = parent['project_id'], parent['id'], entity_id
            connection.execute(f'UPDATE {table} SET title=?,updated_at=? WHERE id=?',
                               (title, timestamp, entity_id))
            after = lookup(connection, table, entity_id)
            action = entity_type + '_renamed'
        elif operation == 'move_step':
            before = lookup(connection, 'steps', entity_id)
            source_goal = lookup(connection, 'goals', before['goal_id'])
            target_goal = lookup(connection, 'goals', body.get('goal_id'), 'goal_id')
            if target_goal['project_id'] != source_goal['project_id']:
                raise AppError('invalid_input', fields={'goal_id': 'different_project'})
            if target_goal['id'] == source_goal['id']:
                raise AppError('invalid_input', fields={'goal_id': 'same_goal'})
            project_id, goal_id, step_id = source_goal['project_id'], target_goal['id'], entity_id
            position = connection.execute('SELECT COALESCE(MAX(position),-1)+1 FROM steps WHERE goal_id=?',
                                          (goal_id,)).fetchone()[0]
            connection.execute('UPDATE steps SET goal_id=?,position=?,updated_at=? WHERE id=?',
                               (goal_id, position, timestamp, entity_id))
            after = lookup(connection, 'steps', entity_id)
            action = 'step_moved'
        elif operation == 'complete_step':
            before = lookup(connection, 'steps', entity_id)
            if before['archived_at'] is not None:
                raise AppError('invalid_input', fields={'status': 'step_archived'})
            if body.get('status') != 'completed':
                raise AppError('invalid_input', fields={'status': 'invalid_status'})
            if before['status'] == 'completed':
                raise AppError('invalid_input', fields={'status': 'already_completed'})
            if 'completion_at' in body:
                try:
                    supplied = body['completion_at']
                    if not isinstance(supplied, str):
                        raise ValueError
                    parsed = datetime.fromisoformat(supplied.replace('Z', '+00:00'))
                    if parsed.tzinfo is None:
                        raise ValueError
                    occurred_at = parsed.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
                except (ValueError, TypeError):
                    raise AppError('invalid_input', fields={'completion_at': 'invalid_date'}) from None
            parent = lookup(connection, 'goals', before['goal_id'])
            project_id, goal_id, step_id = parent['project_id'], parent['id'], entity_id
            connection.execute("UPDATE steps SET status='completed',completed_at=?,updated_at=? WHERE id=?",
                               (occurred_at, timestamp, entity_id))
            after = lookup(connection, 'steps', entity_id)
            action = 'step_completed'
        elif operation in ('archive_step', 'restore_step'):
            before = lookup(connection, 'steps', entity_id)
            archived = before['archived_at'] is not None
            if (operation == 'archive_step') == archived:
                raise AppError('invalid_input', fields={'step': 'already_archived' if archived else 'not_archived'})
            parent = lookup(connection, 'goals', before['goal_id'])
            project_id, goal_id, step_id = parent['project_id'], parent['id'], entity_id
            connection.execute('UPDATE steps SET archived_at=?,updated_at=? WHERE id=?',
                               (timestamp if operation == 'archive_step' else None, timestamp, entity_id))
            after = lookup(connection, 'steps', entity_id)
            action = 'step_archived' if operation == 'archive_step' else 'step_restored'
        elif operation == 'add_step_note':
            after = lookup(connection, 'steps', entity_id, 'step_id')
            parent = lookup(connection, 'goals', after['goal_id'])
            project_id, goal_id, step_id = parent['project_id'], parent['id'], entity_id
            reason = text_field(body, 'text', required=True)
            supplied = body.get('occurred_at')
            if supplied is not None:
                try:
                    if not isinstance(supplied, str):
                        raise ValueError
                    parsed = datetime.fromisoformat(supplied.replace('Z', '+00:00'))
                    if parsed.tzinfo is None:
                        raise ValueError
                    occurred_at = parsed.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
                except (ValueError, TypeError, OverflowError):
                    raise AppError('invalid_input', fields={'occurred_at': 'invalid_date'}) from None
            # Notes add context; they never rewrite the step or its achievement.
            action, entity_type = 'note_added', 'step'
        else:
            language = body.get('language')
            if language not in ('en', 'ar'):
                raise AppError('invalid_input', fields={'language': 'invalid_language'})
            before = {'language': connection.execute('SELECT language FROM app_meta WHERE singleton=1').fetchone()[0]}
            connection.execute('UPDATE app_meta SET language=? WHERE singleton=1', (language,))
            after, action, entity_type = {'language': language}, 'language_changed', 'settings'
        details = {'entity_type': entity_type, 'entity_id': entity_id, 'title': after.get('title'),
                   'before': before, 'after': after,
                   '_request': {'fingerprint': fingerprint, 'entity_id': entity_id}}
        if operation == 'move_step':
            details['source_goal'] = {'id': source_goal['id'], 'title': source_goal['title']}
            details['destination_goal'] = {'id': target_goal['id'], 'title': target_goal['title']}
        if project_id:
            details['project_title'] = lookup(connection, 'projects', project_id)['title']
        if goal_id:
            details['goal_title'] = lookup(connection, 'goals', goal_id)['title']
        insert_event(connection, {'id': str(uuid.uuid4()), 'project_id': project_id, 'goal_id': goal_id,
                                 'step_id': step_id, 'kind': 'note' if operation == 'add_step_note' else 'event', 'action': action, 'text': reason,
                                 'agent_name': helper or None, 'occurred_at': occurred_at,
                                 'recorded_at': timestamp, 'details_json': json.dumps(details, ensure_ascii=False),
                                 'request_id': request_id})
        connection.execute('UPDATE app_meta SET revision=revision+1 WHERE singleton=1')
        result = storage.state(connection)
        connection.commit()
        return {'ok': True, 'revision': result['revision'], 'data': result, 'entity_id': entity_id}
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
