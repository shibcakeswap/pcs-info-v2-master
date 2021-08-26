/* eslint-disable no-param-reassign */
import { currentTimestamp } from 'utils'
import { createReducer } from '@reduxjs/toolkit'
import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { ProtocolState } from './types'

export const initialState: ProtocolState = {
  data: undefined,
  chartData: undefined,
  transactions: undefined,
  lastUpdated: undefined,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateProtocolData, (state, { payload: { protocolData } }) => {
      state.data = protocolData
      // mark when last updated
      state.lastUpdated = currentTimestamp()
    })
    .addCase(updateChartData, (state, { payload: { chartData } }) => {
      state.chartData = chartData
    })
    .addCase(updateTransactions, (state, { payload: { transactions } }) => {
      state.transactions = transactions
    }),
)
