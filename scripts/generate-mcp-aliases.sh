#!/bin/bash

# Define paths
MCP_CONTEXT_PATH="/Users/arbenlila/development/ecohubkosova/tools/mcp-context-server/dist/server.js"
ECOHUB_QA_PATH="/Users/arbenlila/development/ecohubkosova/tools/ecohub-qa/dist/index.js"

# Check if files exist
if [ ! -f "$MCP_CONTEXT_PATH" ]; then
    echo "Warning: MCP Context Server not found at $MCP_CONTEXT_PATH"
fi

if [ ! -f "$ECOHUB_QA_PATH" ]; then
    echo "Warning: EcoHub QA Server not found at $ECOHUB_QA_PATH"
fi

# Generate aliases
echo "# MCP Server Aliases"
echo "alias mcp-context='node $MCP_CONTEXT_PATH'"
echo "alias ecohub-qa='node $ECOHUB_QA_PATH'"

echo ""
echo "# Usage:"
echo "# mcp-context <tool_name> [args]"
echo "# ecohub-qa <tool_name> [args]"
