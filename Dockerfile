# ---------------------------------------------------------------------------
# Step 1: Pick a base image.
# "node:20-alpine" = Node.js 20 on Alpine Linux (a very small Linux distro).
# Everything you install/run happens on top of this image.
# ---------------------------------------------------------------------------
FROM node:20-alpine

# ---------------------------------------------------------------------------
# Step 2: Set the working directory INSIDE the container.
# Every instruction after this (COPY, RUN, CMD) runs from /app.
# It's created automatically if it doesn't exist.
# ---------------------------------------------------------------------------
WORKDIR /app

# ---------------------------------------------------------------------------
# Step 3: Copy ONLY the dependency files first, not the whole project yet.
#
# Why does order matter? Docker builds images in layers and caches each one.
# If package.json/package-lock.json haven't changed since your last build,
# Docker reuses the cached "npm install" layer below instead of redoing it.
# That means: change your source code -> rebuild in seconds, not minutes.
# ---------------------------------------------------------------------------
COPY package*.json ./

# ---------------------------------------------------------------------------
# Step 4: Install dependencies INSIDE the container (not on your machine).
# ---------------------------------------------------------------------------
RUN npm install

# ---------------------------------------------------------------------------
# Step 5: Now copy the rest of the source code.
# This layer changes often (you edit code a lot), so it's kept separate
# and last, after the slow-changing dependency layer above.
# ---------------------------------------------------------------------------
COPY . .

# ---------------------------------------------------------------------------
# Step 6: Document which port the app listens on.
# NOTE: this line does NOT actually publish the port to your machine —
# that happens later with `docker run -p`. This is just documentation
# (and some tools/orchestrators read it).
# ---------------------------------------------------------------------------
EXPOSE 3000

# ---------------------------------------------------------------------------
# Step 7: The command that runs when a container starts from this image.
# ---------------------------------------------------------------------------
CMD ["npm", "start"]
