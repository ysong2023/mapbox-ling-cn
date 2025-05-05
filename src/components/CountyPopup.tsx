import { FC } from 'react';
import { Popup } from 'react-map-gl';

interface CountyInfo {
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

interface CountyPopupProps {
  countyInfo: CountyInfo;
  longitude: number;
  latitude: number;
  onClose: () => void;
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

// Field name translations
const fieldTranslations: Record<string, string> = {
  '县级码': 'County Code',
  '区县名称': 'County Name',
  '城市代码': 'City Code',
  '城市名称': 'City Name',
  '省份代码': 'Province Code',
  '省份名称': 'Province Name',
  '方言区': 'Dialect Area',
  '方言片': 'Dialect Group',
  '方言小片': 'Dialect Subgroup'
};

const CountyPopup: FC<CountyPopupProps> = ({ countyInfo, longitude, latitude, onClose }) => {
  const getTranslatedValue = (key: string, value: string) => {
    if (key === '方言区' || key === '方言片' || key === '方言小片') {
      return categoryTranslations[key][value] || value;
    }
    return value;
  };

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      className="county-popup"
    >
      <div className="p-2">
        <h3 className="font-bold text-lg mb-2">{countyInfo.区县名称}</h3>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(countyInfo).map(([key, value]) => {
              // Skip certain fields for cleaner display
              if (['县级码', '城市代码', '省份代码'].includes(key)) return null;
              
              return (
                <tr key={key}>
                  <td className="font-semibold pr-2">{fieldTranslations[key] || key}:</td>
                  <td>{getTranslatedValue(key, value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Popup>
  );
};

export default CountyPopup;