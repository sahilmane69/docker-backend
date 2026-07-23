const express = require('express');
const os = require('os');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ---- In-memory "database" (just an array — resets when the container restarts) ----
let todos = [
  { id: 1, text: 'Learn Docker', done: false },
  { id: 2, text: 'Build an image', done: false },
];
let nextId = 3;

// ---- Basic health check / hello route ----
// hostname will change every time you rebuild/restart the container —
// great way to *see* that you're running inside an isolated container.
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from inside a Docker container! 🐳',
    hostname: os.hostname(),
  });
});

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.get('/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id, 10));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

app.post('/todos', (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text is required' });
  const todo = { id: nextId++, text, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.delete('/todos/:id', (req, res) => {
  const before = todos.length;
  todos = todos.filter((t) => t.id !== parseInt(req.params.id, 10));
  if (todos.length === before) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.status(204).send();
});

// ---- BONUS: Redis-backed visit counter ----
// This is only active if a REDIS_URL env var is set (e.g. by docker-compose).
// It exists to teach multi-container networking — see docker-compose.yml.
let redisClient = null;
let redisReady = false;

async function initRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log('No REDIS_URL set — /visits endpoint disabled (single-container mode).');
    return;
  }
  try {
    const redis = require('redis');
    redisClient = redis.createClient({ url });
    redisClient.on('error', (err) => console.log('Redis error:', err.message));
    await redisClient.connect();
    redisReady = true;
    console.log('Connected to Redis at', url);
  } catch (err) {
    console.log('Could not connect to Redis:', err.message);
  }
}
initRedis();

app.get('/visits', async (req, res) => {
  if (!redisReady) {
    return res.status(503).json({
      error: 'Redis not connected. Run this with docker-compose to enable this endpoint.',
    });
  }
  const visits = await redisClient.incr('visits');
  res.json({ visits });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
