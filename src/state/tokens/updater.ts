import { useEffect, useMemo } from 'react'
import { useFetchedTokenDatas } from 'data/tokens/tokenData'
import { useAllTokenData, useUpdateTokenData, useAddTokenKeys } from './hooks'
import { useTopTokenAddresses } from '../../data/tokens/topTokens'

export default function TokenUpdater(): null {
  // updaters
  const updateTokenDatas = useUpdateTokenData()
  const addTokenKeys = useAddTokenKeys()

  // intitial data
  const allTokenData = useAllTokenData()
  const { loading, error, addresses } = useTopTokenAddresses()

  // add top tokens on first load
  useEffect(() => {
    if (addresses && !error && !loading) {
      addTokenKeys(addresses)
    }
  }, [addTokenKeys, addresses, error, loading])

  // detect for which addresses we havent loaded token data yet
  const unfetchedTokenAddresses = useMemo(() => {
    return Object.keys(allTokenData).reduce((accum: string[], key) => {
      const tokenData = allTokenData[key]
      if (!tokenData.data || !tokenData.lastUpdated) {
        accum.push(key)
      }
      return accum
    }, [])
  }, [allTokenData])

  // update unloaded pool entries with fetched data
  const {
    error: tokenDataError,
    loading: tokenDataLoading,
    data: tokenDatas,
  } = useFetchedTokenDatas(unfetchedTokenAddresses)
  useEffect(() => {
    if (tokenDatas && !tokenDataError && !tokenDataLoading) {
      updateTokenDatas(Object.values(tokenDatas))
    }
  }, [tokenDataError, tokenDataLoading, tokenDatas, updateTokenDatas])

  return null
}
