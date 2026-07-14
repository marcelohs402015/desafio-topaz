$ErrorActionPreference = "Stop"

Write-Host "==> Backend: mvn clean verify"
Push-Location "$PSScriptRoot\..\backend"
mvn clean verify
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Pop-Location

Write-Host "==> Frontend: npm test && npm run build"
Push-Location "$PSScriptRoot\..\frontend"
npm ci
npm test
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Pop-Location

Write-Host "==> Docker: compose build"
Push-Location "$PSScriptRoot\.."
docker compose build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Pop-Location

Write-Host "CI local concluido com sucesso."
