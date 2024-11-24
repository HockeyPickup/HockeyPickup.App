import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

declare const __API_URL__: string;

// Create the http link
const httpLink = createHttpLink({
  uri: `${__API_URL__}/graphql`,
  credentials: 'include',
});

console.info('GraphQL Url:', __API_URL__);

// Add the auth link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
