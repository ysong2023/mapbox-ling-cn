import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { getDataFilePaths } from './config';
import { getDialectCategories, LingData } from '../../utils/dialectData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get path to the linguistic data file
    const { lingDataPath } = getDataFilePaths();
    
    // Check if file exists
    if (!fs.existsSync(lingDataPath)) {
      return res.status(404).json({ error: 'Linguistic data file not found' });
    }
    
    // Read the JSON file
    const fileData = fs.readFileSync(lingDataPath, 'utf8');
    const lingData = JSON.parse(fileData) as LingData[];
    
    // Get dialect categories and statistics
    const dialectStats = getDialectCategories(lingData);
    
    // Return the statistics
    res.status(200).json(dialectStats);
  } catch (error) {
    console.error('Error generating dialect statistics:', error);
    res.status(500).json({ error: 'Failed to generate dialect statistics' });
  }
} 