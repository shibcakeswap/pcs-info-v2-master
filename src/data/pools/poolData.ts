/* eslint-disable no-param-reassign */
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PoolData } from 'state/pools/types'
import { get24hChange } from 'utils/data'

/**
 * Data for displaying pool tables (on multiple pages, used throughout the site)
 * Note: Don't try to refactor it to use variables, server throws error if blocks passed as undefined variable
 * only works if its hard-coded into query string
 */

export const POOL_AT_BLOCK = (block: number | null, pools: string[]) => {
  const blockString = block ? `block: {number: ${block}}` : ``
  const addressesString = `["${pools.join('","')}"]`
  return `pairs(
    where: { id_in: ${addressesString} }
    ${blockString}
    orderBy: trackedReserveBNB
    orderDirection: desc
  ) {
    id
    reserve0
    reserve1
    reserveUSD
    volumeUSD
    token0Price
    token1Price
    token0 {
      id
      symbol
      name
    }
    token1 {
      id
      symbol
      name
    }
  }`
}

export const POOLS_BULK = (block24: number, blockWeek: number, pools: string[]) => {
  return gql`
    query poolsBulk {
      now: ${POOL_AT_BLOCK(null, pools)}
      oneDayAgo: ${POOL_AT_BLOCK(block24, pools)}
      oneWeekAgo: ${POOL_AT_BLOCK(blockWeek, pools)}
    }
  `
}

interface PoolFields {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  volumeUSD: string
  token0Price: string
  token1Price: string
  token0: {
    id: string
    symbol: string
    name: string
  }
  token1: {
    id: string
    symbol: string
    name: string
  }
}

interface PoolsQueryResponse {
  now: PoolFields[]
  oneDayAgo: PoolFields[]
  oneWeekAgo: PoolFields[]
}

// Transforms pools into "0xADDRESS: { ...PoolFields }" format
const parsePoolData = (pairs?: PoolFields[]) => {
  return pairs
    ? pairs.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
}

/**
 * Fetch top pools by liquidity
 */
export function usePoolDatas(poolAddresses: string[]): {
  loading: boolean
  error: boolean
  data?: {
    [address: string]: PoolData
  }
} {
  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, , blockWeek] = blocks ?? []

  // Note - it is very important to NOT use cache here
  // Apollo tries to do some optimizations under the hood so data from query that comes first
  // gets reused in the results for subsequent queries.
  // Moreover blocks are constantly changing so there is no sense to use cache here at all
  const { loading, error, data } = useQuery<PoolsQueryResponse>(
    POOLS_BULK(block24?.number, blockWeek?.number, poolAddresses),
    {
      fetchPolicy: 'no-cache',
      skip: poolAddresses.length === 0 || !block24 || !blockWeek,
    },
  )

  const anyError = Boolean(error || blockError)

  // return early if not all data yet
  if (anyError || loading) {
    return {
      loading,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = parsePoolData(data?.now)
  const parsed24 = parsePoolData(data?.oneDayAgo)
  const parsedWeek = parsePoolData(data?.oneWeekAgo)

  // format data and calculate daily changes
  const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
    const current: PoolFields | undefined = parsed[address]
    const oneDay: PoolFields | undefined = parsed24[address]
    const week: PoolFields | undefined = parsedWeek[address]

    const [volumeUSD, volumeUSDChange] =
      // eslint-disable-next-line no-nested-ternary
      current && oneDay
        ? get24hChange(current.volumeUSD, oneDay.volumeUSD)
        : current
        ? [parseFloat(current.volumeUSD), 0]
        : [0, 0]

    const volumeUSDWeek =
      // eslint-disable-next-line no-nested-ternary
      current && week
        ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
        : current
        ? parseFloat(current.volumeUSD)
        : 0

    const tvlUSD = current ? parseFloat(current.reserveUSD) : 0

    const tvlUSDChange =
      current && oneDay
        ? ((parseFloat(current.reserveUSD) - parseFloat(oneDay.reserveUSD)) / parseFloat(oneDay.reserveUSD)) * 100
        : 0

    const tvlToken0 = current ? parseFloat(current.reserve0) : 0
    const tvlToken1 = current ? parseFloat(current.reserve1) : 0

    if (current) {
      accum[address] = {
        address,
        token0: {
          address: current.token0.id,
          name: current.token0.name,
          symbol: current.token0.symbol,
        },
        token1: {
          address: current.token1.id,
          name: current.token1.name,
          symbol: current.token1.symbol,
        },
        token0Price: parseFloat(current.token0Price),
        token1Price: parseFloat(current.token1Price),
        volumeUSD,
        volumeUSDChange,
        volumeUSDWeek,
        tvlUSD,
        tvlUSDChange,
        tvlToken0,
        tvlToken1,
      }
    }

    return accum
  }, {})

  return {
    loading,
    error: anyError,
    data: formatted,
  }
}
