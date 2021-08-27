import React, { useState, useMemo, useEffect } from 'react'
import { Text, Heading, Card } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useTranslation } from 'contexts/Localization'
import Page from 'components/layout/Page'
import LineChart from 'components/LineChart'
import { ResponsiveRow } from 'components/Row'
import TokenTable from 'components/tokens/TokenTable'
import PoolTable from 'components/pools/PoolTable'
import { useProtocolChartData, useProtocolData, useProtocolTransactions } from 'state/protocol/hooks'
import { notEmpty } from 'utils'
import { unixToDate } from 'utils/date'
import { formatDollarAmount } from 'utils/numbers'
import useTheme from 'hooks/useTheme'
import { useAllTokenData } from 'state/tokens/hooks'
import BarChart from 'components/BarChart'
import { useAllPoolData } from 'state/pools/hooks'
import TransactionTable from 'components/TransactionsTable'

const Home: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [liquidityDateHover, setLiquidityDateHover] = useState<string | undefined>()
  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [volumeDateHover, setVolumeDateHover] = useState<string | undefined>()

  const [protocolData] = useProtocolData()
  const [chartData] = useProtocolChartData()
  const [transactions] = useProtocolTransactions()

  const currentDate = dayjs.utc().format('MMM D, YYYY')

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (volumeHover == null && protocolData) {
      setVolumeHover(protocolData.volumeUSD)
    }
  }, [protocolData, volumeHover])
  useEffect(() => {
    if (liquidityHover == null && protocolData) {
      setLiquidityHover(protocolData.tvlUSD)
    }
  }, [liquidityHover, protocolData])

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.tvlUSD,
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

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((token) => token.data)
      .filter(notEmpty)
  }, [allTokens])

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((pool) => pool.data)
      .filter(notEmpty)
  }, [allPoolData])

  return (
    <Page>
      <Heading scale="lg" mb="16px">
        {t('ShibcakeSwap Info & Analytics')}
      </Heading>
      <ResponsiveRow>
        <Card p={['16px', '16px', '24px']}>
          <LineChart
            data={formattedTvlData}
            color={theme.colors.secondary}
            setValue={setLiquidityHover}
            setLabel={setLiquidityDateHover}
            topLeft={
              <div>
                <Text bold color="secondary">
                  {t('Liquidity')}
                </Text>
                <Text bold fontSize="24px">
                  {formatDollarAmount(liquidityHover, 2)}
                </Text>
                <Text>{liquidityDateHover ?? currentDate}</Text>
              </div>
            }
          />
        </Card>
        <Card p={['16px', '16px', '24px']}>
          <BarChart
            data={formattedVolumeData}
            color={theme.colors.primary}
            setValue={setVolumeHover}
            setLabel={setVolumeDateHover}
            topLeft={
              <div>
                <Text bold color="secondary">
                  {t('Volume 24H')}
                </Text>
                <Text bold fontSize="24px">
                  {formatDollarAmount(volumeHover, 2)}
                </Text>
                <Text>{volumeDateHover ?? currentDate}</Text>
              </div>
            }
          />
        </Card>
      </ResponsiveRow>
      <Heading scale="lg" mt="40px" mb="16px">
        {t('Top Tokens')}
      </Heading>
      <TokenTable tokenDatas={formattedTokens} />
      <Heading scale="lg" mt="40px" mb="16px">
        {t('Top Pools')}
      </Heading>
      <PoolTable poolDatas={poolDatas} />
      <Heading scale="lg" mt="40px" mb="16px">
        {t('Transactions')}
      </Heading>
      <TransactionTable transactions={transactions} />
    </Page>
  )
}

export default Home
