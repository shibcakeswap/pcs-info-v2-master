import React, { useMemo, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Text, Flex, Box, Card } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useAllTokenData } from 'state/tokens/hooks'
import { TokenData } from 'state/tokens/types'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'

const CardWrapper = styled(Link)`
  min-width: 190px;
  margin-right: 16px;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const TopMoverCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

export const ScrollableRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
  padding: 16px 0;
  white-space: nowrap;
  ::-webkit-scrollbar {
    display: none;
  }
`

const DataCard = ({ tokenData }: { tokenData: TokenData }) => {
  return (
    <CardWrapper to={`token/${tokenData.address}`}>
      <TopMoverCard padding="16px">
        <Flex>
          <CurrencyLogo address={tokenData.address} size="32px" />
          <Box ml="16px">
            <Text>{tokenData.symbol}</Text>
            <Flex alignItems="center">
              <Text fontSize="14px" mr="6px" lineHeight="16px">
                {formatDollarAmount(tokenData.priceUSD)}
              </Text>
              <Percent fontSize="14px" value={tokenData.priceUSDChange} />
            </Flex>
          </Box>
        </Flex>
      </TopMoverCard>
    </CardWrapper>
  )
}

export default function TopTokenMovers() {
  const allTokens = useAllTokenData()

  const topPriceIncrease = useMemo(() => {
    return Object.values(allTokens)
      .sort(({ data: a }, { data: b }) => {
        // eslint-disable-next-line no-nested-ternary
        return a && b ? (Math.abs(a?.priceUSDChange) > Math.abs(b?.priceUSDChange) ? -1 : 1) : -1
      })
      .slice(0, Math.min(20, Object.values(allTokens).length))
  }, [allTokens])

  const increaseRef = useRef<HTMLDivElement>(null)
  const [increaseSet, setIncreaseSet] = useState(false)
  // const [pauseAnimation, setPauseAnimation] = useState(false)
  // const [resetInterval, setClearInterval] = useState<() => void | undefined>()

  useEffect(() => {
    if (!increaseSet && increaseRef && increaseRef.current) {
      setInterval(() => {
        if (increaseRef.current && increaseRef.current.scrollLeft !== increaseRef.current.scrollWidth) {
          increaseRef.current.scrollTo(increaseRef.current.scrollLeft + 1, 0)
        }
      }, 30)
      setIncreaseSet(true)
    }
  }, [increaseRef, increaseSet])

  if (topPriceIncrease.length === 0 || !topPriceIncrease.some((entry) => entry.data)) {
    return null
  }

  return (
    <Card py="16px" my="16px">
      <ScrollableRow ref={increaseRef}>
        {topPriceIncrease.map((entry) =>
          entry.data ? <DataCard key={`top-card-token-${entry.data?.address}`} tokenData={entry.data} /> : null,
        )}
      </ScrollableRow>
    </Card>
  )
}
