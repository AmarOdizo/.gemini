$search = '`${import.meta.env.VITE_API_URL}'
$replace = '`${import.meta.env.VITE_API_URL || ''https://odizopetcare.onrender.com''}'

Get-ChildItem -Path "c:\Users\VICTUS\.gemini\antigravity-ide\scratch\petcare-react\src" -Recurse -Include *.js,*.jsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content.Contains($search)) {
        $content = $content.Replace($search, $replace)
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Updated $($_.Name)"
    }
}
Write-Host "Done!"
