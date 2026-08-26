import { Group } from 'three';

export const getPositions = (allMeshs: Group[], target: Group | null) => {
  const filterMeshes = allMeshs.filter((el) => {
    return el !== target;
  });
  const childAtTheBottom: Group[] = [];
  const childAtTheTop: Group[] = [];
  filterMeshes.forEach((mesh) => {
    if (mesh.position.y > target!.position.y) {
      childAtTheTop.push(mesh);
    } else {
      childAtTheBottom.push(mesh);
    }
  });

  return {
    childAtTheBottom,
    childAtTheTop,
  };
};
