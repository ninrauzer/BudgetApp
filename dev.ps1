# BudgetApp Development Server Manager
# Uso: .\dev.ps1 [start|stop|restart|status]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start','stop','restart','status')]
    [string]$Action
)

$BackendDir = "E:\Desarrollo\BudgetApp\backend"
$FrontendDir = "E:\Desarrollo\BudgetApp\frontend"
$BackendPort = 8000
$FrontendPort = 5173

function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Get-ServerStatus {
    Write-ColorOutput Cyan "`n=== Estado de Servidores ==="
    
    # Check Backend
    $backendProcess = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -like "*uvicorn*" -or 
        (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $BackendPort })
    }
    
    if ($backendProcess) {
        Write-ColorOutput Green "✓ Backend (FastAPI): CORRIENDO en http://localhost:$BackendPort (PID: $($backendProcess.Id))"
    } else {
        Write-ColorOutput Red "✗ Backend (FastAPI): DETENIDO"
    }
    
    # Check Frontend
    $frontendProcess = Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue
    if ($frontendProcess) {
        $nodeProcess = Get-Process -Id $frontendProcess.OwningProcess -ErrorAction SilentlyContinue
        Write-ColorOutput Green "✓ Frontend (Vite): CORRIENDO en http://localhost:$FrontendPort (PID: $($nodeProcess.Id))"
    } else {
        Write-ColorOutput Red "✗ Frontend (Vite): DETENIDO"
    }
    
    Write-Host ""
}

function Stop-Servers {
    Write-ColorOutput Yellow "`nDeteniendo servidores..."
    
    # Stop Backend (Python/Uvicorn on port 8000)
    $backendConnection = Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue
    if ($backendConnection) {
        $backendPID = $backendConnection.OwningProcess
        Write-ColorOutput Yellow "Deteniendo Backend (PID: $backendPID)..."
        Stop-Process -Id $backendPID -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-ColorOutput Green "✓ Backend detenido"
    } else {
        Write-ColorOutput Gray "Backend ya estaba detenido"
    }
    
    # Stop Frontend (Node/Vite on port 5173)
    $frontendConnection = Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue
    if ($frontendConnection) {
        $frontendPID = $frontendConnection.OwningProcess
        Write-ColorOutput Yellow "Deteniendo Frontend (PID: $frontendPID)..."
        Stop-Process -Id $frontendPID -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-ColorOutput Green "✓ Frontend detenido"
    } else {
        Write-ColorOutput Gray "Frontend ya estaba detenido"
    }
    
    Write-ColorOutput Green "`n✓ Servidores detenidos exitosamente"
}

function Start-Servers {
    Write-ColorOutput Yellow "`nIniciando servidores..."
    
    # Check if already running
    $backendRunning = Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue
    $frontendRunning = Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue
    
    if ($backendRunning -or $frontendRunning) {
        Write-ColorOutput Red "⚠ Algunos servidores ya están corriendo. Usa 'restart' para reiniciar."
        Get-ServerStatus
        return
    }
    
    # Start Backend
    Write-ColorOutput Cyan "Iniciando Backend (FastAPI)..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$BackendDir'; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port $BackendPort"
    ) -WindowStyle Normal
    
    Start-Sleep -Seconds 3
    
    # Start Frontend
    Write-ColorOutput Cyan "Iniciando Frontend (Vite)..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$FrontendDir'; npm run dev"
    ) -WindowStyle Normal
    
    Start-Sleep -Seconds 3
    
    Write-ColorOutput Green "`n✓ Servidores iniciados"
    Get-ServerStatus
    
    Write-ColorOutput Yellow "`nURLs disponibles:"
    Write-ColorOutput White "  Frontend: http://localhost:$FrontendPort"
    Write-ColorOutput White "  Backend API: http://localhost:$BackendPort"
    Write-ColorOutput White "  API Docs: http://localhost:$BackendPort/docs"
}

function Restart-Servers {
    Write-ColorOutput Yellow "`nReiniciando servidores..."
    Stop-Servers
    Start-Sleep -Seconds 2
    Start-Servers
}

# Main execution
switch ($Action) {
    'start' {
        Start-Servers
    }
    'stop' {
        Stop-Servers
    }
    'restart' {
        Restart-Servers
    }
    'status' {
        Get-ServerStatus
    }
}
