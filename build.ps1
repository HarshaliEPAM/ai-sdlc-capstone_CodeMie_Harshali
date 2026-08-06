#!/usr/bin/env pwsh
#requires -Version 5.1

[smdletbinding()]
param()

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

$buildDir = Join-Path $RepoRoot "build"
$reportFile = Join-Path $buildDir "build-report.json"
$frontendDir = Join-Path $RepoRoot "src/frontend"
$backendDir = Join-Path $RepoRoot "src/backend"

function Ensure-Dir([String]$path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null }
}

function Copy-Dir([String]$src, [String]$dst) {
  if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
  Ensure-Dir $dst
  Copy-Item -Path (Join-Path $src '*') -Destination $dst -Recurse -Force
}

function Write-Report() {
  Ensure-Dir $buildDir
  $branch = (git rev-parse --abbrev-ref HEAD --action SilentlyContinue)
  if (-not $branch) { $branch = "unknown" }
  $commit = (git rev-parse HEAD --quiet 2> $null)
  if (-not $commit) { $commit = "unknown" }
  $obj = [Ordered]@{
    project = "ai-sdlc-capstone_CodeMie_Harshali"
    branch = $branch
    commit = $commit
    timestampUtc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    tooling = @{
      node = (node -v 2> $null)
      npm = (npm -v 2> $null)
    }
    buildOutput = "/build"
    artifacts = @{
      frontend = "build/frontend"
      backend = "build/backend"
    }
  }
  $obj | ConvertTo-Json -Depth 6 | Set-Content -Path $reportFile -Encoding UTF8
}

Write-Host "[build.ps1] Running build in $RepoRoot"
Ensure-Dir $buildDir

# Frontend
Write-Host "[build.ps1] Installing frontend dependencies"
Push-Location $frontendDir
if (Test-Path "package-lock.json") { npm ci } else { npm install }
Write-Host "[build.ps1] Running frontend lint"
if (npm run -s lint 2> $null) { npm run lint } else { Write-Host "[build.ps1] Warn: no frontend lint script found" }
Write-Host "[build.ps1] Building frontend (vite)"
npm run build
Pop-Location

# Backend
Write-Host "[build.ps1] Installing backend dependencies"
Push-Location $backendDir
if (Test-Path "package-lock.json") { npm ci } else { npm install }
Write-Host "[build.ps1] Running backend lint"
if (npm run -s lint 2> $null) { npm run lint } else { Write-Host "[build.ps1] Warn: no backend lint script found" }
Pop-Location

# Copy artifacts
Write-Host "[build.ps1] Copying artifacts to /build"
$frontendDist = Join-Path $frontendDir "dist"
if (-not (Test-Path $frontendDist)) { throw "Frontend dist folder not found: $frontendDist" }
Copy-Dir $frontendDist (Join-Path $buildDir "frontend")
Copy-Dir $backendDir (Join-Path $buildDir "backend")
$backNodeModules = Join-Path $buildDir "backend/node_modules"
if (Test-Path $backNodeModules) { Remove-Item -Recurse -Force $backNodeModules }

Write-Report
Write-Host "[build.ps1] Done. Artifacts: $buildDir, Report: $reportFile"
