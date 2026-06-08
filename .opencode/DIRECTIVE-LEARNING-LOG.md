# Directive: Update Learning from Mistakes Log

## Rule
After completing any significant task (bug fix, feature, migration, deployment), update `LEARNING-FROM-MISTAKES.md` with:

1. **Issue #N** — Sequential number
2. **Date** — When the issue occurred
3. **Duration** — How long it took to resolve
4. **Severity** — Critical/High/Medium/Low
5. **Symptoms** — What was observed
6. **Root Cause** — What caused it
7. **Resolution Steps** — What was done to fix it
8. **Lessons Learned** — What to remember
9. **Prevention Measures** — How to avoid recurrence

## When to Update
- After fixing a bug that took >30 minutes
- After a deployment failure
- After a data migration issue
- After any significant debugging session
- After discovering a new pattern or gotcha

## Format
Use the existing template in `LEARNING-FROM-MISTAKES.md`. Add new issues sequentially (Issue #2, #3, etc.).

## Location
`/home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/LEARNING-FROM-MISTAKES.md`
