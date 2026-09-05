$ownerHtml = [IO.File]::ReadAllText("owner-dashboard.html")
$vetHtml = [IO.File]::ReadAllText("vet-profile.html")

$ownerSidebar = [regex]::Match($ownerHtml, '(?s)<nav id="appSidebar".*?</nav>').Value
$ownerMobile = [regex]::Match($ownerHtml, '(?s)<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2">.*?</nav>').Value

$vetHtml = [regex]::Replace($vetHtml, '(?s)<nav id="appSidebar".*?</nav>', $ownerSidebar)

if ([regex]::IsMatch($vetHtml, '(?s)<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0.*?</nav>')) {
    $vetHtml = [regex]::Replace($vetHtml, '(?s)<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0.*?</nav>', $ownerMobile)
} else {
    $vetHtml = $vetHtml.Replace('</body>', "$ownerMobile`r`n</body>")
}

$vetHtml = $vetHtml.Replace('<title>Dr. Ananya Sharma - Doctor Profile | PetCare</title>', '<title>Veterinarian Profile | PetCare</title>')

[IO.File]::WriteAllText("vet-profile.html", $vetHtml)
Write-Output "Successfully updated vet-profile.html with Owner Navigation!"
