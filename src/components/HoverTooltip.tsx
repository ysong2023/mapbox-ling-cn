import { FC } from 'react';
import Link from 'next/link';

interface HoverTooltipProps {
  x: number;
  y: number;
  dialectArea: string;
  dialectGroup: string;
  dialectSubgroup: string;
  dialectAreaEn: string;
  dialectGroupEn: string;
  dialectSubgroupEn: string;
  onDialectAreaClick: () => void;
  onDialectGroupClick: () => void;
  onDialectSubgroupClick: () => void;
}

const HoverTooltip: FC<HoverTooltipProps> = ({
  x,
  y,
  dialectArea,
  dialectGroup,
  dialectSubgroup,
  dialectAreaEn,
  dialectGroupEn,
  dialectSubgroupEn,
  onDialectAreaClick,
  onDialectGroupClick,
  onDialectSubgroupClick
}) => {
  return (
    <div
      className="absolute bg-white p-3 rounded shadow-lg z-20 text-sm"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'auto',
        minWidth: '220px'
      }}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span 
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer underline"
            onClick={onDialectAreaClick}
            title={dialectArea}
          >
            {dialectAreaEn || dialectArea}
          </span>
        </div>
        
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span 
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer underline"
            onClick={onDialectGroupClick}
            title={dialectGroup}
          >
            {dialectGroupEn || dialectGroup}
          </span>
        </div>
        
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span 
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer underline"
            onClick={onDialectSubgroupClick}
            title={dialectSubgroup}
          >
            {dialectSubgroupEn || dialectSubgroup}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HoverTooltip;