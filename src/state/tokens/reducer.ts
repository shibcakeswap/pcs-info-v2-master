/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit'
import { PriceChartEntry, Transaction } from 'types'
import { currentTimestamp } from 'utils'
import {
  updateTokenData,
  addTokenKeys,
  addPoolAddresses,
  updateChartData,
  updatePriceData,
  updateTransactions,
} from './actions'
import { TokenData, TokenChartEntry } from './types'

export interface TokensState {
  // analytics data from
  byAddress: {
    [address: string]: {
      data: TokenData | undefined
      poolAddresses: string[] | undefined
      chartData: TokenChartEntry[] | undefined
      priceData: {
        oldestFetchedTimestamp?: number | undefined
        [secondsInterval: number]: PriceChartEntry[] | undefined
      }
      transactions: Transaction[] | undefined
      lastUpdated: number | undefined
    }
  }
}

export const initialState: TokensState = { byAddress: {} }

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateTokenData, (state, { payload: { tokens } }) => {
      // TODO PCS fix this shit
      tokens.map(
        // eslint-disable-next-line no-return-assign
        (tokenData) =>
          (state.byAddress[tokenData.address] = {
            ...state.byAddress[tokenData.address],
            data: tokenData,
            lastUpdated: currentTimestamp(),
          }),
      )
    }) // add address to byAddress keys if not included yet
    .addCase(addTokenKeys, (state, { payload: { tokenAddresses } }) => {
      // TODO PCS fix this shit
      // eslint-disable-next-line array-callback-return
      tokenAddresses.map((address) => {
        if (!state.byAddress[address]) {
          state.byAddress[address] = {
            poolAddresses: undefined,
            data: undefined,
            chartData: undefined,
            priceData: {},
            transactions: undefined,
            lastUpdated: undefined,
          }
        }
      })
    })
    // add list of pools the token is included in
    .addCase(addPoolAddresses, (state, { payload: { tokenAddress, poolAddresses } }) => {
      state.byAddress[tokenAddress] = { ...state.byAddress[tokenAddress], poolAddresses }
    })
    // add list of pools the token is included in
    .addCase(updateChartData, (state, { payload: { tokenAddress, chartData } }) => {
      state.byAddress[tokenAddress] = { ...state.byAddress[tokenAddress], chartData }
    })
    // add list of pools the token is included in
    .addCase(updateTransactions, (state, { payload: { tokenAddress, transactions } }) => {
      state.byAddress[tokenAddress] = { ...state.byAddress[tokenAddress], transactions }
    })
    // update historical price volume based on interval size
    .addCase(
      updatePriceData,
      (state, { payload: { tokenAddress, secondsInterval, priceData, oldestFetchedTimestamp } }) => {
        state.byAddress[tokenAddress] = {
          ...state.byAddress[tokenAddress],
          priceData: {
            ...state.byAddress[tokenAddress].priceData,
            [secondsInterval]: priceData,
            oldestFetchedTimestamp,
          },
        }
      },
    ),
)
