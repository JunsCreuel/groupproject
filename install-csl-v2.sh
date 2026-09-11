#!/usr/bin/env bash
set -e

if [ ! -f "index.html" ]; then
  echo "Run this script from the stressLab repository root."
  exit 1
fi

if [ ! -f "legacy-landing.html" ]; then
  cp index.html legacy-landing.html
  echo "Backed up current landing page -> legacy-landing.html"
fi

cp home-v2.html index.html
echo "Installed new multipage CSL home -> index.html"
echo "Added: network.html, map.html, archive.html, portal.css, portal.js, network.js, map.js"
echo
echo "Preview with your local server, then:"
echo "  git add index.html legacy-landing.html network.html map.html archive.html portal.css portal.js network.js map.js"
echo '  git commit -m "restructure CSL into multipage network"'
echo "  git push origin claude/local-remote-control-2iryi9"
