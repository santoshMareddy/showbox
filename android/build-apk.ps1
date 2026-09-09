# Builds the ShowBox Android app end to end:
#   web build  ->  bundled into the APK  ->  signed release APK  ->  app/public/showbox.apk
# The APK is a static file on the demo site, so commit app/public/showbox.apk and push to publish it.
#
#   .\build-apk.ps1              full build
#   .\build-apk.ps1 -SkipWeb     reuse the web build already in app/dist

param(
    [switch]$SkipWeb
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Split-Path -Parent $here

# 1. The web app
if (-not $SkipWeb) {
    Write-Host '==> Building the web app' -ForegroundColor Magenta
    Push-Location "$repo\app"
    npm run build
    if ($LASTEXITCODE -ne 0) { Pop-Location; throw 'The web build failed.' }
    Pop-Location
}

# 2. Bundle it into the APK. Site-only extras stay out: the design canvas, the click-through
#    prototype, the install page and the previous APK itself.
Write-Host '==> Bundling the web build into the app' -ForegroundColor Magenta
$assets = "$here\app\src\main\assets\web"
if (Test-Path $assets) { Remove-Item -Recurse -Force $assets }
New-Item -ItemType Directory -Force -Path $assets | Out-Null
Copy-Item -Recurse -Force "$repo\app\dist\*" $assets
foreach ($extra in @('canvas.html', 'get.html', 'showbox.apk')) {
    Remove-Item -Force (Join-Path $assets $extra) -ErrorAction SilentlyContinue
}
Remove-Item -Recurse -Force (Join-Path $assets 'proto') -ErrorAction SilentlyContinue
$bundled = (Get-ChildItem -Recurse -File $assets | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ("    bundled {0:N2} MB of web assets" -f $bundled)

# 3. Gradle
Write-Host '==> Building the APK' -ForegroundColor Magenta
$gradlew = "$here\gradlew.bat"
if (-not (Test-Path $gradlew)) { throw 'gradlew.bat is missing; run gradle wrapper once in this folder.' }
Push-Location $here
& $gradlew assembleRelease --console=plain
$code = $LASTEXITCODE
Pop-Location
if ($code -ne 0) { throw 'The Gradle build failed.' }

# 4. Put it where the site serves it from
$apk = "$here\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) { throw "No APK at $apk" }
$out = "$repo\app\public\showbox.apk"
Copy-Item -Force $apk $out
$kb = [math]::Round((Get-Item $out).Length / 1KB)
Write-Host ''
Write-Host "==> ShowBox.apk ready: $kb KB at app\public\showbox.apk" -ForegroundColor Green
Write-Host '    Commit and push it; the site hands it out at https://santoshmareddy.github.io/showbox/get.html'
