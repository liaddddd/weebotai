# בדיקה אם http-server מותקן
$httpServerExists = $null
try {
    $httpServerExists = Get-Command http-server -ErrorAction SilentlyContinue
} catch {
    $httpServerExists = $null
}

# בדיקה אם פיתון מותקן
$pythonExists = $null
try {
    $pythonExists = Get-Command python -ErrorAction SilentlyContinue
} catch {
    $pythonExists = $null
}

if ($httpServerExists) {
    Write-Host "מריץ שרת באמצעות http-server..." -ForegroundColor Green
    Write-Host "האתר יהיה זמין בכתובת http://localhost:8080" -ForegroundColor Cyan
    http-server -o
} elseif ($pythonExists) {
    $pythonVersion = & python --version
    if ($pythonVersion -like "*Python 3*") {
        Write-Host "מריץ שרת באמצעות Python..." -ForegroundColor Green
        Write-Host "האתר יהיה זמין בכתובת http://localhost:8000" -ForegroundColor Cyan
        Write-Host "לחץ על Ctrl+C לסיום השרת" -ForegroundColor Yellow
        python -m http.server 8000
    } else {
        Write-Host "נמצא Python אך לא גרסה 3.x. נסה להתקין Python 3.x או http-server." -ForegroundColor Red
    }
} else {
    Write-Host "לא נמצאו http-server או Python." -ForegroundColor Red
    Write-Host "ניתן להתקין http-server באמצעות: npm install -g http-server" -ForegroundColor Yellow
    Write-Host "או להוריד Python מ: https://www.python.org/downloads/" -ForegroundColor Yellow
    
    $installNode = Read-Host "האם ברצונך לנסות להתקין node.js עכשיו? (y/n)"
    if ($installNode -eq "y") {
        $nodePath = "$env:TEMP\node-installer.msi"
        Write-Host "מוריד את קובץ ההתקנה של Node.js..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi" -OutFile $nodePath
        Write-Host "מתקין Node.js..." -ForegroundColor Cyan
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodePath`" /quiet /passive" -Wait
        Write-Host "התקנת Node.js הושלמה. כעת מתקין http-server..." -ForegroundColor Green
        Start-Process -FilePath "npm" -ArgumentList "install -g http-server" -Wait
        Write-Host "התקנת http-server הושלמה. מריץ את השרת..." -ForegroundColor Green
        Start-Process -FilePath "http-server" -ArgumentList "-o" -Wait
    } else {
        Write-Host "אנא התקן http-server או Python באופן ידני ונסה שוב." -ForegroundColor Yellow
    }
}

# השהייה בסוף כדי שהמשתמש יוכל לראות את התוצאות
Read-Host -Prompt "לחץ Enter לסגירת החלון" 