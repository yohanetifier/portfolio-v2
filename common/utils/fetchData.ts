// import { API_URL } from '@/config/constants';

export const fetchData = async (query: string, variables = {}) => {
  const res = await fetch(
    'https://ivory-bat-745340.hostingersite.com/graphql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = await res.json();
  return data;
};
