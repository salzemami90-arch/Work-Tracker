"""Loopback-only Flask routes and same-origin mutation protection."""

from pathlib import Path
import secrets
import sqlite3
from urllib.parse import urlsplit

from flask import Flask, jsonify, render_template, request
from werkzeug.exceptions import BadRequest

from . import service, storage

ROOT = Path(__file__).resolve().parent.parent


def create_app(data_dir=None, testing=False):
    app = Flask(__name__, template_folder=str(ROOT / 'templates'), static_folder=str(ROOT / 'static'))
    folder = Path(data_dir).expanduser().resolve() if data_dir else ROOT / 'data'
    demo_mode = folder == ROOT / 'qa' / 'demo-data'
    app.config.update(TESTING=testing, DATABASE=folder / 'tracker.sqlite3', REQUEST_TOKEN=secrets.token_urlsafe(32), DEMO_MODE=demo_mode)
    storage.initialize(app.config['DATABASE'])

    @app.before_request
    def protect_local_app():
        try:
            host = urlsplit('http://' + request.host)
            valid_host = host.hostname in ('127.0.0.1', 'localhost', '::1') and not host.username and not host.password
            if not valid_host:
                raise service.AppError('forbidden', 403)
            if request.method not in ('GET', 'HEAD', 'OPTIONS'):
                token = request.headers.get('X-Request-Token', '')
                if not secrets.compare_digest(token.encode(), app.config['REQUEST_TOKEN'].encode()):
                    raise service.AppError('forbidden', 403)
                origin = request.headers.get('Origin')
                if origin and origin != request.host_url.rstrip('/'):
                    raise service.AppError('forbidden', 403)
                if request.headers.get('Sec-Fetch-Site') == 'cross-site':
                    raise service.AppError('forbidden', 403)
                if not request.is_json:
                    raise service.AppError('invalid_input', fields={'form': 'invalid_json'})
        except ValueError:
            raise service.AppError('forbidden', 403) from None

    @app.after_request
    def response_headers(response):
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
        return response

    @app.errorhandler(service.AppError)
    def expected_error(error):
        return jsonify(ok=False, error={'code': error.code, 'fields': error.fields}), error.status

    @app.errorhandler(sqlite3.Error)
    @app.errorhandler(OSError)
    def storage_error(error):
        # Do not log content, SQL parameters, or private filesystem paths.
        app.logger.warning('Local storage operation failed (%s)', type(error).__name__)
        busy = isinstance(error, sqlite3.OperationalError) and getattr(error, 'sqlite_errorcode', None) in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED)
        return jsonify(ok=False, error={'code': 'save_failed', 'fields': {}}), 409 if busy else 503

    @app.errorhandler(BadRequest)
    def invalid_json(error):
        return jsonify(ok=False, error={'code': 'invalid_input', 'fields': {'form': 'invalid_json'}}), 400

    @app.get('/')
    def index():
        return render_template('index.html', request_token=app.config['REQUEST_TOKEN'], demo_mode=demo_mode)

    @app.get('/api/state')
    def get_state():
        result = storage.read_state(app.config['DATABASE'])
        result['demo_mode'] = demo_mode
        return jsonify(result)

    def operation(name, entity_id=None):
        result = service.mutate(app.config['DATABASE'], name, request.get_json(), entity_id)
        result['data']['demo_mode'] = demo_mode
        return jsonify(result)

    @app.post('/api/projects')
    def create_project():
        return operation('create_project')

    @app.post('/api/goals')
    def create_goal():
        return operation('create_goal')

    @app.post('/api/steps')
    def create_step():
        return operation('create_step')

    @app.patch('/api/projects/<entity_id>')
    def update_project(entity_id):
        return operation('update_project', entity_id)

    @app.patch('/api/steps/<entity_id>')
    def complete_step(entity_id):
        return operation('complete_step', entity_id)

    @app.patch('/api/goals/<entity_id>/title')
    def rename_goal(entity_id):
        return operation('rename_goal', entity_id)

    @app.patch('/api/steps/<entity_id>/title')
    def rename_step(entity_id):
        return operation('rename_step', entity_id)

    @app.post('/api/steps/<entity_id>/move')
    def move_step(entity_id):
        return operation('move_step', entity_id)

    @app.post('/api/steps/<entity_id>/notes')
    def add_step_note(entity_id):
        return operation('add_step_note', entity_id)

    @app.post('/api/steps/<entity_id>/archive')
    def archive_step(entity_id):
        return operation('archive_step', entity_id)

    @app.post('/api/steps/<entity_id>/restore')
    def restore_step(entity_id):
        return operation('restore_step', entity_id)

    @app.patch('/api/settings')
    def settings():
        return operation('settings')

    return app
