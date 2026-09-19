# One-shot: 4:5 JPEG thumbs for Stories grid (Windows, System.Drawing).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path (Join-Path $Root "backend\media\public\stories"))) {
  $Root = Split-Path -Parent $PSScriptRoot
}
$srcDir = Join-Path $Root "backend\media\public\stories"
$outDir = Join-Path $srcDir "thumbs"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Add-Type -AssemblyName System.Drawing
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }
$enc = New-Object System.Drawing.Imaging.EncoderParameters(1)
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  [long]82
)

$outW = 720
$outH = 900
Get-ChildItem (Join-Path $srcDir "*.png") | ForEach-Object {
  $src = [System.Drawing.Image]::FromFile($_.FullName)
  $targetRatio = $outW / $outH
  $srcRatio = $src.Width / $src.Height
  if ($srcRatio -gt $targetRatio) {
    $cropH = $src.Height
    $cropW = [int]($cropH * $targetRatio)
    $sx = [int](($src.Width - $cropW) / 2)
    $sy = 0
  } else {
    $cropW = $src.Width
    $cropH = [int]($cropW / $targetRatio)
    $sx = 0
    $sy = [int](($src.Height - $cropH) / 2)
  }
  $dest = New-Object System.Drawing.Bitmap $outW, $outH
  $g = [System.Drawing.Graphics]::FromImage($dest)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage(
    $src,
    (New-Object System.Drawing.Rectangle 0, 0, $outW, $outH),
    $sx, $sy, $cropW, $cropH,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $outPath = Join-Path $outDir ([IO.Path]::GetFileNameWithoutExtension($_.Name) + ".jpg")
  $dest.Save($outPath, $codec, $enc)
  $g.Dispose(); $dest.Dispose(); $src.Dispose()
  Write-Host ("wrote {0} ({1:N0} KB)" -f $outPath, ((Get-Item $outPath).Length / 1KB))
}
