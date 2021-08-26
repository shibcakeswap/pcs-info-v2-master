import { ChartDayData, Transaction } from 'types'

export interface ProtocolData {
  // volume
  volumeUSD: number
  volumeUSDChange: number

  // in range liquidity
  tvlUSD: number
  tvlUSDChange: number

  // transactions
  txCount: number
  txCountChange: number
}

export interface ProtocolState {
  // timestamp for last updated fetch
  readonly lastUpdated: number | undefined

  // overview data
  readonly data: ProtocolData | undefined

  readonly chartData: ChartDayData[] | undefined

  readonly transactions: Transaction[] | undefined
}
