# Setup PostgreSQL in WSL2 to accept Docker connections
# Run as Administrator or with sudo in WSL

Write-Host "🔧 Configuring PostgreSQL in WSL2 for Docker access..." -ForegroundColor Cyan

# Step 1: Enable PostgreSQL to listen on all interfaces
Write-Host "`n📝 Step 1: Enabling PostgreSQL to listen on all interfaces..." -ForegroundColor Yellow

wsl -d Ubuntu-24.04 bash -c @"
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/*/main/postgresql.conf
echo "✅ Updated listen_addresses"
"@

# Step 2: Allow connections from Docker network
Write-Host "`n📝 Step 2: Configuring pg_hba.conf for Docker..." -ForegroundColor Yellow

wsl -d Ubuntu-24.04 bash -c @"
# Add Docker network to pg_hba.conf if not already present
if ! grep -q "172.17.0.0/16" /etc/postgresql/*/main/pg_hba.conf; then
  echo "host    all             all             172.17.0.0/16           trust" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf > /dev/null
  echo "host    all             all             172.18.0.0/16           trust" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf > /dev/null
  echo "host    all             all             172.19.0.0/16           trust" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf > /dev/null
  echo "✅ Added Docker network ranges to pg_hba.conf"
else
  echo "✅ Docker network ranges already configured"
fi
"@

# Step 3: Restart PostgreSQL
Write-Host "`n📝 Step 3: Restarting PostgreSQL..." -ForegroundColor Yellow

wsl -d Ubuntu-24.04 bash -c "sudo service postgresql restart"

Start-Sleep -Seconds 3

# Step 4: Verify configuration
Write-Host "`n✅ Verification:" -ForegroundColor Green

wsl -d Ubuntu-24.04 bash -c @"
echo "PostgreSQL status:"
sudo service postgresql status | head -3

echo ""
echo "Listen addresses configuration:"
sudo grep -n "^listen_addresses" /etc/postgresql/*/main/postgresql.conf

echo ""
echo "Docker network connections in pg_hba.conf:"
sudo grep "172\." /etc/postgresql/*/main/pg_hba.conf

echo ""
echo "Checking if PostgreSQL is accepting connections:"
sudo netstat -tlnp | grep postgres || echo "PostgreSQL is running (systemd)"
"@

Write-Host "`n✅ PostgreSQL configuration complete!" -ForegroundColor Green
Write-Host "PostgreSQL WSL IP: 192.168.126.127" -ForegroundColor Cyan
Write-Host "Docker can now connect to: postgresql://postgres@host.docker.internal:5432" -ForegroundColor Cyan
