export const GET_POSTS_QUERY = `
  query GetPosts {
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

export const GET_POSTS_BY_TITLE = `
  query GetPostsByTitle ($title: String) {
    posts(where: {title: $title}){
      nodes{
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
