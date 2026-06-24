param(
  [switch]$Integrated = $false
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mockServerDir = if ($env:MOCK_SERVER_DIR) { $env:MOCK_SERVER_DIR } else { $scriptDir }
$frontendDir = if ($env:ANGULAR_PROJECT_DIR) { $env:ANGULAR_PROJECT_DIR } else { Join-Path $scriptDir "..\angular-sistema-odonto" }
$backendDir = if ($env:BACKEND_PROJECT_DIR) { $env:BACKEND_PROJECT_DIR } else { Join-Path $scriptDir "..\backend-sistema-odonto" }

# Cria env vars permanentemente no User se não existirem
if (-not $env:MOCK_SERVER_DIR) {
  [System.Environment]::SetEnvironmentVariable('MOCK_SERVER_DIR', $mockServerDir, 'User')
  Write-Host "  ✓ Variável MOCK_SERVER_DIR criada permanentemente" -ForegroundColor Green
}
if (-not $env:ANGULAR_PROJECT_DIR) {
  [System.Environment]::SetEnvironmentVariable('ANGULAR_PROJECT_DIR', $frontendDir, 'User')
  Write-Host "  ✓ Variável ANGULAR_PROJECT_DIR criada permanentemente" -ForegroundColor Green
}
if (-not $env:BACKEND_PROJECT_DIR) {
  [System.Environment]::SetEnvironmentVariable('BACKEND_PROJECT_DIR', $backendDir, 'User')
  Write-Host "  ✓ Variável BACKEND_PROJECT_DIR criada permanentemente" -ForegroundColor Green
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Ambiente Dev Sistema Odonto" -ForegroundColor Cyan
if ($Integrated) {
  Write-Host "  Modo: Integrado (backend real)" -ForegroundColor Yellow
} else {
  Write-Host "  Modo: Mock (server.js)" -ForegroundColor Green
}
Write-Host "=====================================" -ForegroundColor Cyan

if (-not $Integrated) {
  # 1. Mock server Node.js (API + SSE)
  $mockJob = Start-Job -ScriptBlock {
    param($dir)
    node "$dir\server.js"
  } -ArgumentList $mockServerDir
  Write-Host "[1/2] Mock server Node.js (porta 8081)" -ForegroundColor Green

  # 2. Angular dev server
  Set-Location $frontendDir
  $ngArgs = "serve"
  Write-Host "[2/2] ng serve (mock auth)" -ForegroundColor Green
  ng $ngArgs
} else {
  Set-Location $backendDir
  $gradleJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    $env:SPRING_PROFILES_ACTIVE = "dev"
    ./gradlew.bat bootRun
  } -ArgumentList $backendDir
  Write-Host "[1/3] Backend iniciado (porta 8081)" -ForegroundColor Green

  Set-Location $frontendDir
  Write-Host "[2/3] ng serve --configuration integrated" -ForegroundColor Green
  ng serve --configuration integrated
}
