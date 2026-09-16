process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/index');
const { db } = require('../src/db/connection');
const { createSchema } = require('../src/db/schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Test User', 'test@example.com');
  db.prepare('INSERT INTO projects (id, name) VALUES (1, ?)').run('Test Project');
});

describe('GET /tags', () => {
  test('returns empty array when no tags', async () => {
    const res = await request(app).get('/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all tags ordered by name', async () => {
    db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    db.prepare("INSERT INTO tags (name) VALUES ('backend')").run();
    const res = await request(app).get('/tags');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t) => t.name)).toEqual(['backend', 'urgent']);
  });
});

describe('POST /tags', () => {
  test('creates a tag with valid name', async () => {
    const res = await request(app).post('/tags').send({ name: 'urgent' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('urgent');
    expect(res.body.id).toBeDefined();
  });

  test('normalizes tag name to lowercase', async () => {
    const res = await request(app).post('/tags').send({ name: 'Urgent' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('urgent');
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app).post('/tags').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 409 when tag name already exists', async () => {
    await request(app).post('/tags').send({ name: 'urgent' });
    const res = await request(app).post('/tags').send({ name: 'urgent' });
    expect(res.status).toBe(409);
  });
});

describe('POST /tasks/:id/tags', () => {
  test('applies an existing tag to a task', async () => {
    const task = db.prepare("INSERT INTO tasks (title) VALUES ('Tag Me')").run();
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();

    const res = await request(app)
      .post(`/tasks/${task.lastInsertRowid}/tags`)
      .send({ tag_id: tag.lastInsertRowid });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ task_id: task.lastInsertRowid, tag_id: tag.lastInsertRowid });
  });

  test('returns 404 when the task does not exist', async () => {
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    const res = await request(app)
      .post('/tasks/99999/tags')
      .send({ tag_id: tag.lastInsertRowid });
    expect(res.status).toBe(404);
  });

  test('returns 404 when the tag does not exist', async () => {
    const task = db.prepare("INSERT INTO tasks (title) VALUES ('Tag Me')").run();
    const res = await request(app)
      .post(`/tasks/${task.lastInsertRowid}/tags`)
      .send({ tag_id: 99999 });
    expect(res.status).toBe(404);
  });

  test('returns 409 when the tag is already applied to the task', async () => {
    const task = db.prepare("INSERT INTO tasks (title) VALUES ('Tag Me')").run();
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(task.lastInsertRowid, tag.lastInsertRowid);

    const res = await request(app)
      .post(`/tasks/${task.lastInsertRowid}/tags`)
      .send({ tag_id: tag.lastInsertRowid });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /tasks/:id/tags/:tagId', () => {
  test('removes a tag from a task', async () => {
    const task = db.prepare("INSERT INTO tasks (title) VALUES ('Untag Me')").run();
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(task.lastInsertRowid, tag.lastInsertRowid);

    const res = await request(app).delete(`/tasks/${task.lastInsertRowid}/tags/${tag.lastInsertRowid}`);
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);

    const taskRes = await request(app).get(`/tasks/${task.lastInsertRowid}`);
    expect(taskRes.body.tags).toEqual([]);
  });

  test('returns 404 when the tag is not applied to the task', async () => {
    const task = db.prepare("INSERT INTO tasks (title) VALUES ('Untag Me')").run();
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();

    const res = await request(app).delete(`/tasks/${task.lastInsertRowid}/tags/${tag.lastInsertRowid}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /tasks?tag=', () => {
  test('returns only tasks with the given tag', async () => {
    const taskA = db.prepare("INSERT INTO tasks (title) VALUES ('Tagged Task')").run();
    const taskB = db.prepare("INSERT INTO tasks (title) VALUES ('Untagged Task')").run();
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskA.lastInsertRowid, tag.lastInsertRowid);

    const res = await request(app).get('/tasks?tag=urgent');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(taskA.lastInsertRowid);
  });

  test('is case-insensitive with respect to tag name casing', async () => {
    const task = db.prepare("INSERT INTO tasks (title) VALUES ('Tagged Task')").run();
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(task.lastInsertRowid, tag.lastInsertRowid);

    const res = await request(app).get('/tasks?tag=URGENT');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('returns an empty array when no task has the given tag', async () => {
    db.prepare("INSERT INTO tasks (title) VALUES ('Untagged Task')").run();
    db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();

    const res = await request(app).get('/tasks?tag=urgent');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('combines with the status filter', async () => {
    const taskA = db.prepare("INSERT INTO tasks (title, status) VALUES ('Active Tagged', 'active')").run();
    const taskB = db.prepare("INSERT INTO tasks (title, status) VALUES ('Completed Tagged', 'completed')").run();
    const tag = db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskA.lastInsertRowid, tag.lastInsertRowid);
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskB.lastInsertRowid, tag.lastInsertRowid);

    const res = await request(app).get('/tasks?tag=urgent&status=active');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(taskA.lastInsertRowid);
  });
});
