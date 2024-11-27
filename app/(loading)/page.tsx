'use client';
import Image from 'next/image';
import React from 'react';

export default function Loading() {
  const wrapperImage = React.useRef<HTMLDivElement | null>(null);
  let clientX;
  let clientY;
  React.useEffect(() => {
    window.addEventListener('mousemove', (e) => {
      clientX = e.clientX;
      clientY = e.clientY;
      const arrayOfImages: HTMLElement[] = Array.from(
        wrapperImage.current!.children,
      ) as HTMLElement[];
      const normalizeSize = e.clientX / window.innerWidth - 0.5;
      arrayOfImages[2].style.left = `${normalizeSize * 50}px`;
      arrayOfImages[2].style.transform = `rotate(${normalizeSize * 5}deg)`;

      arrayOfImages[1].style.left = `${normalizeSize * 200}px`;
      arrayOfImages[1].style.transform = `rotate(${normalizeSize * 25}deg)`;

      arrayOfImages[0].style.left = `${normalizeSize * 300}px`;
      arrayOfImages[0].style.transform = `rotate(${normalizeSize * 50}deg)`;
      // arrayOfImages[2].style.top = `${normalizeSize * 10}px`;
    });
  }, [clientX, clientY]);

  return (
    <div className="flex justify-center items-center relative w-full h-[100vh]">
      <div
        className="  w-[35vw] h-[90vh] rounded-xl relative"
        ref={wrapperImage}
      >
        {['desktop.jpg', 'tesla.jpeg', 'holidays.jpg'].map((source, index) => (
          <Image
            key={index}
            src={`/images/${source}`}
            alt={source}
            width={0}
            height={0}
            className="border-2  w-full h-full object-cover absolute rounded-3xl"
          />
        ))}
      </div>
      <div className="w-full flex absolute bottom-0 justify-center items-center">
        <h2 className="text-[200px]">CREATIVE AGENCY</h2>
        <span className=" w-[30px] h-[30px] bg-purple-200 rounded-full"></span>
      </div>
    </div>
  );
}
