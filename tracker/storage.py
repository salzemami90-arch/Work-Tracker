"""SQLite storage: never reset existing data, and transact plan plus history together."""

import json
import sqlite3
from contextlib import closing
from pathlib import Path


def connect(database):
    connection = sqlite3.connect(database, timeout=5, isolation_level=None)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys=ON')
    return connection


def initialize(database):
    database = Path(database)
    database.parent.mkdir(parents=True, exist_ok=True)
    with closing(connect(database)) as connection:
        try:
            connection.execute('BEGIN EXCLUSIVE')
            version = connection.execute('PRAGMA user_version').fetchone()[0]
            if version == 0:
                existing = connection.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
                if existing:
                    raise RuntimeError('Unrecognized database schema; existing data was not changed.')
                # execute individually: executescript implicitly commits an active transaction.
                for statement in Path(__file__).with_name('schema.sql').read_text().split(';'):
                    if statement.strip():
                        connection.execute(statement)
                version = 1
            elif version not in (1, 2):
                raise RuntimeError('Unsupported database version; existing data was not changed.')
            meta = connection.execute('SELECT schema_version FROM app_meta WHERE singleton=1').fetchone()
            if not meta or meta['schema_version'] != version:
                raise RuntimeError('Invalid database metadata; existing data was not changed.')
            if version == 1:
                # Additive migration: preserve IDs, work, notes, dates, and history.
                connection.execute('ALTER TABLE steps ADD COLUMN archived_at TEXT')
                connection.execute("ALTER TABLE projects ADD COLUMN icon TEXT NOT NULL DEFAULT 'folder'")
                connection.execute('UPDATE app_meta SET schema_version=2 WHERE singleton=1')
                connection.execute('PRAGMA user_version=2')
            connection.commit()
        except Exception:
            connection.rollback()
            raise


def state(connection):
    """Caller owns a transaction so all tables belong to the same revision."""
    meta = connection.execute('SELECT revision,language FROM app_meta WHERE singleton=1').fetchone()
    result = {'revision': meta['revision'], 'settings': {'language': meta['language']}}
    for table in ('projects', 'goals', 'steps', 'entries'):
        order = 'occurred_at, recorded_at, rowid' if table == 'entries' else 'position, created_at, rowid'
        result[table] = [dict(row) for row in connection.execute(f'SELECT * FROM {table} ORDER BY {order}')]
    for entry in result['entries']:
        details = json.loads(entry.pop('details_json'))
        # Internal retry fingerprints are not user-facing history.
        details.pop('_request', None)
        entry['details'] = details
    return result


def read_state(database):
    connection = connect(database)
    try:
        connection.execute('BEGIN')
        result = state(connection)
        connection.commit()
        return result
    finally:
        connection.close()
