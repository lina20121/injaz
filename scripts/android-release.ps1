$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$signingDirectory = Join-Path $env:APPDATA 'Injaz\AndroidSigning'
$keystore = Join-Path $signingDirectory 'injaz-upload.jks'
$passwordFile = Join-Path $signingDirectory 'signing-password.txt'
$loadedLocalCredentials = -not ($env:ANDROID_KEYSTORE_FILE -and $env:ANDROID_KEYSTORE_PASSWORD -and $env:ANDROID_KEY_ALIAS -and $env:ANDROID_KEY_PASSWORD)

if ($loadedLocalCredentials) {
    if (-not (Test-Path $keystore) -or -not (Test-Path $passwordFile)) {
        throw 'Android signing credentials are not configured. Set the ANDROID_KEYSTORE_* environment variables or create the local upload keystore.'
    }

    Add-Type -AssemblyName System.Security
    $encryptedPasswordHex = (Get-Content -Raw $passwordFile).Trim()
    $encryptedPassword = New-Object byte[] ($encryptedPasswordHex.Length / 2)
    for ($index = 0; $index -lt $encryptedPasswordHex.Length; $index += 2) {
        $encryptedPassword[$index / 2] = [Convert]::ToByte($encryptedPasswordHex.Substring($index, 2), 16)
    }
    $passwordBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
        $encryptedPassword,
        $null,
        [System.Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    $password = [Text.Encoding]::Unicode.GetString($passwordBytes)
    $env:ANDROID_KEYSTORE_FILE = $keystore
    $env:ANDROID_KEYSTORE_PASSWORD = $password
    $env:ANDROID_KEY_ALIAS = 'injaz-upload'
    $env:ANDROID_KEY_PASSWORD = $password
}

$buildExitCode = 1
Push-Location $repoRoot
try {
    npm run android:sync
    if ($LASTEXITCODE -eq 0) {
        Push-Location (Join-Path $repoRoot 'android')
        try {
            & .\gradlew.bat assembleRelease bundleRelease
            $buildExitCode = $LASTEXITCODE
        }
        finally {
            Pop-Location
        }
    }
    else {
        $buildExitCode = $LASTEXITCODE
    }
}
finally {
    Pop-Location
    if ($loadedLocalCredentials) {
        Remove-Item Env:ANDROID_KEYSTORE_PASSWORD -ErrorAction SilentlyContinue
        Remove-Item Env:ANDROID_KEY_PASSWORD -ErrorAction SilentlyContinue
        $password = $null
        $passwordBytes = $null
        $encryptedPassword = $null
    }
}

exit $buildExitCode