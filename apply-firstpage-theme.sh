#!/usr/bin/env bash
set -e

if [ ! -f "portal.css" ]; then
  echo "portal.css not found. Run this from the repo root."
  exit 1
fi

if grep -q "CSL V2 — FIRST PAGE COLOR SYSTEM" portal.css; then
  echo "Theme override already exists in portal.css"
  exit 0
fi

cat csl-firstpage-theme-overrides.css >> portal.css
echo "Applied first-page color system to portal.css"
