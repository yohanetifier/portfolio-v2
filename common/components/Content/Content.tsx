'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  mediaUrls: string[];
}

const Content = ({ mediaUrls }: Props) => {
  console.log('mediaUrls', mediaUrls);
  const [assets, setAssets] = useState<string[]>([]);

  useEffect(() => {
    console.log('first render');
    setAssets(() => {
      return mediaUrls;
    });
    console.log('assets', assets);
  }, [assets, mediaUrls]);

  return (
    <div>
      {assets.map((element, index) => (
        <Image
          key={index}
          src={element}
          alt={'first-image'}
          width={1000}
          height={1000}
          className="w-screen h-screen"
        />
      ))}
    </div>
  );
};

export default Content;
