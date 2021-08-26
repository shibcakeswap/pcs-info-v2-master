/* eslint-disable no-param-reassign */
import { currentTimestamp } from 'utils'
import { createReducer } from '@reduxjs/toolkit'
import { SerializedToken } from 'state/user/actions'
import { Transaction } from 'types'
import { updatePoolData, addPoolKeys, updatePoolChartData, updatePoolTransactions } from './actions'
import { PoolData, PoolChartEntry } from './types'

export interface Pool {
  address: string
  token0: SerializedToken
  token1: SerializedToken
}

export interface PoolsState {
  // analytics data from
  byAddress: {
    [address: string]: {
      data: PoolData | undefined
      chartData: PoolChartEntry[] | undefined
      transactions: Transaction[] | undefined
      lastUpdated: number | undefined
    }
  }
}

export const initialState: PoolsState = { byAddress: {} }

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updatePoolData, (state, { payload: { pools } }) => {
      // TODO PCS fix this shit
      pools.map(
        // eslint-disable-next-line no-return-assign
        (poolData) =>
          (state.byAddress[poolData.address] = {
            ...state.byAddress[poolData.address],
            data: poolData,
            lastUpdated: currentTimestamp(),
          }),
      )
    })
    // add address to byAddress keys if not included yet
    .addCase(addPoolKeys, (state, { payload: { poolAddresses } }) => {
      // eslint-disable-next-line array-callback-return
      poolAddresses.map((address) => {
        // TODO PCS fix this shit
        // eslint-disable-next-line array-callback-return
        if (!state.byAddress[address]) {
          state.byAddress[address] = {
            data: undefined,
            chartData: undefined,
            transactions: undefined,
            lastUpdated: undefined,
          }
        }
      })
    })
    .addCase(updatePoolChartData, (state, { payload: { poolAddress, chartData } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], chartData }
    })
    .addCase(updatePoolTransactions, (state, { payload: { poolAddress, transactions } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], transactions }
    }),
)
