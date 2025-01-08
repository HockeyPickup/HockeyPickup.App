import { TOKEN_KEY } from '@/lib/auth';
import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import axios from 'axios';
import { createClient } from 'graphql-ws';

declare const __API_URL__: string;

const api = axios.create({
  baseURL: __API_URL__,
  withCredentials: true,
});

console.info('Api Url:', __API_URL__);

// Set up the HTTP link
const httpLink = createHttpLink({
  uri: `${__API_URL__}/graphql`,
  credentials: 'include',
});

const LOCAL_API_PORT = 7042;

// Create WebSocket URL
const wsUrl =
  __API_URL__ === '/api'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:${LOCAL_API_PORT}/ws`
    : __API_URL__.replace(/^http/, 'ws').replace(/\/api$/, '/ws');
console.debug('WebSocket URL:', wsUrl);

// Auth link setup for HTTP requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// WebSocket link with auth
export const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    connectionParams: () => {
      console.debug(
        'Setting up WebSocket connection params with token:',
        !!localStorage.getItem(TOKEN_KEY),
      );
      const token = localStorage.getItem(TOKEN_KEY);
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    on: {
      connected: () => {
        console.debug('WebSocket connected');
      },
      connecting: () => {
        console.debug('WebSocket connecting...');
      },
      error: (error) => {
        console.error('WebSocket error:', error);
      },
      closed: () => {
        console.debug('WebSocket closed');
      },
      message: (message) => {
        console.debug('Message received:', message);
      },
    },
  }),
);

// Split traffic between WebSocket and HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Only set Content-Type: application/json if we're not sending FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export default api;
