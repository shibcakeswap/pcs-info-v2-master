import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useDeltaTimestamps } from 'utils/queries'
import { useState, useEffect, useMemo } from 'react'
import { client } from 'config/apolloClient'
import gql from 'graphql-tag'

export interface BnbPrices {
  current: number
  oneDay: number
  twoDay: number
  week: number
}

const BNB_PRICES = gql`
  query prices($block24: Int!, $block48: Int!, $blockWeek: Int!) {
    current: bundle(id: "1") {
      bnbPrice
    }
    oneDay: bundle(id: "1", block: { number: $block24 }) {
      bnbPrice
    }
    twoDay: bundle(id: "1", block: { number: $block48 }) {
      bnbPrice
    }
    oneWeek: bundle(id: "1", block: { number: $blockWeek }) {
      bnbPrice
    }
  }
`

interface PricesResponse {
  current: {
    bnbPrice: string
  }
  oneDay: {
    bnbPrice: string
  }
  twoDay: {
    bnbPrice: string
  }
  oneWeek: {
    bnbPrice: string
  }
}

async function fetchBnbPrices(
  blocks: [number, number, number],
): Promise<{ data: BnbPrices | undefined; error: boolean }> {
  try {
    const { data, error } = await client.query<PricesResponse>({
      query: BNB_PRICES,
      variables: {
        block24: blocks[0],
        block48: blocks[1],
        blockWeek: blocks[2],
      },
    })

    if (error) {
      return {
        error: true,
        data: undefined,
      }
    }
    if (data) {
      return {
        data: {
          current: parseFloat(data.current?.bnbPrice ?? '0'),
          oneDay: parseFloat(data.oneDay?.bnbPrice ?? '0'),
          twoDay: parseFloat(data.twoDay?.bnbPrice ?? '0'),
          week: parseFloat(data.oneWeek?.bnbPrice ?? '0'),
        },
        error: false,
      }
    }
    return {
      data: undefined,
      error: true,
    }
  } catch (e) {
    console.error(e)
    return {
      data: undefined,
      error: true,
    }
  }
}

/**
 * returns eth prices at current, 24h, 48h, and 1k intervals
 */
export function useBnbPrices(): BnbPrices | undefined {
  const [prices, setPrices] = useState<BnbPrices | undefined>()
  const [error, setError] = useState(false)

  const [t24, t48, tWeek] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])

  const formattedBlocks = useMemo(() => {
    if (blocks) {
      return blocks.map((b) => parseFloat(b.number))
    }
    return undefined
  }, [blocks])

  useEffect(() => {
    async function fetch() {
      const { data, error: fetchError } = await fetchBnbPrices(formattedBlocks as [number, number, number])
      if (fetchError || blockError) {
        setError(true)
      } else if (data) {
        setPrices(data)
      }
    }
    if (!prices && !error && formattedBlocks) {
      fetch()
    }
  }, [error, prices, formattedBlocks, blockError])

  return prices
}
