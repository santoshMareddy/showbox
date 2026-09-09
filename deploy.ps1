# Publishes the demo site: builds app/ and pushes app/dist to the gh-pages branch, which GitHub
# Pages serves at https://santoshmareddy.github.io/showbox/
#
#   .\deploy.ps1              build and publish
#   .\deploy.ps1 -SkipWeb     publish the build already in app/dist

param(
    [switch]$SkipWeb
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $repo 'app\dist'
$remote = 'https://github.com/santoshMareddy/showbox.git'

if (-not $SkipWeb) {
    Write-Host '==> Building the web app' -ForegroundColor Magenta
    Push-Location (Join-Path $repo 'app')
    npm run build
    if ($LASTEXITCODE -ne 0) { Pop-Location; throw 'The web build failed.' }
    Pop-Location
}
if (-not (Test-Path (Join-Path $dist 'index.html'))) { throw 'app/dist has no build in it.' }

# Pages must not run Jekyll over the build.
New-Item -ItemType File -Force -Path (Join-Path $dist '.nojekyll') | Out-Null

Write-Host '==> Publishing app/dist to gh-pages' -ForegroundColor Magenta
Push-Location $dist
try {
    if (Test-Path '.git') { Remove-Item -Recurse -Force '.git' }
    git init -q -b gh-pages
    git config user.name 'Santosh Mareddy'
    git config user.email '21692853+santoshMareddy@users.noreply.github.com'
    git add -A
    git -c core.safecrlf=false commit -q -m ("Publish " + (Get-Date -Format 'yyyy-MM-dd HH:mm'))
    git push -f $remote gh-pages:gh-pages
    if ($LASTEXITCODE -ne 0) { throw 'The push to gh-pages failed.' }
} finally {
    if (Test-Path '.git') { Remove-Item -Recurse -Force '.git' }
    Pop-Location
}

Write-Host ''
Write-Host '==> Pushed. GitHub Pages picks it up within a minute or two:' -ForegroundColor Green
Write-Host '    https://santoshmareddy.github.io/showbox/'
Write-Host '    https://santoshmareddy.github.io/showbox/get.html'
