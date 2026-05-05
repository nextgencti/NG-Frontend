import React from 'react';

const Skeleton = ({ className, variant = 'rectangle' }) => {
  const baseStyles = 'animate-shimmer bg-slate-200 rounded-md';
  
  const variants = {
    circle: 'rounded-full',
    rectangle: 'rounded-md',
    text: 'rounded h-4 w-full mb-2',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} />
  );
};

export default Skeleton;
