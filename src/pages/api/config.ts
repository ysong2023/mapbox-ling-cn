import path from 'path';
import fs from 'fs';

// Paths to the data files
export const getDataFilePaths = () => {
  // Navigate up from the current directory to find the data
  const rootDir = path.resolve(process.cwd(), '..');
  const processedDataDir = path.join(rootDir, 'data', 'processed');
  
  // Check if the processed directory exists
  if (!fs.existsSync(processedDataDir)) {
    console.warn(`Warning: Processed data directory not found at ${processedDataDir}`);
    // Create the directory if it doesn't exist
    fs.mkdirSync(processedDataDir, { recursive: true });
  }
  
  return {
    geoJsonPath: path.join(processedDataDir, 'guizhou_counties.geojson'),
    lingDataPath: path.join(processedDataDir, 'guizhou_ling_data.json')
  };
}; 