import { useCallback, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { BSC_MAINNET_CHAIN_ID } from 'config'

import { AppDispatch, AppState } from 'state'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserDarkMode,
  toggleURLWarning,
  addSavedToken,
  addSavedPool,
} from './actions'

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  )
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ user: { matchesDarkMode: isUserMatchesDarkMode, userDarkMode: isUserDarkMode } }) => ({
      userDarkMode: isUserDarkMode,
      matchesDarkMode: isUserMatchesDarkMode,
    }),
    shallowEqual,
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = true

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch],
  )
}

export function useSavedTokens(): [string[], (address: string) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const savedTokens = useSelector((state: AppState) => state.user.savedTokens)
  const updatedSavedTokens = useCallback(
    (address: string) => {
      dispatch(addSavedToken({ address }))
    },
    [dispatch],
  )
  return [savedTokens ?? [], updatedSavedTokens]
}

export function useSavedPools(): [string[], (address: string) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const savedPools = useSelector((state: AppState) => state.user.savedPools)
  const updateSavedPools = useCallback(
    (address: string) => {
      dispatch(addSavedPool({ address }))
    },
    [dispatch],
  )
  return [savedPools ?? [], updateSavedPools]
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch],
  )
}

export function useUserAddedTokens(): Token[] {
  const serializedTokensMap = useSelector<AppState, AppState['user']['tokens']>(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    return Object.values(serializedTokensMap?.[BSC_MAINNET_CHAIN_ID] ?? {}).map(deserializeToken)
  }, [serializedTokensMap])
}

function serializePair(pair: Pair): SerializedPair {
  // TODO PCS some bad type mismatch
  return {
    // @ts-ignore
    token0: serializeToken(pair.token0),
    // @ts-ignore
    token1: serializeToken(pair.token1),
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch],
  )
}

export function useURLWarningVisible(): boolean {
  return useSelector((state: AppState) => state.user.URLWarningVisible)
}

export function useURLWarningToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}
