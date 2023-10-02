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
    <Button onClick={onClick} className={cn('py-2 bg-[#fdd05a] border-textPrimary flex items-center', className)}>
      {title}
      {icon && <div>{icon}</div>}
    </Button>
  );
};

export default CustomButton;
