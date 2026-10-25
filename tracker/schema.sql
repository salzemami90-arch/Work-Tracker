CREATE TABLE projects (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused')),
    pause_reason TEXT NOT NULL DEFAULT '', next_action TEXT NOT NULL DEFAULT '',
    due_date TEXT, position INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE goals (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed')),
    due_date TEXT, position INTEGER NOT NULL, completed_at TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE steps (
    id TEXT PRIMARY KEY, goal_id TEXT NOT NULL REFERENCES goals(id),
    title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','deferred')),
    planned_for TEXT, due_date TEXT, position INTEGER NOT NULL, completed_at TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE entries (
    id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id), goal_id TEXT REFERENCES goals(id),
    step_id TEXT REFERENCES steps(id), kind TEXT NOT NULL CHECK(kind IN ('summary','issue','note','event')),
    action TEXT, text TEXT NOT NULL, agent_name TEXT,
    occurred_at TEXT NOT NULL, recorded_at TEXT NOT NULL,
    details_json TEXT NOT NULL, request_id TEXT UNIQUE
);
CREATE TABLE app_meta (
    singleton INTEGER PRIMARY KEY CHECK(singleton=1), schema_version INTEGER NOT NULL,
    revision INTEGER NOT NULL, language TEXT NOT NULL CHECK(language IN ('en','ar'))
);
CREATE INDEX goals_project ON goals(project_id, position);
CREATE INDEX steps_goal ON steps(goal_id, position);
CREATE INDEX entries_project_time ON entries(project_id, occurred_at, recorded_at);
INSERT INTO app_meta VALUES (1,1,0,'en');
PRAGMA user_version=1;
