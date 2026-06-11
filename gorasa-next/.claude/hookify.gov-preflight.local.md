---
name: governance-preflight
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(ts|tsx|js|jsx|css|ts|json)$
  - field: new_text
    operator: contains
    pattern: any
---

## Pre-Flight Checklist

You are about to modify source code. Before proceeding, verify:

- [ ] Read project docs (Sprint-1.md, CONFIG-REFERENCE.md, DEPLOYMENT_LOG.md, LEARNING-FROM-MISTAKES.md) this session?
- [ ] Checked `git status` and `git log --oneline -5`?
- [ ] Run `npx tsc --noEmit` to check current state?

Run `bash scripts/preflight-check.sh` to verify all pre-flight items.
