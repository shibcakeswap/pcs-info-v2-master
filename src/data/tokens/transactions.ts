import { client } from 'config/apolloClient'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'

/**
 * Data to display transaction table on Token page
 */
const TOKEN_TRANSACTIONS = gql`
  query tokenTransactions($address: Bytes!) {
    mintsAs0: mints(first: 10, orderBy: timestamp, orderDirection: desc, where: { token0: $address }) {
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
      amount0
      amount1
      amountUSD
    }
    mintsAs1: mints(first: 10, orderBy: timestamp, orderDirection: desc, where: { token0: $address }) {
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
      amount0
      amount1
      amountUSD
    }
    swapsAs0: swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { token0: $address }) {
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
    swapsAs1: swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { token1: $address }) {
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
    burnsAs0: burns(first: 10, orderBy: timestamp, orderDirection: desc, where: { token0: $address }) {
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
      amount0
      amount1
      amountUSD
    }
    burnsAs1: burns(first: 10, orderBy: timestamp, orderDirection: desc, where: { token1: $address }) {
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
      amount0
      amount1
      amountUSD
    }
  }
`

interface TransactionResults {
  mintsAs0: {
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
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  mintsAs1: {
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
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  swapsAs0: {
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
  swapsAs1: {
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
  burnsAs0: {
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
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  burnsAs1: {
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
    amount0: string
    amount1: string
    amountUSD: string
  }[]
}

export default async function fetchTokenTransactions(
  address: string,
): Promise<{ data: Transaction[] | undefined; error: boolean; loading: boolean }> {
  try {
    const { data, error, loading } = await client.query<TransactionResults>({
      query: TOKEN_TRANSACTIONS,
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

    if (loading && !data) {
      return {
        data: undefined,
        error: false,
        loading: true,
      }
    }

    const mints0 = data.mintsAs0.map((mint) => {
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
    const mints1 = data.mintsAs1.map((mint) => {
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

    const burns0 = data.burnsAs0.map((burn) => {
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
    const burns1 = data.burnsAs1.map((burn) => {
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

    const swaps0 = data.swapsAs0.map((swap) => {
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

    const swaps1 = data.swapsAs1.map((swap) => {
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

    return { data: [...mints0, ...mints1, ...burns0, ...burns1, ...swaps0, ...swaps1], error: false, loading: false }
  } catch {
    return {
      data: undefined,
      error: true,
      loading: false,
    }
  }
}
