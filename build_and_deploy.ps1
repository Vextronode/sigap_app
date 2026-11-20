# PowerShell script to setup Arduino CLI on a CI server or local machine and build the firmware
# ------------------------------------------------------------
# 1. Download Arduino CLI (if not already present)
# ------------------------------------------------------------
$cliUrl = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip"
$zipPath = "$PSScriptRoot\arduino-cli.zip"
$cliDir  = "$PSScriptRoot\arduino-cli"
if (-not (Test-Path $cliDir)) {
    Write-Host "Downloading Arduino CLI..."
    Invoke-WebRequest -Uri $cliUrl -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $cliDir -Force
    Remove-Item $zipPath
}
# Add arduino-cli to PATH for this session
$env:Path = "$cliDir;$env:Path"

# ------------------------------------------------------------
# 2. Install ESP32 core (required for ESP32‑C3)
# ------------------------------------------------------------
arduino-cli core update-index
arduino-cli core install esp32:esp32

# ------------------------------------------------------------
# 3. Install required libraries (WiFi, HTTPClient, Preferences, ArduinoJson, RF24)
# ------------------------------------------------------------
arduino-cli lib install WiFi
arduino-cli lib install HTTPClient
arduino-cli lib install Preferences
arduino-cli lib install ArduinoJson
# RF24 is bundled in the repository under firmware/main_device/libraries/RF24; no need to install via CLI

# ------------------------------------------------------------
# 4. Build the sketch
# ------------------------------------------------------------
$sketch = "firmware/main_device"
arduino-cli compile --fqbn esp32:esp32:esp32c3 $sketch
if ($LASTEXITCODE -ne 0) { throw "Compilation failed" }

# ------------------------------------------------------------
# 5. (Optional) Upload to device – replace COMX with the actual port
# ------------------------------------------------------------
# $port = "COM3"
# arduino-cli upload -p $port --fqbn esp32:esp32:esp32c3 $sketch

Write-Host "Build completed successfully"
