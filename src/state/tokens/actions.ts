import { createAction } from '@reduxjs/toolkit'
import { PriceChartEntry, Transaction } from 'types'
import { TokenData, TokenChartEntry } from './types'

// protocol wide info
export const updateTokenData = createAction<{ tokens: TokenData[] }>('tokens/updateTokenData')

// add token address to byAddress
export const addTokenKeys = createAction<{ tokenAddresses: string[] }>('tokens/addTokenKeys')

// add list of pools token is in
export const addPoolAddresses =
  createAction<{ tokenAddress: string; poolAddresses: string[] }>('tokens/addPoolAddresses')

export const updateChartData =
  createAction<{ tokenAddress: string; chartData: TokenChartEntry[] }>('tokens/updateChartData')

export const updateTransactions =
  createAction<{ tokenAddress: string; transactions: Transaction[] }>('tokens/updateTransactions')

// price data at arbitrary intervals
export const updatePriceData =
  createAction<{
    tokenAddress: string
    secondsInterval: number
    priceData: PriceChartEntry[] | undefined
    oldestFetchedTimestamp: number
  }>('tokens/updatePriceData')
