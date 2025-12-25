# MCP Category Index Reference

Quick lookup table for Miyabi MCP's 172 tools across 22 categories.

## Category → Tool Mapping

### github (21 tools)
Primary: Issues, PRs, workflows, releases
```
github_list_issues      - List issues with filters
github_get_issue        - Get issue details
github_create_issue     - Create new issue
github_update_issue     - Update issue
github_add_comment      - Add comment
github_list_prs         - List pull requests
github_get_pr           - Get PR details
github_create_pr        - Create PR
github_merge_pr         - Merge PR
github_list_labels      - List labels
github_add_labels       - Add labels
github_list_milestones  - List milestones
github_list_workflows   - List Actions workflows
github_list_workflow_runs - List workflow runs
github_repo_info        - Repository info
github_list_releases    - List releases
github_list_branches    - List branches
github_compare_commits  - Compare commits
github_list_pr_reviews  - List PR reviews
github_create_review    - Create review
github_submit_review    - Submit review
```

### git (19 tools)
Primary: Version control operations
```
git_status              - Working tree status
git_branch_list         - List branches
git_current_branch      - Current branch name
git_log                 - Commit history
git_worktree_list       - List worktrees
git_diff                - Unstaged changes
git_staged_diff         - Staged changes
git_remote_list         - List remotes
git_branch_ahead_behind - Ahead/behind count
git_file_history        - File history
git_stash_list          - List stashes
git_blame               - Line blame
git_show                - Commit details
git_tag_list            - List tags
git_contributors        - Contributor list
git_conflicts           - Detect conflicts
git_submodule_status    - Submodule status
git_lfs_status          - LFS status
git_hooks_list          - List hooks
```

### network (15 tools)
Primary: Connectivity and diagnostics
```
network_interfaces      - List interfaces
network_connections     - Active connections
network_listening_ports - Listening ports
network_stats           - Network statistics
network_gateway         - Default gateway
network_ping            - Ping host
network_bandwidth       - Bandwidth usage
network_overview        - Complete overview
network_dns_lookup      - DNS resolution
network_port_check      - Check port
network_public_ip       - Public IP
network_wifi_info       - WiFi details
network_route_table     - Routing table
network_ssl_check       - SSL certificate
network_traceroute      - Trace route
```

### process (14 tools)
Primary: Process management
```
process_info            - Process details
process_list            - List processes
process_search          - Search processes
process_tree            - Process tree
process_file_descriptors - Open files
process_environment     - Environment vars
process_children        - Child processes
process_top             - Top processes
process_kill            - Kill process
process_ports           - Process ports
process_cpu_history     - CPU history
process_memory_detail   - Memory details
process_threads         - Process threads
process_io_stats        - I/O statistics
```

### tmux (10 tools)
Primary: Terminal multiplexer
```
tmux_list_sessions      - List sessions
tmux_list_windows       - List windows
tmux_list_panes         - List panes
tmux_send_keys          - Send keys
tmux_pane_capture       - Capture output
tmux_pane_search        - Search pane
tmux_pane_tail          - Tail pane
tmux_pane_is_busy       - Check busy
tmux_pane_current_command - Current command
tmux_session_info       - Session info
```

### resource (10 tools)
Primary: System monitoring
```
resource_cpu            - CPU usage
resource_memory         - Memory usage
resource_disk           - Disk usage
resource_load           - Load average
resource_overview       - System overview
resource_processes      - Top processes
resource_uptime         - System uptime
resource_network_stats  - Network traffic
resource_battery        - Battery status
resource_temperature    - CPU temperature
```

### file (10 tools)
Primary: File operations
```
file_stats              - File metadata
file_recent_changes     - Recent changes
file_search             - Search files
file_tree               - Directory tree
file_compare            - Compare files
file_changes_since      - Changes since time
file_read               - Read file
file_checksum           - File hash
file_size_summary       - Size analysis
file_duplicates         - Find duplicates
```

### docker (10 tools)
Primary: Container management
```
docker_ps               - List containers
docker_images           - List images
docker_logs             - Container logs
docker_inspect          - Inspect target
docker_stats            - Container stats
docker_exec             - Execute command
docker_start            - Start container
docker_stop             - Stop container
docker_restart          - Restart container
docker_build            - Build image
```

### compose (4 tools)
Primary: Docker Compose
```
compose_ps              - List services
compose_up              - Start services
compose_down            - Stop services
compose_logs            - Service logs
```

### k8s (6 tools)
Primary: Kubernetes
```
k8s_get_pods            - List pods
k8s_get_deployments     - List deployments
k8s_logs                - Pod logs
k8s_describe            - Describe resource
k8s_apply               - Apply manifest
k8s_delete              - Delete resource
```

### db (6 tools)
Primary: Database operations
```
db_connect              - Test connection
db_tables               - List tables
db_schema               - Table schema
db_query                - Execute query
db_explain              - Query plan
db_health               - Database health
```

### log (7 tools)
Primary: Log analysis
```
log_sources             - List log files
log_get_recent          - Recent entries
log_search              - Search logs
log_get_errors          - Error entries
log_get_warnings        - Warning entries
log_tail                - Tail log
log_stats               - Log statistics
```

### Other Categories

| Category | Count | Key Tools |
|----------|-------|-----------|
| speckit | 9 | init, status, specify, plan, tasks |
| claude | 8 | config, mcp_status, session_info, logs |
| time | 4 | current, convert, format, diff |
| gen | 4 | uuid, random, hash, password |
| linux | 3 | systemd_units, systemd_status, journal_search |
| mcp | 3 | search_tools, list_categories, get_tool_info |
| calc | 3 | expression, unit_convert, statistics |
| think | 3 | step, branch, summarize |
| windows | 2 | service_status, eventlog_search |
| health | 1 | health_check |
