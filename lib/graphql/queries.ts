export const GET_POSTS_QUERY = `
  query NewQuery {
    posts {
      nodes {
        title
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;
