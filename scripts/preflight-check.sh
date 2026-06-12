#!/bin/bash
# GoRASA Governance Pre-Flight Check (Root Wrapper)
# Delegates to gorasa-next/scripts/preflight-check.sh
# COMPULSORY — must pass before ANY work begins

set -e

exec /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next/scripts/preflight-check.sh "$@"
