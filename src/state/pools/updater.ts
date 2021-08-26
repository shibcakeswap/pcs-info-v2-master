import { useEffect, useMemo } from 'react'
import { useTopPoolAddresses } from 'data/pools/topPools'
import { usePoolDatas } from 'data/pools/poolData'
import { useUpdatePoolData, useAllPoolData, useAddPoolKeys } from './hooks'

export default function Updater(): null {
  // updaters
  const updatePoolData = useUpdatePoolData()
  const addPoolKeys = useAddPoolKeys()

  // data
  const allPoolData = useAllPoolData()
  const { loading, error, addresses } = useTopPoolAddresses()

  // add top pools on first load
  useEffect(() => {
    if (addresses && !error && !loading) {
      addPoolKeys(addresses)
    }
  }, [addPoolKeys, addresses, error, loading])

  // detect for which addresses we havent loaded pool data yet
  const unfetchedPoolAddresses = useMemo(() => {
    return Object.keys(allPoolData).reduce((accum: string[], address) => {
      const poolData = allPoolData[address]
      if (!poolData.data || !poolData.lastUpdated) {
        accum.push(address)
      }
      return accum
    }, [])
  }, [allPoolData])

  // update unloaded pool entries with fetched data
  const { error: poolDataError, loading: poolDataLoading, data: poolDatas } = usePoolDatas(unfetchedPoolAddresses)
  useEffect(() => {
    if (poolDatas && !poolDataError && !poolDataLoading) {
      updatePoolData(Object.values(poolDatas))
    }
  }, [poolDataError, poolDataLoading, poolDatas, updatePoolData])

  return null
}
