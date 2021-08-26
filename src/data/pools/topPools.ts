import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { TOKEN_BLACKLIST } from 'config'

/**
 * Initial pools to display on the home page
 */
export const TOP_POOLS = gql`
  query topPools($blacklist: [String!]) {
    pairs(
      first: 30
      orderBy: trackedReserveBNB
      orderDirection: desc
      where: { totalTransactions_gt: 1000, token0_not_in: $blacklist, token1_not_in: $blacklist }
    ) {
      id
    }
  }
`

interface TopPoolsResponse {
  pairs: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopPoolAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { loading, error, data } = useQuery<TopPoolsResponse>(TOP_POOLS, {
    variables: {
      blacklist: TOKEN_BLACKLIST,
    },
    fetchPolicy: 'network-only',
  })

  const formattedData = useMemo(() => {
    if (data) {
      return data.pairs.map((p) => p.id)
    }
    return undefined
  }, [data])

  return {
    loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}
