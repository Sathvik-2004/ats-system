# Fix all hardcoded localhost URLs in React components
$sourceDir = "c:\Users\rahul\OneDrive\Desktop\ats-system\client\src"
$files = Get-ChildItem -Path $sourceDir -Recurse -Include "*.js" | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Skip files that already properly use environment variables
    if ($content -match "process\.env\.REACT_APP_API_URL.*http://localhost:5000" -and 
        $content -notmatch "http://localhost:5000(?!'\s*\)|'$)") {
        continue
    }
    
    # Replace hardcoded localhost URLs with environment variable usage
    $content = $content -replace "(['\`])http://localhost:5000(['\`])", "`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}"
    $content = $content -replace "(['`"])http://localhost:5000/api/", "`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/"
    
    # Add API_URL constant where needed
    if ($content -match "http://localhost:5000" -and $content -notmatch "const API_URL = process\.env\.REACT_APP_API_URL") {
        # Look for axios imports to add API_URL after imports
        if ($content -match "import.*axios.*from.*['`]axios['`];") {
            $content = $content -replace "(import.*axios.*from.*['`]axios['`];)", "`$1`r`n`r`nconst API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';"
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "✅ Updated: $($file.Name)"
    }
}

Write-Host "`n🎉 Finished updating all React components with environment variables!"