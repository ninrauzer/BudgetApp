<#
.SYNOPSIS
Automatiza la creación de un repositorio GitHub desde un proyecto local .NET 8.
Detecta si gh está instalado, inicia sesión si es necesario, crea el repo remoto,
configura git, realiza commit y push automáticamente.
#>

param(
    [string]$RepoName = "",
    [switch]$Private
)

# --- 1. Verificar que gh esté instalado ---
Write-Host "🔍 Checking for GitHub CLI (gh)..."
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "⚙️  GitHub CLI not found. Installing via winget..."
    winget install --id GitHub.cli -e --source winget
    Write-Host "✅ Installed! Please restart PowerShell and rerun this script."
    exit
}

# --- 2. Verificar autenticación ---
Write-Host "🔑 Checking GitHub authentication..."
$authStatus = gh auth status 2>&1
if ($authStatus -match "You are not logged into any GitHub hosts") {
    Write-Host "🔐 Logging into GitHub..."
    gh auth login
}

# --- 3. Detectar nombre del proyecto ---
if (-not $RepoName) {
    $folder = Split-Path -Leaf (Get-Location)
    $RepoName = Read-Host "Enter repository name (default: $folder)"
    if (-not $RepoName) { $RepoName = $folder }
}

# --- 4. Inicializar git si no existe ---
if (-not (Test-Path ".git")) {
    Write-Host "🧱 Initializing local git repository..."
    git init
}

# --- 5. Crear .gitignore básico para .NET ---
if (-not (Test-Path ".gitignore")) {
@"
# Build artifacts
bin/
obj/

# VS / VSCode
.vs/
.vscode/

# OS files
Thumbs.db
.DS_Store
"@ | Out-File -Encoding UTF8 ".gitignore"
    Write-Host "📝 .gitignore created."
}

# --- 6. Commit inicial ---
git add .
git commit -m "Initial commit" 2>$null

# --- 7. Crear repo remoto ---
$visibility = "public"
if ($Private) { $visibility = "private" }

Write-Host "🚀 Creating repository '$RepoName' on GitHub ($visibility)..."
gh repo create $RepoName --source=. --$visibility --push

Write-Host "`n✅ Repository created and pushed successfully!"
Write-Host "🌐 URL: https://github.com/$(gh api user --jq '.login')/$RepoName"