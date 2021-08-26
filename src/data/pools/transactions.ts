import { client } from 'config/apolloClient'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'

/**
 * Transactions of the given pool, used on Pool page
 */
const POOL_TRANSACTIONS = gql`
  query poolTransactions($address: Bytes!) {
    mints(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
      id
      timestamp
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
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
      id
      timestamp
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
    burns(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
      id
      timestamp
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
      liquidity
      amount0
      amount1
      amountUSD
    }
  }
`

interface TransactionResults {
  mints: {
    id: string
    timestamp: string
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
    liquidity: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  swaps: {
    id: string
    timestamp: string
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
    id: string
    timestamp: string
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
    liquidity: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
}

export default async function fetchPoolTransactions(
  address: string,
): Promise<{ data: Transaction[] | undefined; error: boolean; loading: boolean }> {
  const { data, error, loading } = await client.query<TransactionResults>({
    query: POOL_TRANSACTIONS,
    variables: {
      address,
    },
    fetchPolicy: 'cache-first',
  })

  if (error) {
    return {
      data: undefined,
      error: true,
      loading: false,
    }
  }

  if (loading || !data) {
    return {
      data: undefined,
      error: false,
      loading: true,
    }
  }

  const mints = data.mints.map((mint) => {
    return {
      type: TransactionType.MINT,
      hash: mint.id.split('-')[0],
      timestamp: mint.timestamp,
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
  const burns = data.burns.map((burn) => {
    return {
      type: TransactionType.BURN,
      hash: burn.id.split('-')[0],
      timestamp: burn.timestamp,
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

  const swaps = data.swaps.map((swap) => {
    return {
      type: TransactionType.SWAP,
      hash: swap.id.split('-')[0],
      timestamp: swap.timestamp,
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

  return { data: [...mints, ...burns, ...swaps], error: false, loading: false }
}
