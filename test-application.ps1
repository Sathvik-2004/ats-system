# Test Application Submission
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Create multipart form data
$bodyLines = 
    "--$boundary",
    "Content-Disposition: form-data; name=`"name`"$LF",
    "Test User",
    "--$boundary",
    "Content-Disposition: form-data; name=`"email`"$LF", 
    "testuser@example.com",
    "--$boundary",
    "Content-Disposition: form-data; name=`"jobId`"$LF",
    "68fb8b7f9f3818ef96eac165",
    "--$boundary",
    "Content-Disposition: form-data; name=`"resume`"; filename=`"test-resume.txt`"",
    "Content-Type: text/plain$LF",
    "Test Resume Content - Name: Test User, Skills: JavaScript, React, Node.js",
    "--$boundary--$LF"

$body = $bodyLines -join $LF

# Submit application
try {
    $response = Invoke-WebRequest -Uri "https://lessats-systemgreater-production.up.railway.app/api/applicants/apply" -Method POST -Body $body -ContentType "multipart/form-data; boundary=$boundary" -Headers @{Authorization="Bearer $env:testToken"}
    Write-Host "Application submission status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Application submission error: $($_.Exception.Message)"
    Write-Host "Response content: $($_.Exception.Response)"
}