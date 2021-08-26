import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/4199/scsexchange/v0.0.1',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const healthClient = new ApolloClient({
  uri: 'https://api.thegraph.com/index-node/graphql',
  cache: new InMemoryCache(),
})

export const blockClient = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/4199/scs-blocks/v0.0.1',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
})
