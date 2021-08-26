import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Text, Flex, Box, Skeleton, ArrowBackIcon, ArrowForwardIcon } from '@pancakeswap/uikit'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'
import { formatDollarAmount } from 'utils/numbers'
import { PoolData } from 'state/pools/types'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { PageButtons, Arrow, Break } from 'components/shared'
import { useTranslation } from 'contexts/Localization'

const Wrapper = styled.div`
  width: 100%;
`

/**
 *  Columns on different layouts
 *  5 = | # | Pool | TVL | Volume 24H | Volume 7D |
 *  4 = | # | Pool |     | Volume 24H | Volume 7D |
 *  3 = | # | Pool |     | Volume 24H |           |
 *  2 = |   | Pool |     | Volume 24H |           |
 */
const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: 20px 3.5fr repeat(3, 1fr);

  padding: 0 24px;
  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(2, 1fr);
    & :nth-child(3) {
      display: none;
    }
  }
  @media screen and (max-width: 500px) {
    grid-template-columns: 20px 1.5fr repeat(1, 1fr);
    & :nth-child(5) {
      display: none;
    }
  }
  @media screen and (max-width: 480px) {
    grid-template-columns: 2.5fr repeat(1, 1fr);
    > *:nth-child(1) {
      display: none;
    }
  }
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const SORT_FIELD = {
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  volumeUSDWeek: 'volumeUSDWeek',
}

const TableLoader: React.FC = () => {
  const loadingRow = (
    <ResponsiveGrid>
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </ResponsiveGrid>
  )
  return (
    <>
      {loadingRow}
      {loadingRow}
      {loadingRow}
    </>
  )
}

const DataRow = ({ poolData, index }: { poolData: PoolData; index: number }) => {
  return (
    <LinkWrapper to={`/pool/${poolData.address}`}>
      <ResponsiveGrid>
        <Text>{index + 1}</Text>
        <Text>
          <RowFixed>
            <Flex>
              <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} />
              <Text ml="8px">
                {poolData.token0.symbol}/{poolData.token1.symbol}
              </Text>
            </Flex>
          </RowFixed>
        </Text>
        <Text>{formatDollarAmount(poolData.tvlUSD)}</Text>
        <Text>{formatDollarAmount(poolData.volumeUSD)}</Text>
        <Text>{formatDollarAmount(poolData.volumeUSDWeek)}</Text>
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

const MAX_ITEMS = 10

interface PoolTableProps {
  poolDatas: PoolData[]
  maxItems?: number
}

const PoolTable: React.FC<PoolTableProps> = ({ poolDatas, maxItems = MAX_ITEMS }) => {
  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)
  const { t } = useTranslation()

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  useEffect(() => {
    let extraPages = 1
    if (poolDatas.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(poolDatas.length / maxItems) + extraPages)
  }, [maxItems, poolDatas])

  const sortedPools = useMemo(() => {
    return poolDatas
      ? poolDatas
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof PoolData] > b[sortField as keyof PoolData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            }
            return -1
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [maxItems, page, poolDatas, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField],
  )

  const arrow = useCallback(
    (field: string) => {
      const directionArrow = !sortDirection ? '↑' : '↓'
      return sortField === field ? directionArrow : ''
    },
    [sortDirection, sortField],
  )

  return (
    <Wrapper>
      <AutoColumn gap="16px">
        <ResponsiveGrid>
          <Text color="secondary" bold>
            #
          </Text>
          <Text color="secondary" bold textTransform="uppercase">
            {t('Pool')}
          </Text>
          <Text color="secondary" bold onClick={() => handleSort(SORT_FIELD.tvlUSD)} textTransform="uppercase">
            {t('Liquidity')} {arrow(SORT_FIELD.tvlUSD)}
          </Text>
          <Text color="secondary" bold onClick={() => handleSort(SORT_FIELD.volumeUSD)} textTransform="uppercase">
            {t('Volume 24H')} {arrow(SORT_FIELD.volumeUSD)}
          </Text>
          <Text color="secondary" bold onClick={() => handleSort(SORT_FIELD.volumeUSDWeek)} textTransform="uppercase">
            {t('Volume 7D')} {arrow(SORT_FIELD.volumeUSDWeek)}
          </Text>
        </ResponsiveGrid>
        <Break />
        {sortedPools.length > 0 ? (
          <>
            {sortedPools.map((poolData, i) => {
              if (poolData) {
                return (
                  <React.Fragment key={poolData.address}>
                    <DataRow index={(page - 1) * MAX_ITEMS + i} poolData={poolData} />
                    <Break />
                  </React.Fragment>
                )
              }
              return null
            })}
            <PageButtons>
              <Arrow
                onClick={() => {
                  setPage(page === 1 ? page : page - 1)
                }}
              >
                <ArrowBackIcon color={page === 1 ? 'textDisabled' : 'primary'} />
              </Arrow>

              <Text>{t('Page %page% of %maxPage%', { page, maxPage })}</Text>

              <Arrow
                onClick={() => {
                  setPage(page === maxPage ? page : page + 1)
                }}
              >
                <ArrowForwardIcon color={page === maxPage ? 'textDisabled' : 'primary'} />
              </Arrow>
            </PageButtons>
          </>
        ) : (
          <>
            <TableLoader />
            {/* spacer */}
            <Box />
          </>
        )}
      </AutoColumn>
    </Wrapper>
  )
}

export default PoolTable
