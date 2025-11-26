#!/bin/bash
# GitHub MCP Server Wrapper
# Launches GitHub MCP server via Docker with token authentication

set -e

# Check if GitHub MCP is enabled
if [ -z "$USE_GITHUB_MCP" ] || [ "$USE_GITHUB_MCP" != "1" ]; then
  echo "GitHub MCP disabled (USE_GITHUB_MCP not set to 1)" >&2
  exit 1
fi

# Check for GitHub token
GITHUB_TOKEN="${GITHUB_TOKEN:-$GH_TOKEN}"
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GitHub token not found. Set GITHUB_TOKEN or GH_TOKEN environment variable." >&2
  exit 1
fi

# Launch GitHub MCP server via Docker
# Uses official GitHub MCP server image with stdin/stdout transport
exec docker run --rm -i \
  -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  ghcr.io/modelcontextprotocol/server-github:latest
