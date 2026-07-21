$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Life OS running at http://localhost:8000"
Write-Host "Press Ctrl+C to stop"

$root = $PSScriptRoot

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }

    $filePath = Join-Path $root ($path.TrimStart("/").Replace("/", "\"))

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $types = @{
            ".html" = "text/html"
            ".js"   = "application/javascript"
            ".css"  = "text/css"
            ".json" = "application/json"
            ".png"  = "image/png"
            ".jpg"  = "image/jpeg"
            ".svg"  = "image/svg+xml"
            ".ico"  = "image/x-icon"
        }
        $contentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentType = $contentType
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $context.Response.StatusCode = 404
        $context.Response.ContentType = "text/plain"
        $context.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $context.Response.Close()
}
