import React, { useEffect, useMemo } from 'react'
import { Text, Heading, Card } from '@pancakeswap/uikit'
import Page from 'components/layout/Page'
import PoolTable from 'components/pools/PoolTable'
import { useAllPoolData, usePoolDatas } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import { useSavedPools } from 'state/user/hooks'
import { useTranslation } from 'contexts/Localization'
// import TopPoolMovers from 'components/pools/TopPoolMovers'

export default function PoolPage() {
  const { t } = useTranslation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

  const [savedPools] = useSavedPools()
  const watchlistPools = usePoolDatas(savedPools)

  return (
    <Page>
      <Heading scale="lg" mb="16px">
        {t('Your Watchlist')}
      </Heading>
      <Card>
        {watchlistPools.length > 0 ? (
          <PoolTable poolDatas={watchlistPools} />
        ) : (
          <Text px="24px" py="16px">
            {t('Saved pools will appear here')}
          </Text>
        )}
      </Card>
      {/* <HideSmall>
          <DarkGreyCard style={{ paddingTop: '12px' }}>
            <AutoColumn gap="md">
              <TYPE.mediumHeader fontSize="16px">Trending by 24H Volume</TYPE.mediumHeader>
              <TopPoolMovers />
            </AutoColumn>
          </DarkGreyCard>
        </HideSmall> */}
      <Heading scale="lg" mt="40px" mb="16px">
        {t('All Pools')}
      </Heading>
      <PoolTable poolDatas={poolDatas} />
    </Page>
  )
}
