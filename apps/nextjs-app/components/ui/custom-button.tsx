import { MouseEventHandler } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@coin98t/wallet-adapter-react-ui';

interface CustomButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  icon?: React.ReactElement;
  title?: string;
  className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ onClick, icon, title, className }) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'p-3.5 bg-[#E5B842] flex gap-3 rounded-lg font-normal text-center text-[#fff] cursor-pointer hover:bg-[#DEA62E] hover:text-[#000] duration-300 disabled:cursor-not-allowed items-center justify-center',
        className,
      )}
    >
      {title}
      {icon && <div>{icon}</div>}
    </Button>
  );
};

export default CustomButton;
