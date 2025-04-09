export const getPositions = (children, target) => {
  const childAtTheBottom: HTMLElement[] = [];
  const childAtTheTop: HTMLElement[] = [];
  children.forEach((child) => {
    const position = child.getBoundingClientRect();
    const isAtTheBottom = position.top > target.getBoundingClientRect().top;
    if (isAtTheBottom) {
      childAtTheBottom.push(child as HTMLElement);
    } else {
      childAtTheTop.push(child as HTMLElement);
    }
  });
  return {
    childAtTheBottom,
    childAtTheTop,
  };
};
