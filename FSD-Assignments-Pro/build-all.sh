#!/usr/bin/env bash
# Builds the three React apps and assembles everything into ./site (hub + all 6 assignments).
set -e
rm -rf site && mkdir -p site
cp index.html hub.css hub.js site/
for d in assignment-1-calculator assignment-2-todo assignment-3-registration; do cp -r "$d" "site/$d"; done
for d in assignment-4-profile-cards assignment-5-student-form assignment-6-counter; do
  (cd "$d" && npm ci --no-audit --no-fund && npm run build)
  mkdir -p "site/$d" && cp -r "$d/dist/." "site/$d/"
done
touch site/.nojekyll
echo "✅ Done. Preview with:  npx serve site"
