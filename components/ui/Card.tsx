
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white dark:bg-dark-card rounded-[10px] border border-slate-200 dark:border-white/[0.06] shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
