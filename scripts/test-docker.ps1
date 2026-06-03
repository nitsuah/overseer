# test-docker.ps1 - PowerShell version for Windows
# Run tests in Docker environment to match CI

param(
    [Parameter(Position=0)]
    [ValidateSet('test', 'watch', 'lint', 'type-check', 'pre-commit', 'build', 'clean')]
    [string]$Command = 'test'
)

$ErrorActionPreference = "Stop"

Write-Host "🐳 Running tests in Docker (matching CI environment)..." -ForegroundColor Cyan

switch ($Command) {
    'test' {
        Write-Host "📋 Running test suite..." -ForegroundColor Yellow
        docker-compose -f config/docker-compose.test.yml run --rm test
    }
    'watch' {
        Write-Host "👀 Running tests in watch mode..." -ForegroundColor Yellow
        docker-compose -f config/docker-compose.test.yml run --rm test-watch
    }
    'lint' {
        Write-Host "🔍 Running linter..." -ForegroundColor Yellow
        docker-compose -f config/docker-compose.test.yml run --rm lint
    }
    'type-check' {
        Write-Host "🔤 Running TypeScript type check..." -ForegroundColor Yellow
        docker-compose -f config/docker-compose.test.yml run --rm type-check
    }
    'pre-commit' {
        Write-Host "🔨 Running pre-commit checks (lint + test + type-check)..." -ForegroundColor Yellow
        docker-compose -f config/docker-compose.test.yml run --rm pre-commit
    }
    'build' {
        Write-Host "🏗️  Building test container..." -ForegroundColor Yellow
        docker-compose -f config/docker-compose.test.yml build
    }
    'clean' {
        Write-Host "🧹 Cleaning up test containers..." -ForegroundColor Yellow
        docker-compose -f config/docker-compose.test.yml down -v
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Done!" -ForegroundColor Green
} else {
    Write-Host "❌ Docker command failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
