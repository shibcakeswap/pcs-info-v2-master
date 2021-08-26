import { addPoolKeys, updatePoolChartData, updatePoolTransactions } from 'state/pools/actions'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notEmpty } from 'utils'
import fetchPoolChartData from 'data/pools/chartData'
import { Transaction } from 'types'
import { AppState, AppDispatch } from 'state'
import fetchPoolTransactions from 'data/pools/transactions'
import { PoolData, PoolChartEntry } from './types'
import { updatePoolData } from './actions'

export function useAllPoolData(): {
  [address: string]: { data: PoolData | undefined; lastUpdated: number | undefined }
} {
  return useSelector((state: AppState) => state.pools.byAddress)
}

export function useUpdatePoolData(): (pools: PoolData[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((pools: PoolData[]) => dispatch(updatePoolData({ pools })), [dispatch])
}

export function useAddPoolKeys(): (addresses: string[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((poolAddresses: string[]) => dispatch(addPoolKeys({ poolAddresses })), [dispatch])
}

export function usePoolDatas(poolAddresses: string[]): PoolData[] {
  const allPoolData = useAllPoolData()
  const addNewPoolKeys = useAddPoolKeys()

  const untrackedAddresses = poolAddresses.reduce((accum: string[], address) => {
    if (!Object.keys(allPoolData).includes(address)) {
      accum.push(address)
    }
    return accum
  }, [])

  useEffect(() => {
    if (untrackedAddresses) {
      addNewPoolKeys(untrackedAddresses)
    }
  }, [addNewPoolKeys, untrackedAddresses])

  // filter for pools with data
  const poolsWithData = poolAddresses
    .map((address) => {
      const poolData = allPoolData[address]?.data
      return poolData ?? undefined
    })
    .filter(notEmpty)

  return poolsWithData
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function usePoolChartData(address: string): PoolChartEntry[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.pools.byAddress[address])
  const chartData = pool?.chartData
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { error: fetchError, data } = await fetchPoolChartData(address)
      if (!fetchError && data) {
        dispatch(updatePoolChartData({ poolAddress: address, chartData: data }))
      }
      if (fetchError) {
        setError(fetchError)
      }
    }
    if (!chartData && !error) {
      fetch()
    }
  }, [address, dispatch, error, chartData])

  // return data
  return chartData
}

/**
 * Get all transactions on pool
 * @param address
 */
export function usePoolTransactions(address: string): Transaction[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.pools.byAddress[address])
  const transactions = pool?.transactions
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { error: fetchError, data } = await fetchPoolTransactions(address)
      if (fetchError) {
        setError(true)
      } else if (data) {
        dispatch(updatePoolTransactions({ poolAddress: address, transactions: data }))
      }
    }
    if (!transactions && !error) {
      fetch()
    }
  }, [address, dispatch, error, transactions])

  // return data
  return transactions
}
