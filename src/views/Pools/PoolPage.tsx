/* eslint-disable no-nested-ternary */
import React, { useMemo, useState, useEffect } from 'react'
import { RouteComponentProps, Link } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  Text,
  Flex,
  Box,
  Button,
  Card,
  Breadcrumbs,
  Heading,
  Spinner,
  LinkExternal,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import styled from 'styled-components'
import Page from 'components/layout/Page'
import { getBscscanLink } from 'utils'
import { RowBetween } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import SaveIcon from 'components/SaveIcon'
import { usePoolDatas, usePoolChartData, usePoolTransactions } from 'state/pools/hooks'
import LineChart from 'components/LineChart'
import { unixToDate } from 'utils/date'
// import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import TransactionTable from 'components/TransactionsTable'
import { useSavedPools } from 'state/user/hooks'
import { TabToggleGroup, TabToggle } from 'components/TabToggle'
import useTheme from 'hooks/useTheme'
import { TOTAL_FEE } from 'config'
import { useTranslation } from 'contexts/Localization'

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 1em;
  margin-top: 16px;
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const TokenButton = styled(Flex)`
  padding: 8px 0px;
  margin-right: 16px;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const LockedTokensContainer = styled(Flex)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  border-radius: 16px;
  max-width: 280px;
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
  DENSITY,
}

export default function PoolPage({
  match: {
    params: { address: routeAddress },
  },
}: RouteComponentProps<{ address: string }>) {
  const { theme } = useTheme()
  const { isXs, isSm } = useMatchBreakpoints()
  const { t } = useTranslation()

  // In case somebody pastes checksummed address into url (since GraphQL expects lowercase address)
  const address = routeAddress.toLowerCase()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentDate = dayjs.utc().format('MMM D, YYYY')

  // token data
  const poolData = usePoolDatas([address])[0]
  const chartData = usePoolChartData(address)
  const transactions = usePoolTransactions(address)

  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
        }
      })
    }
    return []
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    }
    return []
  }, [chartData])

  // watchlist
  const [savedPools, addSavedPool] = useSavedPools()

  return (
    <Page symbol={poolData ? `${poolData?.token0.symbol} / ${poolData?.token1.symbol}` : null}>
      {poolData ? (
        <>
          <Flex justifyContent="space-between" mb="16px" flexDirection={['column', 'column', 'row']}>
            <Breadcrumbs mb="32px">
              <Link to="/">
                <Text color="primary">{t('Home')}</Text>
              </Link>
              <Link to="/pools">
                <Text color="primary">{t('Pools')}</Text>
              </Link>
              <Flex>
                <Text mr="8px">{`${poolData.token0.symbol} / ${poolData.token1.symbol}`}</Text>
              </Flex>
            </Breadcrumbs>
            <Flex justifyContent={[null, null, 'flex-end']} mt={['8px', '8px', 0]}>
              <LinkExternal mr="8px" href={getBscscanLink(address, 'address')}>
                {t('View on BscScan')}
              </LinkExternal>
              <SaveIcon fill={savedPools.includes(address)} onClick={() => addSavedPool(address)} />
            </Flex>
          </Flex>
          <Flex flexDirection="column">
            <Flex alignItems="center" mb={['8px', null]}>
              <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} size={32} />
              <Text
                ml="38px"
                fontSize={isXs || isSm ? '24px' : '40px'}
              >{`${poolData.token0.symbol} / ${poolData.token1.symbol}`}</Text>
            </Flex>
            <Flex justifyContent="space-between" flexDirection={['column', 'column', 'column', 'row']}>
              <Flex flexDirection={['column', 'column', 'row']} mb={['8px', '8px', null]}>
                <Link to={`/token/${poolData.token0.address}`}>
                  <TokenButton>
                    <CurrencyLogo address={poolData.token0.address} size="24px" />
                    <Text fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                      {`1 ${poolData.token0.symbol} =  ${formatAmount(poolData.token1Price, 2, 'standard')} ${
                        poolData.token1.symbol
                      }`}
                    </Text>
                  </TokenButton>
                </Link>
                <Link to={`/token/${poolData.token1.address}`}>
                  <TokenButton ml={[null, null, '10px']}>
                    <CurrencyLogo address={poolData.token1.address} size="24px" />
                    <Text fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                      {`1 ${poolData.token1.symbol} =  ${formatAmount(poolData.token0Price, 2, 'standard')} ${
                        poolData.token0.symbol
                      }`}
                    </Text>
                  </TokenButton>
                </Link>
              </Flex>
              <Flex>
                <a
                  href={`https://exchange.pancakeswap.finance/#/add/${poolData.token0.address}/${poolData.token1.address}`}
                >
                  <Button mr="8px" variant="secondary">
                    {t('Add Liquidity')}
                  </Button>
                </a>
                <a
                  href={`https://exchange.pancakeswap.finance/#/swap?inputCurrency=${poolData.token0.address}&outputCurrency=${poolData.token1.address}`}
                >
                  <Button>{t('Trade')}</Button>
                </a>
              </Flex>
            </Flex>
          </Flex>
          <ContentLayout>
            <Card p="16px">
              <Text color="secondary" bold>
                {t('Total Tokens Locked')}
              </Text>
              <LockedTokensContainer>
                <RowBetween>
                  <Flex>
                    <CurrencyLogo address={poolData.token0.address} size="24px" />
                    <Text small color="textSubtle" ml="8px">
                      {poolData.token0.symbol}
                    </Text>
                  </Flex>

                  <Text small>{formatAmount(poolData.tvlToken0)}</Text>
                </RowBetween>
                <RowBetween>
                  <Flex>
                    <CurrencyLogo address={poolData.token1.address} size="24px" />
                    <Text small color="textSubtle" ml="8px">
                      {poolData.token1.symbol}
                    </Text>
                  </Flex>

                  <Text small>{formatAmount(poolData.tvlToken1)}</Text>
                </RowBetween>
              </LockedTokensContainer>

              <Text color="secondary" bold mt="24px" textTransform="uppercase">
                {t('Liquidity')}
              </Text>
              <Text fontSize="24px" bold>
                {formatDollarAmount(poolData.tvlUSD)}
              </Text>
              <Percent value={poolData.tvlUSDChange} />

              <Text color="secondary" bold mt="24px" textTransform="uppercase">
                {t('Volume 24H')}
              </Text>
              <Text fontSize="24px" bold>
                {formatDollarAmount(poolData.volumeUSD)}
              </Text>
              <Percent value={Number.isNaN(poolData.volumeUSDChange) ? 0 : poolData.volumeUSDChange} />

              <Text color="secondary" bold mt="24px" textTransform="uppercase">
                {t('Fees 24H')}
              </Text>
              <Text fontSize="24px" bold>
                {formatDollarAmount(poolData.volumeUSD * TOTAL_FEE)}
              </Text>
            </Card>
            <Card>
              <TabToggleGroup>
                <TabToggle isActive={view === ChartView.VOL} onClick={() => setView(ChartView.VOL)}>
                  <Text>{t('Volume')}</Text>
                </TabToggle>
                <TabToggle isActive={view === ChartView.TVL} onClick={() => setView(ChartView.TVL)}>
                  <Text>{t('Liquidity')}</Text>
                </TabToggle>
              </TabToggleGroup>
              <Flex flexDirection="column" px="24px" pt="24px">
                <Text fontSize="24px" bold>
                  {latestValue
                    ? formatDollarAmount(latestValue)
                    : view === ChartView.VOL
                    ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                    : view === ChartView.DENSITY
                    ? ''
                    : formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)}{' '}
                </Text>

                <Text small>{valueLabel || currentDate}</Text>
              </Flex>

              <Box px="24px">
                {view === ChartView.TVL ? (
                  <LineChart
                    data={formattedTvlData}
                    setLabel={setValueLabel}
                    color={theme.colors.primary}
                    height="335px"
                    chartHeight="335px"
                    setValue={setLatestValue}
                    value={latestValue}
                    label={valueLabel}
                  />
                ) : (
                  <BarChart
                    data={formattedVolumeData}
                    color={theme.colors.primary}
                    height="335px"
                    chartHeight="335px"
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                    value={latestValue}
                    label={valueLabel}
                  />
                )}
              </Box>
            </Card>
          </ContentLayout>
          <Heading mb="16px" mt="40px" scale="lg">
            {t('Transactions')}
          </Heading>
          <TransactionTable transactions={transactions} />
        </>
      ) : (
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      )}
    </Page>
  )
}
