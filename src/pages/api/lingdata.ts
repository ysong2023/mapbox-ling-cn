import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { getDataFilePaths } from './config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get path to the linguistic data file
    const { lingDataPath } = getDataFilePaths();
    
    console.log('Linguistic data path:', lingDataPath);
    
    // Check if file exists
    if (!fs.existsSync(lingDataPath)) {
      console.error('Linguistic data file not found at:', lingDataPath);
      return res.status(404).json({ 
        error: 'Linguistic data file not found',
        path: lingDataPath 
      });
    }
    
    console.log('Reading linguistic data file...');
    
    // Read the JSON file
    const fileData = fs.readFileSync(lingDataPath, 'utf8');
    const jsonData = JSON.parse(fileData);
    
    // Check the parsed data
    console.log('Linguistic data parsed. Items count:', jsonData.length);
    if (jsonData.length > 0) {
      // Log the first item
      console.log('First item:', jsonData[0]);
      // Check how many distinct dialect categories exist
      const dialectAreas = new Set(jsonData.map((item: any) => item['方言片']));
      console.log('Distinct 方言片 categories:', Array.from(dialectAreas));
    }
    
    // Return the data
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading linguistic data file:', error);
    res.status(500).json({ error: 'Failed to load linguistic data', details: String(error) });
  }
} 