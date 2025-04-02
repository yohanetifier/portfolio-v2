import { postsViewModel } from '@/src/viewmodels/PostViewModel';
import React from 'react';

const page = async () => {
  const data = await postsViewModel();
  console.log('data', data[0].title);
  return <div className="border-2 border-red-500">page</div>;
};

export default page;
