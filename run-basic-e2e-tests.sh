#\!/bin/bash

# Clean up any running instances first
pkill -f "next" || true

# Build the app
yarn build

# Run only the basic tests
yarn test:e2e:basic

echo "Basic e2e tests completed."
