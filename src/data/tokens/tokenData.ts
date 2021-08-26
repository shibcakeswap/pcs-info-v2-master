/* eslint-disable no-param-reassign */
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { getPercentChangeForNumbers, get24hChange } from 'utils/data'
import { TokenData } from 'state/tokens/types'
import { useBnbPrices } from 'hooks/useBnbPrices'

/**
 * Main token data to display on Token page
 */
export const TOKENS_BULK = (block: number | undefined, tokens: string[]) => {
  const addressesString = `["${tokens.join('","')}"]`
  const blockString = block ? `block: {number: ${block}}` : ``
  const queryString = `
    query tokens {
      tokens(
        where: {id_in: ${addressesString}}
        ${blockString}
        orderBy: tradeVolumeUSD
        orderDirection: desc
      ) {
        id
        symbol
        name
        derivedBNB
        derivedUSD
        tradeVolumeUSD
        tradeVolume
        totalTransactions
        totalLiquidity
      }
    }
    `
  return gql(queryString)
}

interface TokenFields {
  id: string
  symbol: string
  name: string
  derivedBNB: string // Price in BNB per token
  derivedUSD: string // Price in USD per token
  tradeVolumeUSD: string
  tradeVolume: string
  totalTransactions: string
  totalLiquidity: string
}

interface TokenDataResponse {
  tokens: TokenFields[]
  bundles: {
    ethPriceUSD: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useFetchedTokenDatas(tokenAddresses: string[]): {
  loading: boolean
  error: boolean
  data:
    | {
        [address: string]: TokenData
      }
    | undefined
} {
  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()

  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, , blockWeek] = blocks ?? []
  const bnbPrices = useBnbPrices()

  const { loading, error, data } = useQuery<TokenDataResponse>(TOKENS_BULK(undefined, tokenAddresses), {
    fetchPolicy: 'no-cache',
  })

  const {
    loading: loading24,
    error: error24,
    data: data24,
  } = useQuery<TokenDataResponse>(TOKENS_BULK(parseInt(block24?.number), tokenAddresses))

  const {
    loading: loadingWeek,
    error: errorWeek,
    data: dataWeek,
  } = useQuery<TokenDataResponse>(TOKENS_BULK(parseInt(blockWeek?.number), tokenAddresses))

  const anyError = Boolean(error || error24 || blockError || errorWeek)
  const anyLoading = Boolean(loading || loading24 || loadingWeek || !blocks)

  if (!bnbPrices) {
    return {
      loading: true,
      error: false,
      data: undefined,
    }
  }

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = data?.tokens
    ? data.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed24 = data24?.tokens
    ? data24.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsedWeek = dataWeek?.tokens
    ? dataWeek.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  // format data and calculate daily changes
  const formatted = tokenAddresses.reduce((accum: { [address: string]: TokenData }, address) => {
    const current: TokenFields | undefined = parsed[address]
    const oneDay: TokenFields | undefined = parsed24[address]
    const week: TokenFields | undefined = parsedWeek[address]

    // TODO PCS maybe refactor to parse all stuff beforehand

    const [volumeUSD, volumeUSDChange] =
      // eslint-disable-next-line no-nested-ternary
      current && oneDay
        ? get24hChange(current.tradeVolumeUSD, oneDay.tradeVolumeUSD)
        : current
        ? [parseFloat(current.tradeVolumeUSD), 0]
        : [0, 0]
    const volumeUSDWeek =
      // eslint-disable-next-line no-nested-ternary
      current && week
        ? parseFloat(current.tradeVolumeUSD) - parseFloat(week.tradeVolumeUSD)
        : current
        ? parseFloat(current.tradeVolumeUSD)
        : 0
    const tvlUSD = current ? parseFloat(current.totalLiquidity) * parseFloat(current.derivedUSD) : 0
    const tvlUSDOneDayAgo = oneDay ? parseFloat(oneDay.totalLiquidity) * parseFloat(oneDay.derivedUSD) : 0
    const tvlUSDChange = getPercentChangeForNumbers(tvlUSD, tvlUSDOneDayAgo)
    const tvlToken = current ? parseFloat(current.totalLiquidity) : 0
    // Prices of tokens for now, 24h ago and 7d ago
    const priceUSD = current ? parseFloat(current.derivedBNB) * bnbPrices.current : 0
    const priceUSDOneDay = oneDay ? parseFloat(oneDay.derivedBNB) * bnbPrices.oneDay : 0
    const priceUSDWeek = week ? parseFloat(week.derivedBNB) * bnbPrices.week : 0
    const priceUSDChange = priceUSD && priceUSDOneDay ? getPercentChangeForNumbers(priceUSD, priceUSDOneDay) : 0
    const priceUSDChangeWeek = priceUSD && priceUSDWeek ? getPercentChangeForNumbers(priceUSD, priceUSDWeek) : 0
    const txCount =
      // eslint-disable-next-line no-nested-ternary
      current && oneDay
        ? parseFloat(current.totalTransactions) - parseFloat(oneDay.totalTransactions)
        : current
        ? parseFloat(current.totalTransactions)
        : 0

    accum[address] = {
      exists: !!current,
      address,
      name: current ? current.name : '',
      symbol: current ? current.symbol : '',
      volumeUSD,
      volumeUSDChange,
      volumeUSDWeek,
      txCount,
      tvlUSD,
      tvlUSDChange,
      tvlToken,
      priceUSD,
      priceUSDChange,
      priceUSDChangeWeek,
    }

    return accum
  }, {})

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}
