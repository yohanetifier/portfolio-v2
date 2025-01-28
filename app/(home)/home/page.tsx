'use client';
import React, { useEffect, useRef } from 'react';

const Home = () => {
  const wrapperImage = useRef<HTMLDivElement | null>(null);
  useEffect(() => {}, []);
  return (
    <div
      className="grid grid-rows-5 grid-cols-5 gap-[20px] relative"
      ref={wrapperImage}
    >
      {/* FIRST ROW */}
      <div className=" col-start-1 col-end-2 row-start-1 row-end-1 border-2 border-red-500 w-full h-[200px] "></div>
      <div className=" col-start-3 col-end-4 row-start-1 row-end-1 border-2 border-red-500 w-full h-[200px]"></div>
      <div className=" col-start-5 col-end-6 row-start-1 row-end-1 border-2 border-red-500 w-full "></div>
      {/* SECOND ROW */}
      <div className="col-start-2 col-end-3  row-start-2 row-end-2 border-2 border-cyan-500 w-full h-[200px] opacity-0"></div>
      <div className="col-start-4 col-end-5  row-start-2 row-end-2 border-2 border-cyan-500 w-full opacity-0 "></div>
      {/* THIRD ROW */}
      <div className="col-start-1 col-end-2 row-start-3 row-end-3 border-2 border-green-500 w-full h-[200px] opacity-0 "></div>
      <div className="col-start-3 col-end-4 row-start-3 row-end-3 border-2 border-green-500 w-full opacity-0"></div>
      <div className="col-start-5 col-end-6 row-start-3 row-end-3  border-2 border-green-500 w-full opacity-0"></div>
      {/* FOURTH ROW */}
      <div className="col-start-2 col-end-3  row-start-4 row-end-4 border-2 border-orange-500 w-full h-[200px] opacity-0"></div>
      <div className="col-start-4 col-end-5  row-start-4 row-end-4 border-2 border-orange-500 w-full opacity-0"></div>
      {/* FIFTH ROW */}
      <div className="col-start-1 col-end-2 row-start-5 row-end-5 border-2 border-red-500 w-full h-[200px] opacity-0 "></div>
      <div className="col-start-3 col-end-4 row-start-5 row-end-5 border-2 border-red-500 w-full opacity-0"></div>
      <div className="col-start-5 col-end-6 row-start-5 row-end-5  border-2 border-red-500 w-full opacity-0"></div>
    </div>
  );
};

export default Home;
