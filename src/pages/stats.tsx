import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface DialectStats {
  方言区: string[];
  方言片: string[];
  方言小片: string[];
  方言区Counts: Record<string, number>;
  方言片Counts: Record<string, number>;
  方言小片Counts: Record<string, number>;
  dialectHierarchy: Record<string, Record<string, string[]>>;
}

// Category translation mapping
const categoryTranslations: Record<string, Record<string, string>> = {
  '方言区': {
    '西南官话': 'Southwest Mandarin'
  },
  '方言片': {
    '川黔片': 'Chuan-Qian Group',
    '西黔片': 'West Guizhou Group',
    '云南片': 'Yunnan Group',
    '湘广片': 'Hunan-Guangxi Group',
    '桂柳片': 'Guiliu Group'
  },
  '方言小片': {
    '黔中小片': 'Central Guizhou Subgroup',
    '成渝小片': 'Chengdu-Chongqing Subgroup',
    '银东小片': 'Yinchuan-East Subgroup',
    '滇中小片': 'Central Yunnan Subgroup',
    '黔南小片': 'Southern Guizhou Subgroup',
    '休宝小片': 'Xiubao Subgroup',
    '黔东小片': 'Eastern Guizhou Subgroup'
  }
};

// Section title translations
const sectionTitles = {
  '方言区': 'Dialect Area',
  '方言片': 'Dialect Group',
  '方言小片': 'Dialect Subgroup'
};

export default function StatsPage() {
  const [stats, setStats] = useState<DialectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dialectstats')
      .then(response => response.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching dialect statistics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading dialect statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load dialect statistics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Chinese Dialect Statistics - Guizhou Province</title>
        <meta name="description" content="Statistics of Chinese dialects in Guizhou Province" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chinese Dialect Statistics - Guizhou Province</h1>
          <Link href="/" className="bg-white text-indigo-700 px-4 py-2 rounded shadow">
            View Map
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dialect Area Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{sectionTitles['方言区']} Distribution</h2>
            <div className="flex flex-col space-y-4">
              {stats.方言区.map(region => {
                const translatedName = categoryTranslations['方言区'][region] || region;
                const percentage = Math.round((stats.方言区Counts[region] / Object.values(stats.方言区Counts).reduce((a, b) => a + b, 0)) * 100);
                return (
                  <div key={region} className="flex items-end space-x-2">
                    <div className="w-32 truncate" title={translatedName}>
                      {translatedName}
                    </div>
                    <div className="flex-grow flex flex-col space-y-1">
                      <div className="bg-gray-200 w-full relative" style={{ height: '130px' }}>
                        <div 
                          className="bg-indigo-600 absolute bottom-0 w-full" 
                          style={{ height: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center">
                        {stats.方言区Counts[region]} counties ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dialect Group Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{sectionTitles['方言片']} Distribution</h2>
            <div className="flex flex-col space-y-4">
              {stats.方言片.map(group => {
                const translatedName = categoryTranslations['方言片'][group] || group;
                const percentage = Math.round((stats.方言片Counts[group] / Object.values(stats.方言片Counts).reduce((a, b) => a + b, 0)) * 100);
                return (
                  <div key={group} className="flex items-end space-x-2">
                    <div className="w-32 truncate" title={translatedName}>
                      {translatedName}
                    </div>
                    <div className="flex-grow flex flex-col space-y-1">
                      <div className="bg-gray-200 w-full relative" style={{ height: '130px' }}>
                        <div 
                          className="bg-purple-600 absolute bottom-0 w-full" 
                          style={{ height: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center">
                        {stats.方言片Counts[group]} counties ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dialect Subgroup Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{sectionTitles['方言小片']} Distribution</h2>
            <div className="flex flex-col space-y-4 max-h-96 overflow-y-auto">
              {stats.方言小片.map(subgroup => {
                const translatedName = categoryTranslations['方言小片'][subgroup] || subgroup;
                const percentage = Math.round((stats.方言小片Counts[subgroup] / Object.values(stats.方言小片Counts).reduce((a, b) => a + b, 0)) * 100);
                return (
                  <div key={subgroup} className="flex items-end space-x-2">
                    <div className="w-32 truncate" title={translatedName}>
                      {translatedName}
                    </div>
                    <div className="flex-grow flex flex-col space-y-1">
                      <div className="bg-gray-200 w-full relative" style={{ height: '130px' }}>
                        <div 
                          className="bg-teal-600 absolute bottom-0 w-full" 
                          style={{ height: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center">
                        {stats.方言小片Counts[subgroup]} counties ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dialect Hierarchy */}
        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Dialect Hierarchy</h2>
          
          <div className="space-y-8">
            {Object.entries(stats.dialectHierarchy).map(([region, groups]) => (
              <div key={region} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-indigo-700 mb-4">
                  {categoryTranslations['方言区'][region] || region}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(groups).map(([group, subgroups]) => (
                    <div key={group} className="border rounded p-3">
                      <h4 className="font-medium text-purple-700 mb-2">
                        {categoryTranslations['方言片'][group] || group}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {subgroups.map(subgroup => (
                          <li key={subgroup} className="text-sm text-gray-700">
                            {categoryTranslations['方言小片'][subgroup] || subgroup}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 