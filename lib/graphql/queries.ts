export const GET_POSTS_QUERY = `
  query NewQuery {
    posts {
      nodes {
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;
