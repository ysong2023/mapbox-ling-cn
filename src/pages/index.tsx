import { useEffect, useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Map, { Source, Layer, MapLayerMouseEvent, FillLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import CountyPopup from '../components/CountyPopup';
import HoverTooltip from '../components/HoverTooltip';

// Types for our data
interface LingData {
  县级码: string;
  区县名称: string;
  城市代码: string;
  城市名称: string;
  省份代码: string;
  省份名称: string;
  方言区: string;
  方言片: string;
  方言小片: string;
}

interface ColorMapping {
  [key: string]: string;
}

interface PopupInfo {
  longitude: number;
  latitude: number;
  countyInfo: LingData;
}

interface HoverInfo {
  x: number;
  y: number;
  countyInfo: LingData;
}

// Category translation mapping
const categoryTranslations: Record<string, Record<string, string>> = {
  '方言区': {
    '西南官话': 'Southwest Mandarin',
    // Add any additional dialect areas here
  },
  '方言片': {
    '川黔片': 'Chuan-Qian Group',
    '西黔片': 'West Guizhou Group',
    '云南片': 'Yunnan Group',
    '湘广片': 'Hunan-Guangxi Group',
    '桂柳片': 'Guiliu Group',
    '西蜀片': 'Western Sichuan Group',
    '湖广片': 'Huguang Group'
    // Add any additional dialect groups here
  },
  '方言小片': {
    '黔中小片': 'Central Guizhou Subgroup',
    '成渝小片': 'Chengdu-Chongqing Subgroup',
    '银东小片': 'Yinchuan-East Subgroup',
    '滇中小片': 'Central Yunnan Subgroup',
    '黔南小片': 'Southern Guizhou Subgroup',
    '休宝小片': 'Xiubao Subgroup',
    '黔东小片': 'Eastern Guizhou Subgroup',
    '岷赤小片': 'Min-Chi Subgroup',
    '怀玉小片': 'Huaiyu Subgroup',
    '黎靖小片': 'Lijing Subgroup'
    // Add any additional dialect subgroups here
  }
};

// English names for categories
const categoryNames = {
  '方言区': 'Dialect Area',
  '方言片': 'Dialect Group',
  '方言小片': 'Dialect Subgroup'
};


export default function Home() {
  // State to store our data
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [lingData, setLingData] = useState<LingData[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [legendOpen, setLegendOpen] = useState(true);
  const [colorBy, setColorBy] = useState<'方言区' | '方言片' | '方言小片'>('方言片');
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 106.7,
    latitude: 26.6,
    zoom: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    // Load environment variables
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    console.log('MapBox Token available:', !!token);
    setMapboxToken(token || '');

    // Load GeoJSON data
    console.log('Fetching GeoJSON data...');
    setIsLoading(true);
    fetch('/api/geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('GeoJSON data received:', data.type, 'with', data.features?.length, 'features');
        if (data.features?.length > 0) {
          console.log('Sample properties:', data.features[0].properties);
        }
        setGeoJsonData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading GeoJSON:', error);
        setErrorMsg(`Failed to load geographic data: ${error.message}`);
        setIsLoading(false);
      });

    // Load linguistic data
    console.log('Fetching linguistic data...');
    fetch('/api/lingdata')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Linguistic data received:', data.length, 'items');
        if (data.length > 0) {
          console.log('Sample item:', data[0]);
          // Count dialect categories
          const dialectAreas = new Set(data.map((item: LingData) => item['方言区']));
          const dialectGroups = new Set(data.map((item: LingData) => item['方言片']));
          const dialectSubgroups = new Set(data.map((item: LingData) => item['方言小片']));
          console.log('Dialect areas count:', dialectAreas.size);
          console.log('Dialect groups count:', dialectGroups.size);
          console.log('Dialect subgroups count:', dialectSubgroups.size);
        }
        setLingData(data);
      })
      .catch((error) => {
        console.error('Error loading linguistic data:', error);
        setErrorMsg(`Failed to load linguistic data: ${error.message}`);
      });
  }, []);

  // Generate colors for each unique dialect category
  const { colorMap, uniqueCategories } = useMemo(() => {
    console.log('Generating color map for', colorBy, 'with', lingData.length, 'items');
    const categories = lingData.map((item) => item[colorBy]);
    const uniqueCategories = [...new Set(categories)];
    console.log('Unique categories found:', uniqueCategories);

    // Predefined colors for different categories
    const colors = [
      '#1E88E5', '#D81B60', '#FFC107', '#004D40', '#5E35B1', 
      '#FF5722', '#00ACC1', '#43A047', '#6D4C41', '#3949AB',
      '#F44336', '#9C27B0', '#2196F3', '#009688', '#FF9800',
      '#CDDC39', '#607D8B'
    ];

    const colorMap: ColorMapping = {};
    uniqueCategories.forEach((category, index) => {
      colorMap[category] = colors[index % colors.length];
    });
    console.log('Color mapping created:', colorMap);

    return { colorMap, uniqueCategories };
  }, [lingData, colorBy]);

  // Create a data layer with colors based on dialect categories
  const { dataLayer, coloredData } = useMemo(() => {
    if (!geoJsonData || lingData.length === 0) {
      console.log('Cannot create data layer - missing data');
      return {
        dataLayer: null as unknown as FillLayer,
        coloredData: null
      };
    }

    console.log('Creating data layer...');
    
    // Clone the GeoJSON and add color properties based on linguistic data
    const coloredGeoJson = JSON.parse(JSON.stringify(geoJsonData));
    
    // Add color information to each feature based on linguistic data
    let matchCount = 0;
    let noMatchCount = 0;
    console.log('Total features to process:', coloredGeoJson.features.length);
    console.log('Color mapping:', colorMap);
    console.log('Coloring by:', colorBy);
    
    coloredGeoJson.features.forEach((feature: any) => {
      const countyCode = feature.properties.县级码;
      
      // Debug the format of county codes
      if (!countyCode) {
        console.log('Feature is missing 县级码:', feature.properties);
      }
      
      // Find matching linguistic data
      const lingEntry = lingData.find(item => item.县级码 === countyCode);
      
      if (lingEntry) {
        matchCount++;
        const category = lingEntry[colorBy];
        feature.properties.color = colorMap[category] || '#CCCCCC';
        feature.properties.category = category;
        // Add dialect info to feature properties for hover access
        feature.properties.方言区 = lingEntry['方言区'];
        feature.properties.方言片 = lingEntry['方言片'];
        feature.properties.方言小片 = lingEntry['方言小片'];
      } else {
        // Try searching without .0 suffix
        const strippedCode = countyCode ? String(countyCode).replace('.0', '') : '';
        const altLingEntry = lingData.find(item => {
          const itemCode = String(item.县级码);
          return itemCode === strippedCode || 
                 itemCode === strippedCode + '.0' ||
                 itemCode.replace('.0', '') === strippedCode;
        });
        if (altLingEntry) {
          matchCount++;
          const category = altLingEntry[colorBy];
          feature.properties.color = colorMap[category] || '#CCCCCC';
          feature.properties.category = category;
          // Add dialect info to feature properties for hover access
          feature.properties.方言区 = altLingEntry['方言区'];
          feature.properties.方言片 = altLingEntry['方言片'];
          feature.properties.方言小片 = altLingEntry['方言小片'];
          
          // Log successful match after stripping
          console.log('Matched after format adjustment:', { 
            original: countyCode, 
            stripped: strippedCode, 
            matched: altLingEntry.县级码,
            category: category,
            color: colorMap[category]
          });
        } else {
          noMatchCount++;
          console.log('No matching linguistic data for county code:', countyCode);
          feature.properties.color = '#CCCCCC'; // Default color for missing data
        }
      }
    });
    
    console.log(`Matched ${matchCount} out of ${coloredGeoJson.features.length} features`);
    console.log(`Failed to match ${noMatchCount} features`);
    
    // Log a few colored features to check if color property is being set
    console.log('Sample of colored features:');
    coloredGeoJson.features.slice(0, 5).forEach((feature: any) => {
      console.log({
        county: feature.properties.区县名称 || feature.properties.NAME,
        code: feature.properties.县级码,
        category: feature.properties.category,
        color: feature.properties.color
      });
    });

    // Create the layer definition
    const layer: FillLayer = {
      id: 'dialect-areas',
      type: 'fill',
      source: 'counties',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.7,
        'fill-outline-color': '#000'
      }
    };
    
    console.log('Layer definition:', layer);
    
    return {
      dataLayer: layer,
      coloredData: coloredGeoJson
    };
  }, [geoJsonData, lingData, colorMap, colorBy]);

  // Add debugging effect here, after dataLayer is defined
  useEffect(() => {
    if (coloredData) {
      console.log('Map rendering data check:');
      console.log('- Colored GeoJSON features count:', coloredData.features.length);
      if (coloredData.features.length > 0) {
        console.log('- Sample colored feature properties:', coloredData.features[0].properties);
        console.log('- Has color property:', 'color' in coloredData.features[0].properties);
      }
    }
  }, [coloredData]);

  // Handle click on map feature
  const onClick = (event: MapLayerMouseEvent) => {
    if (!event.features || event.features.length === 0) return;
    
    const feature = event.features[0];
    const countyCode = feature.properties?.县级码;
    const category = feature.properties?.category;
    
    console.log('Clicked on feature:', {
      countyCode,
      category,
      properties: feature.properties
    });
    
    if (countyCode) {
      const countyInfo = lingData.find(item => item.县级码 === countyCode);
      if (countyInfo) {
        setPopupInfo({
          longitude: event.lngLat.lng,
          latitude: event.lngLat.lat,
          countyInfo
        });
      }
    }
  };

  // Handle mouse move over map features
  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    if (!event.features || event.features.length === 0) {
      setHoverInfo(null);
      return;
    }
    
    const feature = event.features[0];
    const countyCode = feature.properties?.县级码;
    
    if (countyCode) {
      // Try to find the county in our linguistic data
      let countyInfo = lingData.find(item => item.县级码 === countyCode);
      
      // If not found with direct match, try stripping .0
      if (!countyInfo) {
        const strippedCode = String(countyCode).replace('.0', '');
        countyInfo = lingData.find(item => {
          const itemCode = String(item.县级码);
          return itemCode === strippedCode || 
                 itemCode === strippedCode + '.0' ||
                 itemCode.replace('.0', '') === strippedCode;
        });
      }
      
      if (countyInfo) {
        setHoverInfo({
          x: event.point.x,
          y: event.point.y,
          countyInfo
        });
      } else {
        setHoverInfo(null);
      }
    } else {
      setHoverInfo(null);
    }
  }, [lingData]);
  
  // Handle mouse leave from map
  const onMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  // Handle dialect selection clicks
  const handleDialectAreaClick = useCallback(() => {
    if (!hoverInfo) return;
    const dialectArea = hoverInfo.countyInfo['方言区'];
    setColorBy('方言区');
    // You could also implement a filter here to show only counties with this dialect area
    console.log(`Filtered to dialect area: ${dialectArea}`);
  }, [hoverInfo]);

  const handleDialectGroupClick = useCallback(() => {
    if (!hoverInfo) return;
    const dialectGroup = hoverInfo.countyInfo['方言片'];
    setColorBy('方言片');
    // You could also implement a filter here to show only counties with this dialect group
    console.log(`Filtered to dialect group: ${dialectGroup}`);
  }, [hoverInfo]);

  const handleDialectSubgroupClick = useCallback(() => {
    if (!hoverInfo) return;
    const dialectSubgroup = hoverInfo.countyInfo['方言小片'];
    setColorBy('方言小片');
    // You could also implement a filter here to show only counties with this dialect subgroup
    console.log(`Filtered to dialect subgroup: ${dialectSubgroup}`);
  }, [hoverInfo]);

  if (!mapboxToken) {
    return <div className="text-center p-10 text-red-600">Error: Mapbox token not found. Make sure you have set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file.</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Chinese Dialect Map - Guizhou Province</title>
        <meta name="description" content="Interactive map of Chinese dialects in Guizhou Province" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chinese Dialect Map - Guizhou Province</h1>
          <Link href="/stats" className="bg-white text-indigo-700 px-4 py-2 rounded shadow">
            View Statistics
          </Link>
        </div>
      </header>

      <main className="flex-grow relative">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-xl">Loading map data...</div>
          </div>
        ) : errorMsg ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-xl text-red-600">{errorMsg}</div>
          </div>
        ) : !geoJsonData || lingData.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-xl text-yellow-600">Data loaded but appears to be empty or invalid.</div>
          </div>
        ) : (
          <>
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={mapboxToken}
              interactiveLayerIds={['dialect-areas']}
              onClick={onClick}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
            >
              {coloredData && dataLayer && (
                <>
                  {/* Log data before rendering */}
                  <Source id="counties" type="geojson" data={coloredData}>
                    <Layer {...dataLayer} />
                  </Source>
                </>
              )}

              {popupInfo && (
                <CountyPopup
                  countyInfo={popupInfo.countyInfo}
                  longitude={popupInfo.longitude}
                  latitude={popupInfo.latitude}
                  onClose={() => setPopupInfo(null)}
                />
              )}
            </Map>

            {/* Hover tooltip */}
            {hoverInfo && (
              <div className="absolute pointer-events-none" style={{ left: 0, top: 0, zIndex: 9 }}>
                <HoverTooltip
                  x={hoverInfo.x}
                  y={hoverInfo.y}
                  dialectArea={hoverInfo.countyInfo['方言区']}
                  dialectGroup={hoverInfo.countyInfo['方言片']}
                  dialectSubgroup={hoverInfo.countyInfo['方言小片']}
                  dialectAreaEn={categoryTranslations['方言区'][hoverInfo.countyInfo['方言区']] || hoverInfo.countyInfo['方言区']}
                  dialectGroupEn={categoryTranslations['方言片'][hoverInfo.countyInfo['方言片']] || hoverInfo.countyInfo['方言片']}
                  dialectSubgroupEn={categoryTranslations['方言小片'][hoverInfo.countyInfo['方言小片']] || hoverInfo.countyInfo['方言小片']}
                  onDialectAreaClick={handleDialectAreaClick}
                  onDialectGroupClick={handleDialectGroupClick}
                  onDialectSubgroupClick={handleDialectSubgroupClick}
                />
              </div>
            )}

            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white p-4 rounded shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Color by:</h3>
                </div>
                <div className="space-x-2 mb-4">
                  <button
                    className={`px-3 py-1 rounded ${colorBy === '方言区' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setColorBy('方言区')}
                    title="方言区"
                  >
                    {categoryNames['方言区']}
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${colorBy === '方言片' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setColorBy('方言片')}
                    title="方言片"
                  >
                    {categoryNames['方言片']}
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${colorBy === '方言小片' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setColorBy('方言小片')}
                    title="方言小片"
                  >
                    {categoryNames['方言小片']}
                  </button>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Legend:</h3>
                  <button
                    onClick={() => setLegendOpen(!legendOpen)}
                    className="text-sm text-indigo-600"
                  >
                    {legendOpen ? 'Hide' : 'Show'}
                  </button>
                </div>

                {legendOpen && (
                  <div className="max-h-80 overflow-y-auto">
                    {uniqueCategories.map(category => (
                      <div key={category} className="flex items-center mt-1">
                        <div 
                          className="w-5 h-5 mr-2" 
                          style={{ backgroundColor: colorMap[category] }}
                        ></div>
                        <span 
                          className="text-sm" 
                          title={category}
                        >
                          {categoryTranslations[colorBy][category] || category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}