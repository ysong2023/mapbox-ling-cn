// Types for our linguistic data
export interface LingData {
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

// Get unique dialect categories with counts
export function getDialectCategories(data: LingData[]) {
  const 方言区Set = new Set<string>();
  const 方言片Set = new Set<string>();
  const 方言小片Set = new Set<string>();
  
  // Count by 方言区
  const 方言区Counts: Record<string, number> = {};
  // Count by 方言片
  const 方言片Counts: Record<string, number> = {};
  // Count by 方言小片
  const 方言小片Counts: Record<string, number> = {};
  
  // Nested structure: 方言区 -> 方言片 -> 方言小片
  const dialectHierarchy: Record<string, Record<string, string[]>> = {};
  
  data.forEach(entry => {
    // Add to sets
    方言区Set.add(entry.方言区);
    方言片Set.add(entry.方言片);
    方言小片Set.add(entry.方言小片);
    
    // Count 方言区
    if (!方言区Counts[entry.方言区]) {
      方言区Counts[entry.方言区] = 0;
    }
    方言区Counts[entry.方言区]++;
    
    // Count 方言片
    if (!方言片Counts[entry.方言片]) {
      方言片Counts[entry.方言片] = 0;
    }
    方言片Counts[entry.方言片]++;
    
    // Count 方言小片
    if (!方言小片Counts[entry.方言小片]) {
      方言小片Counts[entry.方言小片] = 0;
    }
    方言小片Counts[entry.方言小片]++;
    
    // Build hierarchy
    if (!dialectHierarchy[entry.方言区]) {
      dialectHierarchy[entry.方言区] = {};
    }
    
    if (!dialectHierarchy[entry.方言区][entry.方言片]) {
      dialectHierarchy[entry.方言区][entry.方言片] = [];
    }
    
    if (!dialectHierarchy[entry.方言区][entry.方言片].includes(entry.方言小片)) {
      dialectHierarchy[entry.方言区][entry.方言片].push(entry.方言小片);
    }
  });
  
  return {
    方言区: Array.from(方言区Set),
    方言片: Array.from(方言片Set),
    方言小片: Array.from(方言小片Set),
    方言区Counts,
    方言片Counts,
    方言小片Counts,
    dialectHierarchy
  };
} 