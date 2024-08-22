REM Package up all necessary files.
REM Currently named with a TXT extension to avoid issues with downloading batch files to secure environments
REM Rename to build.bat if you want to execute this

del visualisations.zip
powershell.exe Compress-Archive -Path Code -DestinationPath visualisations.zip
powershell.exe Compress-Archive -Update -Path package.json -DestinationPath visualisations.zip
