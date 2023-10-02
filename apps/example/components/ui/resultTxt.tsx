import { cn } from "@/lib/utils";
import React from "react";

const ResultTxt = ({ txt, textClass }: any) => {
  return (
    <div className="mt-6 border-[2px] border-black p-4 rounded-md bg-[#fff]">
      <h2 className="font-bold text-[16px] text-textSecondary">Result:</h2>
      <p className={cn("break-all text-[#277BC0]", textClass)}>{txt}</p>
    </div>
  );
};

export default ResultTxt;
