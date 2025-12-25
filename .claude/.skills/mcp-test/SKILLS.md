---
name: mcp-test
description: Test MCP server connections and list available tools
version: 1.0.0
triggers:
  - /mcp-test
  - /mcp
inputs:
  - name: server
    type: string
    description: MCP server name to test (default: all)
    required: false
---

# MCP Test Skill

Tests MCP server connections and displays available tools.

## Workflow

1. Read Claude Desktop config
2. Start specified MCP server(s)
3. Send tools/list request
4. Display tool count and categories
5. Report connection status

## Usage

```
/mcp-test
/mcp-test miyabi
```

## Output

- Server version
- Tool count
- Tool categories
- Connection status
