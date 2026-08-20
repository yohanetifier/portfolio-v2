import { ProjectItem } from '@/contexts/ThreeJsContext';
import { Group, Object3DEventMap } from 'three';

// export const getPositions = (children: HTMLElement[], target: HTMLElement) => {
//   const childAtTheBottom: HTMLElement[] = [];
//   const childAtTheTop: HTMLElement[] = [];
//   children.forEach((child) => {
//     const position = child.getBoundingClientRect();
//     const isAtTheBottom = position.top > target.getBoundingClientRect().top;
//     if (isAtTheBottom) {
//       childAtTheBottom.push(child as HTMLElement);
//     } else {
//       childAtTheTop.push(child as HTMLElement);
//     }
//   });
//   return {
//     childAtTheBottom,
//     childAtTheTop,
//   };
// };

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
