export const GET_PROJECTS = `
  query GetProjects {
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

export const GET_PROJECT_BY_TITLE = `
  query GetProjectByTitle ($title: String) {
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

export const GET_POSTS = `
  query GetPosts {
    posts {
      nodes {
        date
        title
        slug
      }
    }
  }
`;

export const GET_POSTS_BY_SLUG = `
 query GetPostsBySlug($slug: ID!) {
  post(id: $slug, idType: SLUG){
		content
    date
    title
  }
}
`;
