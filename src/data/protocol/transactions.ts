import { client } from 'config/apolloClient'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'

/**
 * Transactions for Transaction table on the Home page
 */
const GLOBAL_TRANSACTIONS = gql`
  query transactions {
    transactions(first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      mints {
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        to
        amount0
        amount1
        amountUSD
      }
      swaps {
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        from
        amount0In
        amount1In
        amount0Out
        amount1Out
        amountUSD
      }
      burns {
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        sender
        amount0
        amount1
        amountUSD
      }
    }
  }
`

type TransactionEntry = {
  timestamp: string
  id: string
  mints: {
    pair: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    to: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  swaps: {
    pair: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    from: string
    amount0In: string
    amount1In: string
    amount0Out: string
    amount1Out: string
    amountUSD: string
  }[]
  burns: {
    pair: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    sender: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
}

interface TransactionResults {
  transactions: TransactionEntry[]
}

async function fetchTopTransactions(): Promise<Transaction[] | undefined> {
  try {
    const { data, error, loading } = await client.query<TransactionResults>({
      query: GLOBAL_TRANSACTIONS,
      fetchPolicy: 'network-only',
    })

    if (error || loading || !data) {
      return undefined
    }

    const formatted = data.transactions.reduce((accum: Transaction[], transaction: TransactionEntry) => {
      const mintEntries = transaction.mints.map((mint) => {
        return {
          type: TransactionType.MINT,
          hash: transaction.id,
          timestamp: transaction.timestamp,
          sender: mint.to,
          token0Symbol: mint.pair.token0.symbol,
          token1Symbol: mint.pair.token1.symbol,
          token0Address: mint.pair.token0.id,
          token1Address: mint.pair.token1.id,
          amountUSD: parseFloat(mint.amountUSD),
          amountToken0: parseFloat(mint.amount0),
          amountToken1: parseFloat(mint.amount1),
        }
      })
      const burnEntries = transaction.burns.map((burn) => {
        return {
          type: TransactionType.BURN,
          hash: transaction.id,
          timestamp: transaction.timestamp,
          sender: burn.sender,
          token0Symbol: burn.pair.token0.symbol,
          token1Symbol: burn.pair.token1.symbol,
          token0Address: burn.pair.token0.id,
          token1Address: burn.pair.token1.id,
          amountUSD: parseFloat(burn.amountUSD),
          amountToken0: parseFloat(burn.amount0),
          amountToken1: parseFloat(burn.amount1),
        }
      })

      const swapEntries = transaction.swaps.map((swap) => {
        return {
          hash: transaction.id,
          type: TransactionType.SWAP,
          timestamp: transaction.timestamp,
          sender: swap.from,
          token0Symbol: swap.pair.token0.symbol,
          token1Symbol: swap.pair.token1.symbol,
          token0Address: swap.pair.token0.id,
          token1Address: swap.pair.token1.id,
          amountUSD: parseFloat(swap.amountUSD),
          amountToken0: parseFloat(swap.amount0In) - parseFloat(swap.amount0Out),
          amountToken1: parseFloat(swap.amount1In) - parseFloat(swap.amount1Out),
        }
      })
      // eslint-disable-next-line no-param-reassign
      accum = [...accum, ...mintEntries, ...burnEntries, ...swapEntries]
      return accum
    }, [])

    return formatted
  } catch {
    return undefined
  }
}

export default fetchTopTransactions
