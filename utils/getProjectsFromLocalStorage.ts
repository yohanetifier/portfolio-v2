export const getProjectsFromLocalStorage = (key: string) => {
  const getKeyFromLocalStorage = localStorage.getItem(key);
  const projectCoords = getKeyFromLocalStorage
    ? JSON.parse(getKeyFromLocalStorage)
    : null;
  return projectCoords;
};
