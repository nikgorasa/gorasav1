---
name: governance-posttask
enabled: true
event: stop
action: warn
pattern: .*
---

## Post-Task Checklist

Before stopping, verify these governance items are complete:

- [ ] LEARNING-FROM-MISTAKES.md updated (if debugging >30 min)?
- [ ] DEPLOYMENT_LOG.md updated (if deployment changed)?
- [ ] ADR created (if architectural decision)?
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)?
- [ ] All tests pass (if applicable)?
- [ ] Post-task check script run (`bash scripts/post-task-check.sh`)?
