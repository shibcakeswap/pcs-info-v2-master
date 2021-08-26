import { useCallback, useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isAddress } from 'ethers/lib/utils'
import { fetchPoolsForToken } from 'data/tokens/poolsForToken'
import fetchTokenChartData from 'data/tokens/chartData'
import { fetchTokenPriceData } from 'data/tokens/priceData'
import fetchTokenTransactions from 'data/tokens/transactions'
import { PriceChartEntry, Transaction } from 'types'
import { AppState, AppDispatch } from 'state'
import { notEmpty } from 'utils'
import dayjs, { OpUnitType } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  updateTokenData,
  addTokenKeys,
  addPoolAddresses,
  updateChartData,
  updatePriceData,
  updateTransactions,
} from './actions'
import { TokenData, TokenChartEntry } from './types'

dayjs.extend(utc)

const CAKE_ADDRESS = '0x818CEE824f8CaEAa05Fb6a1f195935e364D52Af0'

export function useCakePriceUsd(): number | null {
  const cake = useSelector((state: AppState) => state.tokens.byAddress[CAKE_ADDRESS])
  if (cake && cake.data) {
    return cake.data.priceUSD
  }
  return null
}

export function useAllTokenData(): {
  [address: string]: { data: TokenData | undefined; lastUpdated: number | undefined }
} {
  return useSelector((state: AppState) => state.tokens.byAddress)
}

export function useUpdateTokenData(): (tokens: TokenData[]) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (tokens: TokenData[]) => {
      dispatch(updateTokenData({ tokens }))
    },
    [dispatch],
  )
}

export function useAddTokenKeys(): (addresses: string[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((tokenAddresses: string[]) => dispatch(addTokenKeys({ tokenAddresses })), [dispatch])
}

export function useTokenDatas(addresses: string[] | undefined): TokenData[] | undefined {
  const allTokenData = useAllTokenData()
  const addNewTokenKeys = useAddTokenKeys()

  // if token not tracked yet track it
  addresses?.forEach((a) => {
    if (!allTokenData[a]) {
      addNewTokenKeys([a])
    }
  })

  const tokensWithData = useMemo(() => {
    if (!addresses) {
      return undefined
    }
    return addresses
      .map((a) => {
        return allTokenData[a]?.data
      })
      .filter(notEmpty)
  }, [addresses, allTokenData])

  return tokensWithData
}

export function useTokenData(address: string | undefined): TokenData | undefined {
  const allTokenData = useAllTokenData()
  const addNewTokenKeys = useAddTokenKeys()

  // if invalid address return
  if (!address || !isAddress(address)) {
    return undefined
  }

  // if token not tracked yet track it
  if (!allTokenData[address]) {
    addNewTokenKeys([address])
  }

  // return data
  return allTokenData[address]?.data
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function usePoolsForToken(address: string): string[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const token = useSelector((state: AppState) => state.tokens.byAddress[address])
  const poolsForToken = token.poolAddresses
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { loading, error: fetchError, addresses } = await fetchPoolsForToken(address)
      if (!loading && !fetchError && addresses) {
        dispatch(addPoolAddresses({ tokenAddress: address, poolAddresses: addresses }))
      }
      if (fetchError) {
        setError(fetchError)
      }
    }
    if (!poolsForToken && !error) {
      fetch()
    }
  }, [address, dispatch, error, poolsForToken])

  return poolsForToken
}

export function useTokenChartData(address: string): TokenChartEntry[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const token = useSelector((state: AppState) => state.tokens.byAddress[address])
  const { chartData } = token
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { error: fetchError, data } = await fetchTokenChartData(address)
      if (!fetchError && data) {
        dispatch(updateChartData({ tokenAddress: address, chartData: data }))
      }
      if (fetchError) {
        setError(fetchError)
      }
    }
    if (!chartData && !error) {
      fetch()
    }
  }, [address, dispatch, error, chartData])

  return chartData
}

export function useTokenPriceData(
  address: string,
  interval: number,
  timeWindow: OpUnitType,
): PriceChartEntry[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const token = useSelector((state: AppState) => state.tokens.byAddress[address])
  const priceData = token.priceData[interval]
  const [error, setError] = useState(false)

  // construct timestamps and check if we need to fetch more data
  const oldestTimestampFetched = token.priceData.oldestFetchedTimestamp
  const utcCurrentTime = dayjs()
  const startTimestamp = utcCurrentTime.subtract(1, timeWindow).startOf('hour').unix()

  useEffect(() => {
    async function fetch() {
      const { data, error: fetchingError } = await fetchTokenPriceData(address, interval, startTimestamp)
      if (data) {
        dispatch(
          updatePriceData({
            tokenAddress: address,
            secondsInterval: interval,
            priceData: data,
            oldestFetchedTimestamp: startTimestamp,
          }),
        )
      }
      if (fetchingError) {
        setError(true)
      }
    }
    if (!priceData && !error) {
      fetch()
    }
  }, [address, dispatch, error, interval, oldestTimestampFetched, priceData, startTimestamp, timeWindow])

  return priceData
}

export function useTokenTransactions(address: string): Transaction[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const token = useSelector((state: AppState) => state.tokens.byAddress[address])
  const { transactions } = token
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { error: fetchError, data } = await fetchTokenTransactions(address)
      if (fetchError) {
        setError(true)
      } else if (data) {
        dispatch(updateTransactions({ tokenAddress: address, transactions: data }))
      }
    }
    if (!transactions && !error) {
      fetch()
    }
  }, [address, dispatch, error, transactions])

  return transactions
}
