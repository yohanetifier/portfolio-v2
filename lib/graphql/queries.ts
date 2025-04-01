export const GET_POSTS_QUERY = `
  query GetPosts {
    works {
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

export const GET_POSTS_BY_TITLE = `
  query GetPostsByTitle ($title: String) {
    works(where: {title: $title}){
      nodes {
        title
        content
        featuredImage{
          node{
            sourceUrl
            altText
          }
        }
      }	
    }
  } 
`;
