@echo off
SETLOCAL

REM Check if .env file exists
IF NOT EXIST .env (
  echo Creating .env file...
  echo NEXT_PUBLIC_MAPBOX_TOKEN= > .env
  echo Please edit the .env file and add your Mapbox token before continuing.
  exit /b 1
)

REM Check if Mapbox token is set
findstr /C:"NEXT_PUBLIC_MAPBOX_TOKEN=" .env > nul
IF %ERRORLEVEL% NEQ 0 (
  echo Mapbox token is not set in .env file.
  echo Please add your Mapbox token to the .env file before continuing.
  exit /b 1
)

REM Build the Docker image
echo Building Docker image...
docker-compose build

REM Run the Docker container
echo Starting the application...
docker-compose up -d

echo Application is now running at http://localhost:3000

ENDLOCAL 