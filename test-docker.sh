#!/bin/bash
# test-docker.sh - Run tests in Docker environment to match CI

set -e

echo "🐳 Running tests in Docker (matching CI environment)..."

case "${1:-test}" in
  "test")
    echo "📋 Running test suite..."
    docker-compose -f docker-compose.test.yml run --rm test
    ;;
  "watch")
    echo "👀 Running tests in watch mode..."
    docker-compose -f docker-compose.test.yml run --rm test-watch
    ;;
  "lint")
    echo "🔍 Running linter..."
    docker-compose -f docker-compose.test.yml run --rm lint
    ;;
  "type-check")
    echo "🔤 Running TypeScript type check..."
    docker-compose -f docker-compose.test.yml run --rm type-check
    ;;
  "pre-commit")
    echo "🔨 Running pre-commit checks (lint + test + type-check)..."
    docker-compose -f docker-compose.test.yml run --rm pre-commit
    ;;
  "build")
    echo "🏗️  Building test container..."
    docker-compose -f docker-compose.test.yml build
    ;;
  "clean")
    echo "🧹 Cleaning up test containers..."
    docker-compose -f docker-compose.test.yml down -v
    ;;
  *)
    echo "Usage: $0 {test|watch|lint|type-check|pre-commit|build|clean}"
    echo ""
    echo "Commands:"
    echo "  test        - Run test suite once"
    echo "  watch       - Run tests in watch mode"
    echo "  lint        - Run ESLint"
    echo "  type-check  - Run TypeScript compiler check"
    echo "  pre-commit  - Run all pre-commit checks"
    echo "  build       - Build test container"
    echo "  clean       - Remove test containers and volumes"
    exit 1
    ;;
esac

echo "✅ Done!"
