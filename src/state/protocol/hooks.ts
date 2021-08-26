import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState, AppDispatch } from 'state'
import { ChartDayData, Transaction } from 'types'
import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { ProtocolData } from './types'

export function useProtocolData(): [ProtocolData | undefined, (protocolData: ProtocolData) => void] {
  const protocolData: ProtocolData | undefined = useSelector((state: AppState) => state.protocol.data)

  const dispatch = useDispatch<AppDispatch>()
  const setProtocolData: (protocolData: ProtocolData) => void = useCallback(
    (data: ProtocolData) => dispatch(updateProtocolData({ protocolData: data })),
    [dispatch],
  )

  return [protocolData, setProtocolData]
}

export function useProtocolChartData(): [ChartDayData[] | undefined, (chartData: ChartDayData[]) => void] {
  const chartData: ChartDayData[] | undefined = useSelector((state: AppState) => state.protocol.chartData)
  const dispatch = useDispatch<AppDispatch>()
  const setChartData: (chartData: ChartDayData[]) => void = useCallback(
    (data: ChartDayData[]) => dispatch(updateChartData({ chartData: data })),
    [dispatch],
  )
  return [chartData, setChartData]
}

export function useProtocolTransactions(): [Transaction[] | undefined, (transactions: Transaction[]) => void] {
  const transactions: Transaction[] | undefined = useSelector((state: AppState) => state.protocol.transactions)
  const dispatch = useDispatch<AppDispatch>()
  const setTransactions: (transactions: Transaction[]) => void = useCallback(
    (transactionsData: Transaction[]) => dispatch(updateTransactions({ transactions: transactionsData })),
    [dispatch],
  )
  return [transactions, setTransactions]
}
