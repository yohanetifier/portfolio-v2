import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useLoader, useThree } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import Plane from '../Plane/Plane';

const HeroPlane = () => {
  const { projectImageSelected } = useThreeJsContext();

  return <Plane animationIsOver={false} imageUrl={projectImageSelected} />;
};

export default HeroPlane;
