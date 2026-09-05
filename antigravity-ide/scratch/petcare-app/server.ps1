$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "PetCare Web Server listening on http://localhost:8080/"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    
    $relPath = if ($req.Url.LocalPath -eq "/") { "index.html" } else { $req.Url.LocalPath.TrimStart("/") }
    $filePath = Join-Path "C:\Users\VICTUS\.gemini\antigravity-ide\scratch\petcare-app" $relPath
    
    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.ContentLength64 = $bytes.Length
        $res.ContentType = if ($filePath.EndsWith(".html")) { "text/html; charset=utf-8" } else { "text/plain" }
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
    }
    $res.OutputStream.Close()
}
