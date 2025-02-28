#!/bin/bash
# This script runs a development server with security enforcement enabled
# to verify that our security mechanisms work correctly

echo "Starting development server with security enforcement..."
ENFORCE_SDK_VALIDATION=true NODE_ENV=production COPILOT_ENV=production NEXT_PUBLIC_TEST_MODE=false CI=false yarn dev

# This script can be run with:
# chmod +x test-security.sh
# ./test-security.sh