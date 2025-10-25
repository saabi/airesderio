# PowerShell script to set up WSL port forwarding for SvelteKit dev server
# Run this script as Administrator in Windows PowerShell

# Get WSL IP address
$wslIP = "172.24.8.171"  # Your current WSL IP
$port = "5174"

Write-Host "Setting up port forwarding for SvelteKit dev server..."
Write-Host "WSL IP: $wslIP"
Write-Host "Port: $port"

# Remove any existing port forwarding rule for this port
Write-Host "Removing any existing port forwarding rules..."
netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null

# Add new port forwarding rule
Write-Host "Adding port forwarding rule..."
netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIP

# Add Windows Firewall rule
Write-Host "Adding Windows Firewall rule..."
netsh advfirewall firewall delete rule name="SvelteKit Dev Server" 2>$null
netsh advfirewall firewall add rule name="SvelteKit Dev Server" dir=in action=allow protocol=TCP localport=$port

# Show current port forwarding rules
Write-Host "`nCurrent port forwarding rules:"
netsh interface portproxy show all

Write-Host "`nSetup complete! Your SvelteKit dev server should now be accessible from other devices on your network."
Write-Host "Access it using your Windows machine's IP address on port $port"
Write-Host "Example: http://[YOUR_WINDOWS_IP]:$port"
