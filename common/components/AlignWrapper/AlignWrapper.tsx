import React from 'react';

interface AlignWrapperProps {
  children: React.ReactNode;
}

const AlignWrapper: React.FC<AlignWrapperProps> = ({ children }) => {
  return (
    <div className="border-2 border-red-500 pt-[200px] w-[94%] mx-auto">
      {children}
    </div>
  );
};

export default AlignWrapper;
