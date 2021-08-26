import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { TOKEN_BLACKLIST } from 'config'

/**
 * Tokens to display on Home page
 * The actual data is later requested in tokenData.ts
 */
export const TOP_TOKENS = gql`
  query topTokens($blacklist: [String!]) {
    tokens(
      first: 30
      where: { totalTransactions_gt: 100, id_not_in: $blacklist }
      orderBy: tradeVolumeUSD
      orderDirection: desc
    ) {
      id
    }
  }
`

interface TopTokensResponse {
  tokens: {
    id: string
  }[]
}

// token has no symbol, name and has liquidity of 0.1
// should we just filter out empty names & symbols in query? Maybe even absurdly low liquidity
// const PCS_BAD_TOKENS = ['0x4269e4090ff9dfc99d8846eb0d42e67f01c3ac8b']

/**
 * Fetch top addresses by volume
 */
export function useTopTokenAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { loading, error, data } = useQuery<TopTokensResponse>(TOP_TOKENS, {
    variables: { blacklist: TOKEN_BLACKLIST },
  })

  const formattedData = useMemo(() => {
    if (data) {
      return data.tokens.map((t) => t.id)
    }
    return undefined
  }, [data])

  return {
    loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}
