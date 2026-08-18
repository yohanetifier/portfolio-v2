export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  // Fallback pour éviter un crash si la variable d'environnement n'est pas
  // configurée sur l'environnement de dev/prod.
  'https://ivory-bat-745340.hostingersite.com/graphql';
