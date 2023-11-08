import { cn } from '@/lib/utils';
import React from 'react';

const ResultTxt = ({ txt, textClass }: any) => {
  return (
    <div className="w-full p-3 rounded-lg bg-[#e5b7431a] mt-6 text-sm text-[#E5B842] break-words false">
      <h2 className="text-[13px] text-[#c4c4c4] mb-1">Result:</h2>
      <p className={cn('break-all', textClass)}>{txt}</p>
    </div>
  );
};

export default ResultTxt;
