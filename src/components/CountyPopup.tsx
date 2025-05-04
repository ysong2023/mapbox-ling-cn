import { Popup } from 'react-map-gl';

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

interface CountyPopupProps {
  countyInfo: {
    县级码: string;
    区县名称: string;
    城市名称: string;
    省份名称: string;
    方言区: string;
    方言片: string;
    方言小片: string;
  };
  longitude: number;
  latitude: number;
  onClose: () => void;
}

const CountyPopup: React.FC<CountyPopupProps> = ({ countyInfo, longitude, latitude, onClose }) => {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      closeOnClick={false}
      onClose={onClose}
      className="county-popup"
      maxWidth="300px"
    >
      <div className="p-2">
        <h3 className="text-lg font-bold mb-2">{countyInfo.区县名称}</h3>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-1">
            <span className="font-semibold">Region:</span>
            <span className="col-span-2">{countyInfo.省份名称} {countyInfo.城市名称}</span>
            
            <span className="font-semibold">County Code:</span>
            <span className="col-span-2">{countyInfo.县级码}</span>
            
            <span className="font-semibold">Dialect Area:</span>
            <span className="col-span-2">
              {categoryTranslations['方言区'][countyInfo.方言区] || countyInfo.方言区}
            </span>
            
            <span className="font-semibold">Dialect Group:</span>
            <span className="col-span-2">
              {categoryTranslations['方言片'][countyInfo.方言片] || countyInfo.方言片}
            </span>
            
            <span className="font-semibold">Dialect Subgroup:</span>
            <span className="col-span-2">
              {categoryTranslations['方言小片'][countyInfo.方言小片] || countyInfo.方言小片}
            </span>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default CountyPopup; 