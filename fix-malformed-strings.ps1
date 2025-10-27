# Fix malformed template strings in React components
$sourceDir = "c:\Users\rahul\OneDrive\Desktop\ats-system\client\src"
$files = Get-ChildItem -Path $sourceDir -Recurse -Include "*.js" | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix malformed API_URL constants
    $content = $content -replace "const API_URL = process\.env\.REACT_APP_API_URL \|\| '\\\$\{process\.env\.REACT_APP_API_URL \|\| 'http://localhost:5000'\}';", "const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';"
    
    # Fix malformed template literals in axios calls
    $content = $content -replace "\\\$\{process\.env\.REACT_APP_API_URL \|\| '\\\$\{process\.env\.REACT_APP_API_URL \|\| 'http://localhost:5000'\}'\}", "`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}"
    
    # Fix other malformed patterns
    $content = $content -replace "\\\$\{process\.env\.REACT_APP_API_URL \|\| 'http://localhost:5000'\}", "`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "✅ Fixed malformed strings in: $($file.Name)"
    }
}

Write-Host "`n🎉 Finished fixing malformed template strings!"