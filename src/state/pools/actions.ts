import { createAction } from '@reduxjs/toolkit'
import { Transaction } from 'types'
import { PoolData, PoolChartEntry } from './types'

// protocol wide info
export const updatePoolData = createAction<{ pools: PoolData[] }>('pools/updatePoolData')

// add pool address to byAddress
export const addPoolKeys = createAction<{ poolAddresses: string[] }>('pool/addPoolKeys')

export const updatePoolChartData =
  createAction<{ poolAddress: string; chartData: PoolChartEntry[] }>('pool/updatePoolChartData')

export const updatePoolTransactions =
  createAction<{ poolAddress: string; transactions: Transaction[] }>('pool/updatePoolTransactions')
