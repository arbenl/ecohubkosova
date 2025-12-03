#!/bin/bash
# GitHub MCP Server Wrapper
echo "DEBUG: Script started at $(date)" >> /tmp/mcp_debug.log
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

# Launch GitHub MCP server via npx
# Uses official GitHub MCP server package with stdin/stdout transport
export GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN"
exec /opt/homebrew/bin/npx -y @modelcontextprotocol/server-github
