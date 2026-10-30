#!/usr/bin/env bash
# Runs after the dev container is created. Each step prints before it starts
# so the creation log shows which command is still running.
set -euo pipefail

cd "$(dirname "$0")/.."

# A creation-log TTY makes Wrangler wait on "apply migrations?" forever.
# CI uses the fallback answer (yes). Also skip the skills-update prompt.
export CI=true
export WRANGLER_NO_SKILLS_UPDATE_PROMPTS=true
export WRANGLER_SEND_METRICS=false

log() {
  printf '[post-create %s] %s\n' "$(date +%H:%M:%S)" "$*"
}

log "1/3 bun install"
bun install
log "1/3 bun install finished"

log "2/3 db:migrate:local"
bun run db:migrate:local
log "2/3 db:migrate:local finished"

log "3/3 media:seed:local"
bun run media:seed:local
log "3/3 media:seed:local finished"

log "done"
