# Enable Network Discovery and File Sharing
function Enable-NetworkDiscoveryAndFileSharing {
    Write-Host "Enabling Network Discovery and File Sharing..."

    # Enable Network Discovery
    Set-NetFirewallRule -DisplayGroup "Network Discovery" -Enabled True

    # Enable File and Printer Sharing
    Set-NetFirewallRule -DisplayGroup "File and Printer Sharing" -Enabled True

    # Set network profile to private
    Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private

    Write-Host "Network Discovery and File Sharing Enabled."
}

# Create and Share a Folder
function Create-AndShareFolder {
    param (
        [string]$folderPath,
        [string]$shareName,
        [string]$shareDescription,
        [string]$sharePermissions
    )

    # Check if folder exists, if not, create it
    if (-Not (Test-Path -Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath
        Write-Host "Folder $folderPath created."
    }

    # Share the folder
    $share = New-SmbShare -Name $shareName -Path $folderPath -Description $shareDescription -FullAccess $sharePermissions
    Write-Host "Folder $folderPath shared as $shareName with permissions: $sharePermissions."
}

# Main script
$folderPath = "C:\SharedFolder"
$shareName = "SharedFolder"
$shareDescription = "This is a shared folder."
$sharePermissions = "Everyone"

# Enable Network Discovery and File Sharing
Enable-NetworkDiscoveryAndFileSharing

# Create and Share the Folder
Create-AndShareFolder -folderPath $folderPath -shareName $shareName -shareDescription $shareDescription -sharePermissions $sharePermissions

Write-Host "File sharing setup completed."
