# =====================================================
# BudgetApp - Script de Control del Servidor
# =====================================================

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status')]
    [string]$Action = 'start'
)

$PORT = 8000
$VENV_PATH = "E:\Desarrollo\BudgetApp\.venv\Scripts\Activate.ps1"
$PROJECT_DIR = "E:\Desarrollo\BudgetApp\backend"

function Show-Banner {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "    BudgetApp - Server Manager" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Get-ServerProcess {
    try {
        $connection = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($connection) {
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            return $process
        }
    } catch {
        # Ignorar errores
    }
    return $null
}

function Stop-Server {
    Write-Host "🛑 Deteniendo servidor..." -ForegroundColor Yellow
    
    $serverProcess = Get-ServerProcess
    
    if ($serverProcess) {
        # Detener el proceso principal
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        
        # Esperar un momento
        Start-Sleep -Seconds 2
        
        # Verificar si hay procesos Python huérfanos
        $pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
        foreach ($proc in $pythonProcesses) {
            try {
                $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
                if ($cmdLine -like "*uvicorn*" -or $cmdLine -like "*app.main*") {
                    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                }
            } catch {
                # Ignorar errores
            }
        }
        
        Write-Host "✅ Servidor detenido correctamente" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  El servidor no está corriendo" -ForegroundColor Gray
    }
}

function Start-Server {
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Yellow
    
    # Verificar si ya está corriendo
    $serverProcess = Get-ServerProcess
    if ($serverProcess) {
        Write-Host "⚠️  El servidor ya está corriendo en el puerto $PORT" -ForegroundColor Red
        Write-Host "   PID: $($serverProcess.Id)" -ForegroundColor Gray
        return
    }
    
    # Cambiar al directorio del proyecto
    Set-Location $PROJECT_DIR
    
    # Iniciar el servidor en una nueva ventana
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "powershell.exe"
    $startInfo.Arguments = "-NoExit -Command `"& '$VENV_PATH'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port $PORT`""
    $startInfo.WorkingDirectory = $PROJECT_DIR
    
    [System.Diagnostics.Process]::Start($startInfo) | Out-Null
    
    # Esperar a que el servidor inicie
    Write-Host "⏳ Esperando a que el servidor inicie..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    # Verificar si inició correctamente (intentar varias veces)
    $maxAttempts = 3
    $attempt = 0
    $serverProcess = $null
    
    while ($attempt -lt $maxAttempts -and -not $serverProcess) {
        Start-Sleep -Seconds 1
        $serverProcess = Get-ServerProcess
        $attempt++
    }
    
    if ($serverProcess) {
        Write-Host "✅ Servidor iniciado correctamente" -ForegroundColor Green
        Write-Host "   📡 URL: http://localhost:$PORT" -ForegroundColor Cyan
        Write-Host "   🆔 PID: $($serverProcess.Id)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "💡 Abre tu navegador en: http://localhost:$PORT" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error al iniciar el servidor" -ForegroundColor Red
    }
}

function Show-Status {
    Write-Host "📊 Estado del servidor:" -ForegroundColor Cyan
    Write-Host ""
    
    $serverProcess = Get-ServerProcess
    
    if ($serverProcess) {
        Write-Host "   Estado:     " -NoNewline -ForegroundColor Gray
        Write-Host "🟢 CORRIENDO" -ForegroundColor Green
        Write-Host "   PID:        " -NoNewline -ForegroundColor Gray
        Write-Host "$($serverProcess.Id)" -ForegroundColor White
        Write-Host "   Puerto:     " -NoNewline -ForegroundColor Gray
        Write-Host "$PORT" -ForegroundColor White
        Write-Host "   URL:        " -NoNewline -ForegroundColor Gray
        Write-Host "http://localhost:$PORT" -ForegroundColor Cyan
        
        # Memoria utilizada
        $memoryMB = [math]::Round($serverProcess.WorkingSet64 / 1MB, 2)
        Write-Host "   Memoria:    " -NoNewline -ForegroundColor Gray
        Write-Host "$memoryMB MB" -ForegroundColor White
    } else {
        Write-Host "   Estado:     " -NoNewline -ForegroundColor Gray
        Write-Host "🔴 DETENIDO" -ForegroundColor Red
        Write-Host "   Puerto:     " -NoNewline -ForegroundColor Gray
        Write-Host "$PORT (libre)" -ForegroundColor White
    }
    Write-Host ""
}

function Restart-Server {
    Write-Host "🔄 Reiniciando servidor..." -ForegroundColor Yellow
    Write-Host ""
    Stop-Server
    Start-Sleep -Seconds 2
    Start-Server
}

# =====================================================
# MAIN
# =====================================================

Show-Banner

switch ($Action) {
    'start' {
        Start-Server
    }
    'stop' {
        Stop-Server
    }
    'restart' {
        Restart-Server
    }
    'status' {
        Show-Status
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
