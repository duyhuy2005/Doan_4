$login = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"email":"admin@carrental.com","password":"Admin@123"}'
$token = $login.data.accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Host "Bookings:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/bookings' -Headers $headers).data.Count
Write-Host "Customers:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/customers' -Headers $headers).data.Count
Write-Host "Staff:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/staff' -Headers $headers).data.Count
Write-Host "Maintenance:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/maintenance' -Headers $headers).data.Count
Write-Host "Reviews:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/reviews' -Headers $headers).data.Count
Write-Host "Payments:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/payments' -Headers $headers).data.Count
Write-Host "Contracts:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/contracts' -Headers $headers).data.Count
Write-Host "Handovers:" (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/handovers' -Headers $headers).data.Count
