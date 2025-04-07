import React from 'react';

interface AlignWrapperProps {
  children: React.ReactNode;
}

const AlignWrapper: React.FC<AlignWrapperProps> = ({ children }) => {
  return <div className="pt-[200px] w-[95%] mx-auto">{children}</div>;
};

export default AlignWrapper;
