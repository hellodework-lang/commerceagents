# Real-time Git Synchronization Daemon
# This script continuously checks for remote changes and automatically pulls them.
# It also detects local file saves and automatically commits and pushes them.

$repoPath = "."
Set-Location -Path $repoPath

$branch = (git branch --show-current)
Write-Host "Starting real-time synchronization on branch: $branch" -ForegroundColor Cyan
Write-Host "Do not close this window. Your code will sync automatically." -ForegroundColor Yellow

$lastCommitHash = (git rev-parse HEAD)

# Start a background job to handle auto-pulling
$job = Start-Job -ScriptBlock {
    param($branch)
    while ($true) {
        Start-Sleep -Seconds 3
        # Fetch silently
        $null = git fetch origin $branch -q
        
        $localHash = git rev-parse HEAD
        $remoteHash = git rev-parse origin/$branch
        
        if ($localHash -ne $remoteHash) {
            # Check if we can fast-forward or merge without conflict
            $status = git status --porcelain
            if ([string]::IsNullOrWhiteSpace($status)) {
                Write-Host "`n[Sync] Detected remote changes from partner. Auto-pulling..." -ForegroundColor Green
                git pull origin $branch --rebase -q
            } else {
                # Stash local work, pull, and pop
                Write-Host "`n[Sync] Detected remote changes. Stashing local work to sync..." -ForegroundColor Yellow
                git stash -q
                git pull origin $branch --rebase -q
                git stash pop -q
            }
        }
    }
} -ArgumentList $branch

# File system watcher for auto-pushing local changes
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = (Get-Location).Path
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.Filter = "*.*"

$action = {
    $path = $Event.SourceEventArgs.FullPath
    
    # Ignore .git folder changes
    if ($path -match "\\.git\\") { return }
    
    $status = git status --porcelain
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        Write-Host "`n[Sync] Local save detected. Auto-pushing to cloud..." -ForegroundColor Cyan
        git add .
        git commit -m "auto-sync: real-time live update" -q
        git push origin $branch -q
    }
}

Register-ObjectEvent $watcher "Changed" -Action $action > $null
Register-ObjectEvent $watcher "Created" -Action $action > $null
Register-ObjectEvent $watcher "Deleted" -Action $action > $null
Register-ObjectEvent $watcher "Renamed" -Action $action > $null

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Stop-Job $job
    Remove-Job $job
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
}
