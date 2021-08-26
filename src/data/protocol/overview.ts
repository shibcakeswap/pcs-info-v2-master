import { getPercentChange } from 'utils/data'
import { ProtocolData } from 'state/protocol/types'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useMemo } from 'react'

/**
 * Latest TVL and Volume TODO do we need it huh?
 */
export const GLOBAL_DATA = (block?: string) => {
  const queryString = ` query pancakeFactories {
      pancakeFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       first: 1) {
        totalTransactions
        totalVolumeUSD
        totalLiquidityUSD
      }
    }`
  return gql(queryString)
}

interface GlobalResponse {
  pancakeFactories: {
    totalTransactions: string
    totalVolumeUSD: string
    totalLiquidityUSD: string
  }[]
}

export function useFetchProtocolData(): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
  const [block24, block48] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery<GlobalResponse>(GLOBAL_DATA())

  const {
    loading: loading24,
    error: error24,
    data: data24,
  } = useQuery<GlobalResponse>(GLOBAL_DATA(block24?.number ?? undefined))
  const {
    loading: loading48,
    error: error48,
    data: data48,
  } = useQuery<GlobalResponse>(GLOBAL_DATA(block48?.number ?? undefined))

  const anyError = Boolean(error || error24 || error48 || blockError)
  const anyLoading = Boolean(loading || loading24 || loading48)

  const parsed = data?.pancakeFactories?.[0]
  const parsed24 = data24?.pancakeFactories?.[0]
  const parsed48 = data48?.pancakeFactories?.[0]

  const formattedData: ProtocolData | undefined = useMemo(() => {
    if (anyError || anyLoading || !parsed || !blocks) {
      return undefined
    }

    // volume data
    const volumeUSD =
      parsed && parsed24
        ? parseFloat(parsed.totalVolumeUSD) - parseFloat(parsed24.totalVolumeUSD)
        : parseFloat(parsed.totalVolumeUSD)

    const volumeUSDChange =
      parsed && parsed24 && parsed48 && volumeUSD
        ? (volumeUSD / (parseFloat(parsed24.totalVolumeUSD) - parseFloat(parsed48.totalVolumeUSD))) * 100
        : 0

    // total value locked
    const tvlUSDChange = getPercentChange(parsed?.totalLiquidityUSD, parsed24?.totalLiquidityUSD)

    // 24H transactions
    const txCount =
      parsed && parsed24
        ? parseFloat(parsed.totalTransactions) - parseFloat(parsed24.totalTransactions)
        : parseFloat(parsed.totalTransactions)

    const txCountChange = getPercentChange(parsed.totalTransactions, parsed24?.totalTransactions)

    return {
      volumeUSD,
      volumeUSDChange: typeof volumeUSDChange === 'number' ? volumeUSDChange : 0,
      tvlUSD: parseFloat(parsed.totalLiquidityUSD),
      tvlUSDChange,
      txCount,
      txCountChange,
    }
  }, [anyError, anyLoading, blocks, parsed, parsed24, parsed48])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
  }
}
