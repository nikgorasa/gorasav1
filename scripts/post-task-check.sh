#!/bin/bash
# GoRASA Governance Post-Task Check (Root Wrapper)
# Delegates to gorasa-next/scripts/post-task-check.sh
# COMPULSORY — must pass after ALL work completes

set -e

exec /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next/scripts/post-task-check.sh "$@"
