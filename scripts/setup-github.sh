#!/usr/bin/env bash
# One-time GitHub configuration for hexablock-api. Requires: gh auth login (org admin).
# Usage: ./scripts/setup-github.sh <org>
set -euo pipefail
ORG="${1:?usage: setup-github.sh <org>}"
REPO="$ORG/hexablock-api"

# Only "Rebase and merge" keeps every author's commits and a linear history.
gh repo edit "$REPO" \
  --enable-merge-commit=false --enable-squash-merge=false --enable-rebase-merge \
  --delete-branch-on-merge --enable-issues --enable-projects

# Branch protection for main. Required checks: lint-and-test, commitlint.
gh api -X PUT "repos/$REPO/branches/main/protection" \
  -H "Accept: application/vnd.github+json" --input scripts/branch-protection.json

# Labels used by the issue templates and the board.
for l in "task:0e8a16" "bug:d73a4a" "engine:1d76db" "variant:5319e7" "ui:fbca04" \
         "backend:0052cc" "docs:c5def5" "ci:bfdadc" "ai-assisted:f9d0c4"; do
  gh label create "${l%%:*}" --color "${l##*:}" --repo "$REPO" --force
done
echo "Done. Create the shared board once with: gh project create --owner $ORG --title 'HexaBlock Suite'"
