$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$chromeExists =
  (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") -or
  (Test-Path "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe")

$channelArgs = @()
if ($chromeExists) {
  $channelArgs = @("--channel=chrome")
}

function Get-FileUrl {
  param(
    [string]$RelativePath,
    [string]$Suffix = ""
  )

  $path = Resolve-Path (Join-Path $root $RelativePath)
  return ([Uri]$path.Path).AbsoluteUri + $Suffix
}

function Capture {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Size
  )

  $dest = Join-Path $outDir $Name
  & npx --yes playwright screenshot `
    --browser=chromium `
    @channelArgs `
    --timeout=60000 `
    --wait-for-timeout=1200 `
    "--viewport-size=$Size" `
    $Url `
    $dest | Out-Null
  Write-Host "Saved $Name"
}

Capture "01-old-site-home.png" "https://bulak-su.com/" "1440,1100"
Capture "02-site-structure.png" (Get-FileUrl "docs/structure.html") "1440,1100"
Capture "03-wireframe.png" (Get-FileUrl "docs/wireframe.html") "1440,1200"
Capture "04-moodboard.png" (Get-FileUrl "docs/moodboard.html") "1440,1100"
Capture "05-final-home-desktop.png" (Get-FileUrl "index.html" "?shot=home") "1440,1100"
Capture "06-final-catalog-desktop.png" (Get-FileUrl "index.html" "?shot=catalog#products") "1440,1100"
Capture "07-final-order-modal.png" (Get-FileUrl "index.html" "?shot=order") "1440,1100"
Capture "08-final-mobile-home.png" (Get-FileUrl "index.html" "?shot=home") "390,900"
Capture "09-final-mobile-catalog.png" (Get-FileUrl "index.html" "?shot=mobile#products") "390,900"
Capture "10-final-pet-products.png" (Get-FileUrl "index.html" "?shot=pet#products") "1440,1100"
