import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { getDataFilePaths } from './config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get paths to data files
    const { geoJsonPath, lingDataPath } = getDataFilePaths();
    
    // Check if files exist
    if (!fs.existsSync(geoJsonPath)) {
      return res.status(404).json({ error: 'GeoJSON file not found', path: geoJsonPath });
    }
    
    if (!fs.existsSync(lingDataPath)) {
      return res.status(404).json({ error: 'Linguistic data file not found', path: lingDataPath });
    }
    
    // Read the files
    const geoJsonData = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));
    const lingData = JSON.parse(fs.readFileSync(lingDataPath, 'utf8'));
    
    // Check counts
    const geoJsonFeatureCount = geoJsonData.features?.length || 0;
    const lingDataCount = lingData.length;
    
    // Extract county codes from both datasets
    const geoJsonCountyCodes = geoJsonData.features
      .filter((feature: any) => feature.properties && feature.properties.县级码)
      .map((feature: any) => feature.properties.县级码);
    
    const lingDataCountyCodes = lingData.map((item: any) => item.县级码);
    
    // Find matches and mismatches
    const exactMatches = geoJsonCountyCodes.filter((code: string) => 
      lingDataCountyCodes.includes(code)
    );
    
    // Check for matches without .0 suffix
    const strippedMatches = geoJsonCountyCodes.filter((code: string) => {
      const strippedCode = code.replace('.0', '');
      return lingDataCountyCodes.includes(strippedCode) || 
        lingDataCountyCodes.includes(strippedCode + '.0') ||
        lingDataCountyCodes.some((lingCode: string) => lingCode.replace('.0', '') === strippedCode);
    });
    
    // Find unique county codes in each dataset
    const uniqueGeoJsonCodes = geoJsonCountyCodes.filter((code: string) => 
      !lingDataCountyCodes.includes(code)
    );
    
    const uniqueLingDataCodes = lingDataCountyCodes.filter((code: string) => 
      !geoJsonCountyCodes.includes(code)
    );
    
    // Create a sample of mismatched county codes for debugging
    const mismatchedSample = uniqueGeoJsonCodes.slice(0, 10).map((code: string) => {
      const feature = geoJsonData.features.find((f: any) => f.properties.县级码 === code);
      return {
        code,
        properties: feature?.properties
      };
    });
    
    // Count dialect categories
    const dialectAreas = new Set(lingData.map((item: any) => item.方言区));
    const dialectGroups = new Set(lingData.map((item: any) => item.方言片));
    const dialectSubgroups = new Set(lingData.map((item: any) => item.方言小片));
    
    // Return the analysis results
    res.status(200).json({
      geoJsonFeatureCount,
      lingDataCount,
      exactMatchCount: exactMatches.length,
      strippedMatchCount: strippedMatches.length,
      uniqueGeoJsonCodesCount: uniqueGeoJsonCodes.length,
      uniqueLingDataCodesCount: uniqueLingDataCodes.length,
      dialectCategoryCounts: {
        方言区: dialectAreas.size,
        方言片: dialectGroups.size,
        方言小片: dialectSubgroups.size
      },
      mismatchedSample,
      // Sample of the first few entries from each dataset
      geoJsonSample: geoJsonData.features.slice(0, 3).map((f: any) => f.properties),
      lingDataSample: lingData.slice(0, 3)
    });
  } catch (error) {
    console.error('Error analyzing data consistency:', error);
    res.status(500).json({ error: 'Failed to analyze data consistency', details: String(error) });
  }
} 