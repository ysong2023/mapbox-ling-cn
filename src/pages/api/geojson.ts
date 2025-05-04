import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { getDataFilePaths } from './config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get path to the GeoJSON file
    const { geoJsonPath } = getDataFilePaths();
    
    console.log('GeoJSON Path:', geoJsonPath);
    
    // Check if file exists
    if (!fs.existsSync(geoJsonPath)) {
      console.error('GeoJSON file not found at:', geoJsonPath);
      return res.status(404).json({ 
        error: 'GeoJSON file not found',
        path: geoJsonPath
      });
    }
    
    console.log('Reading GeoJSON file...');
    
    // Read the GeoJSON file
    const fileData = fs.readFileSync(geoJsonPath, 'utf8');
    const jsonData = JSON.parse(fileData);
    
    // Check if the parsed data has the expected structure
    console.log('GeoJSON parsed. Features count:', jsonData.features?.length);
    if (jsonData.features && jsonData.features.length > 0) {
      // Log the properties of the first feature
      console.log('First feature properties:', jsonData.features[0].properties);
    }
    
    // Return the data
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading GeoJSON file:', error);
    res.status(500).json({ error: 'Failed to load GeoJSON data', details: String(error) });
  }
} 