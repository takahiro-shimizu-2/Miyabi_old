#!/bin/bash
# MCP Tool Search Helper Script
# Usage: ./mcp-search.sh [category] [query]

CATEGORY="${1:-}"
QUERY="${2:-}"

echo "=== MCP Tool Discovery ==="
echo ""

# Category mapping for common intents
declare -A INTENT_MAP=(
    ["container"]="docker"
    ["image"]="docker"
    ["pod"]="k8s"
    ["kubernetes"]="k8s"
    ["branch"]="git"
    ["commit"]="git"
    ["merge"]="git"
    ["pull request"]="github"
    ["pr"]="github"
    ["issue"]="github"
    ["workflow"]="github"
    ["cpu"]="resource"
    ["memory"]="resource"
    ["disk"]="resource"
    ["log"]="log"
    ["error"]="log"
    ["port"]="network"
    ["ping"]="network"
    ["dns"]="network"
    ["file"]="file"
    ["directory"]="file"
    ["process"]="process"
    ["kill"]="process"
    ["terminal"]="tmux"
    ["pane"]="tmux"
    ["session"]="tmux"
    ["database"]="db"
    ["sql"]="db"
    ["time"]="time"
    ["timezone"]="time"
    ["uuid"]="gen"
    ["password"]="gen"
    ["hash"]="gen"
)

# If no category provided, try to infer from query
if [ -z "$CATEGORY" ] && [ -n "$QUERY" ]; then
    QUERY_LOWER=$(echo "$QUERY" | tr '[:upper:]' '[:lower:]')
    for intent in "${!INTENT_MAP[@]}"; do
        if [[ "$QUERY_LOWER" == *"$intent"* ]]; then
            CATEGORY="${INTENT_MAP[$intent]}"
            echo "Auto-detected category: $CATEGORY (from '$intent')"
            break
        fi
    done
fi

echo "Category: ${CATEGORY:-all}"
echo "Query: ${QUERY:-none}"
echo ""

# Output MCP tool call format
if [ -n "$CATEGORY" ]; then
    echo "Recommended MCP call:"
    echo "  miyabi:mcp_search_tools({"
    echo "    category: \"$CATEGORY\""
    if [ -n "$QUERY" ]; then
        echo "    query: \"$QUERY\""
    fi
    echo "  })"
else
    echo "Recommended MCP call:"
    echo "  miyabi:mcp_list_categories()"
    echo ""
    echo "Then narrow with:"
    echo "  miyabi:mcp_search_tools({ category: \"...\", query: \"$QUERY\" })"
fi

echo ""
echo "=== Category Quick Reference ==="
echo "  github (21)  - Issues, PRs, workflows"
echo "  git (19)     - Version control"
echo "  network (15) - Connectivity"
echo "  process (14) - Process mgmt"
echo "  tmux (10)    - Terminal"
echo "  resource (10)- System monitoring"
echo "  file (10)    - File operations"
echo "  docker (10)  - Containers"
echo "  speckit (9)  - Spec development"
echo "  claude (8)   - Claude Code"
echo "  log (7)      - Log analysis"
echo "  k8s (6)      - Kubernetes"
echo "  db (6)       - Databases"
