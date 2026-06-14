# GoRASA CockroachDB Standalone — Learning from Mistakes

> **Purpose:** Track all issues taking >30 minutes to debug.

---

### Issue 001 — FK Constraint Blocked Imports

- **Date:** 2026-06-15
- **Duration:** ~15 min
- **Severity:** Medium
- **Symptoms:** CockroachDB import failed on tables with FK references to other tables
- **Root Cause:** FK constraints were active when trying to import data — tables needed to be loaded in dependency order
- **Resolution:** Dropped all 14 FK constraints before import, re-added after all data loaded
- **Lesson:** Always disable FK constraints before bulk data import; re-enable after
- **Prevention:** Make FK-disable step part of any migration script
