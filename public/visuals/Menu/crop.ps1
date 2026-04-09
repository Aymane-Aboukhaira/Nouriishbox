# Load the required .NET assembly
Add-Type -AssemblyName System.Drawing

$folderPath = "C:\Users\lenovo\nnn\public\menu"
$outputFolder = Join-Path -Path $folderPath -ChildPath "Cropped"

if (-not (Test-Path -Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
}

# Grab all your images
$images = Get-ChildItem -Path $folderPath -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|jfif)$" }

foreach ($image in $images) {
    try {
        # Open original image
        $img = [System.Drawing.Bitmap]::FromFile($image.FullName)
        
        if ($img.Width -ge 955) {
            
            # 1. Create a strict 955px wide canvas
            $newImg = New-Object System.Drawing.Bitmap(955, $img.Height)
            
            # 2. Force the canvas to a standard 96 DPI to kill any weird Windows scaling
            $newImg.SetResolution(96, 96)
            
            $graphics = [System.Drawing.Graphics]::FromImage($newImg)
            
            # 3. STRICTLY force the graphics object to map Pixel-for-Pixel
            $graphics.PageUnit = [System.Drawing.GraphicsUnit]::Pixel
            
            # 4. THE TRICK: Tell Windows to draw the ENTIRE original image exactly as is.
            # We explicitly define the source and destination sizes in raw pixels.
            # Because our canvas is only 955px wide, the right edge cleanly spills over and disappears.
            $destRect = New-Object System.Drawing.Rectangle(0, 0, $img.Width, $img.Height)
            $graphics.DrawImage($img, $destRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel)
            
            # 5. Define output and save
            $outputPath = Join-Path -Path $outputFolder -ChildPath $image.Name
            if ($image.Extension.ToLower() -match "png") {
                $newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            } else {
                $newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
            }
            
            # 6. Clean up memory
            $graphics.Dispose()
            $newImg.Dispose()
            
            Write-Host "Successfully force-cropped: $($image.Name)" -ForegroundColor Green
        } else {
            Write-Host "Skipped (already smaller than 955px wide): $($image.Name)" -ForegroundColor Yellow
        }
        
        $img.Dispose()
        
    } catch {
        Write-Host "Failed to process $($image.Name): $_" -ForegroundColor Red
    }
}

Write-Host "Done! This method completely ignores DPI scaling, so your images should be perfect." -ForegroundColor Cyan