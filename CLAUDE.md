# CLAUDE.md — Context Layer

**READ THIS FIRST before starting any work in this project.**

## Step 1 — Load the context layer

Read these files in order:

1. `~/.claude/projects/dashtrack/memory/MEMORY.md`
   → Routing index. Tells you which files to read next.

2. `~/.claude/projects/dashtrack/memory/active-work.md`
   → What other agents are doing RIGHT NOW. Avoid their files.

3. `~/.claude/projects/dashtrack/memory/projects/dashtrack.md`
   → Current state of this specific project.

If debugging: check `gotchas.md` before spending time investigating.
If making a tech or architecture decision: check `decisions.md` first.

---

## Protocol

### On session start

1. Read MEMORY.md (the index)++
2. Read active-work.md (coordination)
3. Read this project's file in `projects/`
4. Check gotchas.md if relevant

### During work

- Add your entry to `active-work.md` when you start a task → prefer `update_active_work` MCP tool
- Update `active-work.md` when your status changes → prefer `update_active_work` MCP tool
- Update the project file immediately after meaningful changes → use `write_file` MCP tool
- Add to `gotchas.md` the moment you discover a bug or workaround → prefer `add_gotcha` MCP tool
- Add to `decisions.md` when a significant choice is made → prefer `add_decision` MCP tool
- Search memory before reading files one by one → use `search_files` MCP tool

### On session end

- Remove your entry from `active-work.md` → prefer `remove_from_active_work` MCP tool
- Append a summary to `worklog.md` → prefer `append_worklog` MCP tool
- At session end, update `live-metrics.md` — increment Sessions, update Files Modified
  from your filesTouched count → use `write_file` MCP tool

### MCP tools (preferred over raw Write for all memory operations)

If the `neurostack` MCP server is connected, use its tools instead of writing markdown directly.
Raw `Write` calls are acceptable only when the MCP server is unavailable.

| Operation           | MCP tool                  |
| ------------------- | ------------------------- |
| Read a file         | `read_file`               |
| List all files      | `list_files`              |
| Search across files | `search_files`            |
| Write any file      | `write_file`              |
| Add worklog entry   | `append_worklog`          |
| Claim / update task | `update_active_work`      |
| Release task        | `remove_from_active_work` |
| Log a gotcha        | `add_gotcha`              |
| Log a decision      | `add_decision`            |

### Critical rule

**Write continuously — not just at session end.**
If you crash mid-session, your active-work.md entry stays as a signal to the next agent.

---

## Project-specific notes

<!-- Add anything project-specific here that agents need to know -->

Follow `DESIGN.md` in the project root for styling direction.
