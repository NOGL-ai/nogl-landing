# Test authentication and API access
Write-Host "Testing authentication..."

# Method 1: Check if already logged in
Write-Host "1. Checking existing session..."
$sessionResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/session" -Method GET
Write-Host "Session response: $sessionResponse"

# Method 2: Try to login with fetchSession (requires only email)
Write-Host "2. Attempting login with fetchSession..."
$loginBody = @{
    email = "test@example.com"
    callbackUrl = "http://localhost:3000"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signin/fetchSession" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login response: $loginResponse"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
}

# Method 3: Test products API (this will show the actual error)
Write-Host "3. Testing products API..."
try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/products?page=1&limit=2" -Method GET
    Write-Host "Products response: $productsResponse"
} catch {
    Write-Host "Products API failed: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}
