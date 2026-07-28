FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

# This base image already gives us Node 24, git, bash, zsh/Oh My Zsh, and a
# non-root "node" user with sudo. ripgrep is the one thing pi's grep tool
# needs that isn't in there already.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ripgrep \
    && rm -rf /var/lib/apt/lists/*

# Official pi install recipe (from pi.dev's own containerization guide):
# global npm install, lifecycle scripts skipped.
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent
RUN mkdir -p /home/node/.pi/agent && chown -R node:node /home/node/.pi/agent

WORKDIR /workspace
