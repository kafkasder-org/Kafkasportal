#!/bin/bash

# Test Codacy Coverage Integration
# This script tests the Codacy coverage upload locally

set -e

echo "🧪 Testing Codacy Coverage Integration..."

# Check if coverage files exist
if [ ! -f "./coverage/lcov.info" ]; then
    echo "❌ Coverage file not found. Running tests with coverage..."
    npm run test:coverage
fi

# Set up Codacy environment variables
export CODACY_API_TOKEN="${CODACY_API_TOKEN:-8eqmXlJlpXhV05Ngq7OU}"
export CODACY_ORGANIZATION_PROVIDER=gh
export CODACY_USERNAME=Vadalov
export CODACY_PROJECT_NAME=Kafkasder-panel

echo "📊 Uploading coverage to Codacy..."
echo "   Repository: $CODACY_USERNAME/$CODACY_PROJECT_NAME"
echo "   Provider: $CODACY_ORGANIZATION_PROVIDER"

# Upload to Codacy
bash <(curl -Ls https://coverage.codacy.com/get.sh) report \
  --coverage-reports ./coverage/lcov.info \
  --language typescript \
  --force-coverage-parser lcov

echo "✅ Codacy coverage upload completed!"