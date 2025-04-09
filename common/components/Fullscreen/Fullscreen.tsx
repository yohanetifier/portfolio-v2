'use client';
import { useFullscreenContext } from '@/contexts/FullscreenContext';
import React from 'react';

const Fullscreen = () => {
  const { isFullscreenVisible } = useFullscreenContext();
  return (
    <>
      <div
        className="fixed top-0 w-screen h-screen z-[2] border-2 border-red-500"
        id="fullscreen"
      ></div>
    </>
  );
};

export default Fullscreen;
