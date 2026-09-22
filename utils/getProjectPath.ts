/** Slug projet uniquement pour `/work/[project]` — pas les 404 multi-segments (`/a/b`). */
export const getProjectPath = (path: string) => {
  if (!path) return undefined;
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'work' || !parts[1]) return undefined;
  return parts[1];
};
