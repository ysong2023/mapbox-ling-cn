#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "NEXT_PUBLIC_MAPBOX_TOKEN=" > .env
  echo "Please edit the .env file and add your Mapbox token before continuing."
  exit 1
fi

# Check if Mapbox token is set
if [ -z "$(grep -oP 'NEXT_PUBLIC_MAPBOX_TOKEN=\K.*' .env)" ]; then
  echo "Mapbox token is not set in .env file."
  echo "Please add your Mapbox token to the .env file before continuing."
  exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker-compose build

# Run the Docker container
echo "Starting the application..."
docker-compose up -d

echo "Application is now running at http://localhost:3000" 