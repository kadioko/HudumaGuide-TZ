$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$keystorePath = Join-Path $env:USERPROFILE 'Downloads\android-upload-keystore.jks'
$credentialsPath = Join-Path $projectRoot 'credentials.json'
$validationKeystorePath = Join-Path ([IO.Path]::GetTempPath()) "hudumaguide-key-validation-$([Guid]::NewGuid().ToString('N')).p12"

if (-not (Test-Path -LiteralPath $keystorePath)) {
  throw "The recovered keystore was not found at $keystorePath"
}

if (Test-Path -LiteralPath $credentialsPath) {
  throw "Refusing to overwrite $credentialsPath. Move or remove it before running this script."
}

function Convert-SecureStringToPlainText([Security.SecureString] $secureValue) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

$storePassword = $null
$keyPassword = $null

try {
  Write-Host 'HudumaGuide TZ Play upload-key recovery' -ForegroundColor Green
  Write-Host 'Enter passwords only in this local terminal. They will not be written to Git.'

  $storePassword = Convert-SecureStringToPlainText (Read-Host 'Keystore password' -AsSecureString)
  $keyPassword = Convert-SecureStringToPlainText (Read-Host 'Key password' -AsSecureString)

  if ([string]::IsNullOrWhiteSpace($storePassword) -or [string]::IsNullOrWhiteSpace($keyPassword)) {
    throw 'Both passwords are required.'
  }

  # Verify both passwords and the known private-key alias before an EAS job is submitted.
  $validationPassword = -join ((1..32) | ForEach-Object { 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.ToCharArray() | Get-Random })
  & keytool -importkeystore `
    -srckeystore $keystorePath `
    -srcstoretype JKS `
    -srcstorepass $storePassword `
    -srcalias upload `
    -srckeypass $keyPassword `
    -destkeystore $validationKeystorePath `
    -deststoretype PKCS12 `
    -deststorepass $validationPassword `
    -destkeypass $validationPassword `
    -noprompt

  if ($LASTEXITCODE -ne 0) {
    throw 'The keystore password or key password is incorrect for alias upload. No EAS build was started.'
  }

  Remove-Item -LiteralPath $validationKeystorePath -Force

  $credentials = @{
    android = @{
      keystore = @{
        keystorePath = $keystorePath
        keystorePassword = $storePassword
        keyAlias = 'upload'
        keyPassword = $keyPassword
      }
    }
  } | ConvertTo-Json -Depth 5

  [IO.File]::WriteAllText($credentialsPath, $credentials, [Text.UTF8Encoding]::new($false))
  Set-Location -LiteralPath $projectRoot
  & npx eas-cli@latest build --platform android --profile play-upload-recovery --non-interactive --no-wait

  if ($LASTEXITCODE -ne 0) {
    throw "EAS Build did not start (exit code $LASTEXITCODE)."
  }

  Write-Host 'Build submitted. The temporary local credentials file will now be removed.' -ForegroundColor Green
} finally {
  if (Test-Path -LiteralPath $credentialsPath) {
    Remove-Item -LiteralPath $credentialsPath -Force
  }

  if (Test-Path -LiteralPath $validationKeystorePath) {
    Remove-Item -LiteralPath $validationKeystorePath -Force
  }

  $storePassword = $null
  $keyPassword = $null
}
