#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if command -v supabase >/dev/null 2>&1; then
  echo "Starting local Supabase (Docker required)..."
  supabase start || {
    echo "⚠ supabase start failed — ensure Docker is running. Continuing with Next.js only."
  }
else
  echo "⚠ Supabase CLI not installed. Skipping supabase start. Install: https://supabase.com/docs/guides/cli"
fi

exec pnpm dev
