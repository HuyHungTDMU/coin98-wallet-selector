'use client';

interface ContainerProps {
  title?: string;
  children: React.ReactNode;
}

const CardMethod: React.FC<ContainerProps> = ({ title, children }) => {
  return (
    <div className="bg-[#1b1b1b] break-inside overflow-hidden flex flex-col p-5 relative rounded-lg text-white undefined w-full z-0">
      <img src="https://connect.coin98.com/assets/bg-connect.svg" alt="" className="absolute -top-[40px]" />
      <h3 className="uppercase text-xl text-[#d9b432] text-center">{title}</h3>
      {children}
    </div>
  );
};

export default CardMethod;
