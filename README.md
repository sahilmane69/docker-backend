# docker-learn-backend

A tiny Express.js API, built specifically to help you learn Docker step by step.
No prior Docker experience needed.

## What's in here

```
docker-learn-backend/
├── src/server.js       # the app: a simple Todo API
├── package.json
├── package-lock.json
├── Dockerfile           # <-- Level 1: turns this app into an image
├── .dockerignore
├── docker-compose.yml   # <-- Level 2: runs app + Redis together
└── README.md
```

---

## Level 0 — Run it WITHOUT Docker (so you know what "normal" looks like)

```bash
npm install
npm start
```

Visit http://localhost:3000 — you should see a hello message.
Try http://localhost:3000/todos too.

Stop it with Ctrl+C. Now let's put it in a container.

---

## Level 1 — Build and run a single container

**1. Build the image.**

```bash
docker build -t docker-learn-backend .
```

- `-t docker-learn-backend` tags (names) the image so you can refer to it later.
- `.` tells Docker to use the current directory as the "build context" — the
  Dockerfile decides what gets copied in from there.

Watch the output — you'll see it execute each line of the Dockerfile as a
separate step ("layer").

**2. Run a container from that image.**

```bash
docker run -p 3000:3000 docker-learn-backend
```

- `-p 3000:3000` maps port 3000 on your machine to port 3000 inside the
  container (format is `host:container`). Without this, the app runs but you
  can't reach it from your browser.

Visit http://localhost:3000 again — same app, but now it's running fully
isolated inside a container. Refresh a few times and check the `hostname`
field: it's a random container ID, not your computer's name.

Stop it with Ctrl+C.

**3. Run it in the background, and give it a name.**

```bash
docker run -d -p 3000:3000 --name my-api docker-learn-backend
```

- `-d` = detached (runs in the background)
- `--name my-api` = easier to reference than a random container ID

Useful follow-up commands:

```bash
docker ps                 # list running containers
docker logs my-api        # see its console output
docker logs -f my-api     # follow logs live
docker stop my-api        # stop it
docker start my-api       # start it again
docker rm my-api          # remove the stopped container
```

**4. See the caching in action.**

Change the text of a todo in `src/server.js`, save it, then rebuild:

```bash
docker build -t docker-learn-backend .
```

Notice the `npm install` step says something like "CACHED" — because you only
changed application code, not `package.json`. This is *why* the Dockerfile
copies `package*.json` before the rest of the code (see the comments in the
Dockerfile itself).

---

## Level 2 — Two containers talking to each other (docker-compose)

Right now hitting `/visits` returns an error, because there's no Redis
around. Let's fix that by running the app *and* a Redis container together.

```bash
docker compose up --build
```

This reads `docker-compose.yml` and:
1. Builds your app image (same as `docker build`, done for you)
2. Pulls the official `redis` image from Docker Hub
3. Starts both containers on a shared private network
4. Wires them together — your app can reach Redis at the hostname `redis`
   (see `REDIS_URL=redis://redis:6379` in the compose file)

Now visit http://localhost:3000/visits and refresh a few times — the counter
persists in Redis across requests, even though your app is stateless.

Stop everything with Ctrl+C, or in another terminal:

```bash
docker compose down
```

**The big idea to take away from this level:** containers on the same
Docker network can reach each other by *service name*, like a mini private
DNS. You never hardcoded an IP address anywhere.

---

## Cheat sheet

| Command | What it does |
|---|---|
| `docker build -t NAME .` | Build an image from a Dockerfile |
| `docker images` | List images on your machine |
| `docker run -p HOST:CONTAINER IMAGE` | Run a container from an image |
| `docker ps` / `docker ps -a` | List running / all containers |
| `docker logs NAME` | View a container's output |
| `docker stop NAME` | Stop a running container |
| `docker rm NAME` | Delete a stopped container |
| `docker rmi NAME` | Delete an image |
| `docker exec -it NAME sh` | Open a shell inside a running container |
| `docker compose up --build` | Build and start everything in docker-compose.yml |
| `docker compose down` | Stop and remove everything it started |

Try `docker exec -it my-api sh` while a container is running — you'll get a
shell *inside* the container's isolated filesystem. `ls`, `cat src/server.js`,
`exit` when done. It's a good way to really feel what "isolated environment"
means.

---

## Things to try next, once this feels comfortable

- **Environment variables**: change `PORT` via `docker run -e PORT=4000 -p 4000:4000 ...`
  and see the app pick it up.
- **Volumes for live-reload**: mount your `src/` folder into the container so
  you don't have to rebuild on every code change:
  `docker run -p 3000:3000 -v $(pwd)/src:/app/src docker-learn-backend`
- **Multi-stage builds**: once this makes sense, look up "Docker multi-stage
  builds" — a technique for making production images smaller by separating
  the "build" environment from the "run" environment.
- **Push to Docker Hub**: `docker tag docker-learn-backend YOUR_USERNAME/docker-learn-backend`
  then `docker push YOUR_USERNAME/docker-learn-backend` (requires a free
  Docker Hub account and `docker login`).
# docker-backend
