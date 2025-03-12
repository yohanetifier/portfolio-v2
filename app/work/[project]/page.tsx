'use client';
import { useParams } from 'next/navigation';
import React from 'react';

const Work = () => {
  const { project } = useParams();
  console.log('project', project);
  return <div>Work</div>;
};

export default Work;
