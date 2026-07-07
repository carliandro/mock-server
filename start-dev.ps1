param(
  [switch]$Integrated = $false
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mockServerDir = if ($env:MOCK_SERVER_DIR) { $env:MOCK_SERVER_DIR } else { $scriptDir }
$frontendDir = if ($env:ANGULAR_PROJECT_DIR) { $env:ANGULAR_PROJECT_DIR } else { Join-Path $scriptDir "..\angular-sistema-odonto" }
$backendDir = if ($env:BACKEND_PROJECT_DIR) { $env:BACKEND_PROJECT_DIR } else { Join-Path $scriptDir "..\backend-sistema-odonto" }

# Cria env vars permanentemente no User se nao existirem
if (-not $env:MOCK_SERVER_DIR) {
  [System.Environment]::SetEnvironmentVariable('MOCK_SERVER_DIR', $mockServerDir, 'User')
  Write-Host "  Variavel MOCK_SERVER_DIR criada permanentemente" -ForegroundColor Green
}
if (-not $env:ANGULAR_PROJECT_DIR) {
  [System.Environment]::SetEnvironmentVariable('ANGULAR_PROJECT_DIR', $frontendDir, 'User')
  Write-Host "  Variavel ANGULAR_PROJECT_DIR criada permanentemente" -ForegroundColor Green
}
if (-not $env:BACKEND_PROJECT_DIR) {
  [System.Environment]::SetEnvironmentVariable('BACKEND_PROJECT_DIR', $backendDir, 'User')
  Write-Host "  Variavel BACKEND_PROJECT_DIR criada permanentemente" -ForegroundColor Green
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
  Write-Host "[1/2] Iniciando mock server Node.js (porta 8081)..." -ForegroundColor Green
  $mockProcess = Start-Process -FilePath "node" -ArgumentList "$mockServerDir\server.js" -WindowStyle Normal -PassThru
  Start-Sleep -Seconds 2

  # 2. Angular dev server
  Set-Location $frontendDir
  Write-Host "[2/2] ng serve (mock auth)" -ForegroundColor Green
  ng serve

  # Ao sair, tenta encerrar o mock server
  if ($mockProcess -and !$mockProcess.HasExited) {
    Write-Host "Encerrando mock server..." -ForegroundColor Yellow
    $mockProcess.Kill()
  }
} else {
  # 1. Backend Kotlin (Spring Boot)
  Write-Host "[1/3] Iniciando backend (porta 8081) em nova janela..." -ForegroundColor Green
  $backendArgs = @("-NoProfile", "-Command", "`$env:SPRING_PROFILES_ACTIVE='dev'; Set-Location '$backendDir'; ./gradlew.bat bootRun")
  $backendProcess = Start-Process -FilePath "powershell" -ArgumentList $backendArgs -WindowStyle Normal -PassThru
  Start-Sleep -Seconds 5

  # 2. Angular dev server
  Set-Location $frontendDir
  Write-Host "[2/3] ng serve --configuration integrated" -ForegroundColor Green
  ng serve --configuration integrated

  # Ao sair, avisa que o backend continua rodando
  if ($backendProcess -and !$backendProcess.HasExited) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "  Backend ainda esta rodando em outra janela." -ForegroundColor Yellow
    Write-Host "  Feche a janela do backend manualmente quando quiser." -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Yellow
  }
}
