import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function CheckEnv() {
  const [envStatus, setEnvStatus] = useState<{
    mapboxToken: boolean;
    dataConsistency: any | null;
    error: string | null;
  }>({
    mapboxToken: false,
    dataConsistency: null,
    error: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Mapbox token is set
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const tokenValid = Boolean(token && token.startsWith('pk.'));
    
    // Check data consistency
    fetch('/api/check-data-consistency')
      .then(res => res.json())
      .then(data => {
        setEnvStatus({
          mapboxToken: tokenValid,
          dataConsistency: data,
          error: null
        });
      })
      .catch(err => {
        setEnvStatus({
          mapboxToken: tokenValid,
          dataConsistency: null,
          error: err.message
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getSetupInstructions = () => {
    let instructions = [];
    
    if (!envStatus.mapboxToken) {
      instructions.push(
        <div key="mapbox" className="mb-4 p-4 bg-yellow-100 rounded border border-yellow-300">
          <h3 className="font-bold text-yellow-800">Mapbox Token Missing</h3>
          <p className="my-2">You need to create a <code>.env.local</code> file in the <code>src</code> directory with your Mapbox token:</p>
          <pre className="bg-gray-800 text-white p-3 rounded">
            NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
          </pre>
          <p className="mt-2">You can get a token by signing up at <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Mapbox.com</a></p>
        </div>
      );
    }
    
    if (envStatus.dataConsistency) {
      const { 
        exactMatchCount, 
        strippedMatchCount, 
        geoJsonFeatureCount,
        lingDataCount
      } = envStatus.dataConsistency;
      
      const matchPercentage = Math.round((strippedMatchCount / geoJsonFeatureCount) * 100);
      
      if (matchPercentage < 80) {
        instructions.push(
          <div key="dataMatch" className="mb-4 p-4 bg-red-100 rounded border border-red-300">
            <h3 className="font-bold text-red-800">Data Matching Issues</h3>
            <p className="my-2">Only {matchPercentage}% of counties in your GeoJSON data match with linguistic data.</p>
            <p>This suggests there might be format differences between county codes in the two datasets.</p>
          </div>
        );
      }
    }
    
    if (instructions.length === 0) {
      return (
        <div className="p-4 bg-green-100 rounded border border-green-300">
          <h3 className="font-bold text-green-800">All Set!</h3>
          <p>Your environment appears to be correctly configured.</p>
        </div>
      );
    }
    
    return instructions;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Environment Check - Chinese Dialect Map</title>
      </Head>

      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Environment Check</h1>
          <Link href="/" className="bg-white text-indigo-700 px-4 py-2 rounded shadow">
            Back to Map
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
          
          {loading ? (
            <div className="text-center py-4">
              <p>Checking environment...</p>
            </div>
          ) : envStatus.error ? (
            <div className="p-4 bg-red-100 rounded">
              <p className="text-red-700">Error checking environment: {envStatus.error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border rounded p-4">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${envStatus.mapboxToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h3 className="font-medium">Mapbox Token</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {envStatus.mapboxToken 
                      ? 'Valid token found' 
                      : 'No valid token found in .env.local'}
                  </p>
                </div>
                
                {envStatus.dataConsistency && (
                  <div className="border rounded p-4">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        envStatus.dataConsistency.exactMatchCount > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <h3 className="font-medium">Data Files</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      GeoJSON: {envStatus.dataConsistency.geoJsonFeatureCount} features
                    </p>
                    <p className="text-sm text-gray-600">
                      Linguistic data: {envStatus.dataConsistency.lingDataCount} items
                    </p>
                  </div>
                )}
              </div>
              
              {envStatus.dataConsistency && (
                <div className="border rounded p-4 mb-6">
                  <h3 className="font-medium mb-2">Data Consistency</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm"><span className="font-medium">Exact matches:</span> {envStatus.dataConsistency.exactMatchCount}</p>
                      <p className="text-sm"><span className="font-medium">Matches with format adjustment:</span> {envStatus.dataConsistency.strippedMatchCount}</p>
                      <p className="text-sm"><span className="font-medium">Unmatched GeoJSON counties:</span> {envStatus.dataConsistency.uniqueGeoJsonCodesCount}</p>
                      <p className="text-sm"><span className="font-medium">Unmatched linguistic data:</span> {envStatus.dataConsistency.uniqueLingDataCodesCount}</p>
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-medium">方言区 categories:</span> {envStatus.dataConsistency.dialectCategoryCounts.方言区}</p>
                      <p className="text-sm"><span className="font-medium">方言片 categories:</span> {envStatus.dataConsistency.dialectCategoryCounts.方言片}</p>
                      <p className="text-sm"><span className="font-medium">方言小片 categories:</span> {envStatus.dataConsistency.dialectCategoryCounts.方言小片}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <h3 className="font-medium mb-2">Setup Instructions</h3>
              {getSetupInstructions()}
            </>
          )}
        </div>
        
        {envStatus.dataConsistency && envStatus.dataConsistency.mismatchedSample && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Data Sample Analysis</h2>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">GeoJSON Sample</h3>
              <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(envStatus.dataConsistency.geoJsonSample, null, 2)}
              </pre>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Linguistic Data Sample</h3>
              <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(envStatus.dataConsistency.lingDataSample, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Mismatched County Codes Sample</h3>
              <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(envStatus.dataConsistency.mismatchedSample, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 