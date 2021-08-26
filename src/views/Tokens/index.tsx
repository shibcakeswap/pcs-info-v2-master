import React, { useMemo, useEffect } from 'react'
import { Text, Heading, Card } from '@pancakeswap/uikit'
import Page from 'components/layout/Page'
import TokenTable from 'components/tokens/TokenTable'
import { useAllTokenData, useTokenDatas } from 'state/tokens/hooks'
import { notEmpty } from 'utils'
import { useSavedTokens } from 'state/user/hooks'
import { useTranslation } from 'contexts/Localization'
import TopTokenMovers from 'components/tokens/TopTokenMovers'
// import TopTokenMovers from 'components/tokens/TopTokenMovers'

export default function TokensOverview() {
  const { t } = useTranslation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((token) => token.data)
      .filter(notEmpty)
  }, [allTokens])

  const [savedTokens] = useSavedTokens()
  const watchListTokens = useTokenDatas(savedTokens)

  return (
    <Page>
      <Heading scale="lg" mb="16px">
        {t('Your Watchlist')}
      </Heading>
      {savedTokens.length > 0 ? (
        <TokenTable tokenDatas={watchListTokens} />
      ) : (
        <Card px="24px" py="16px">
          <Text>{t('Saved tokens will appear here')}</Text>
        </Card>
      )}
      {/* <HideSmall>
          <DarkGreyCard style={{ paddingTop: '12px' }}>
            <AutoColumn gap="md">
              <Text fontSize="16px">Top Movers</Text>
              <TopTokenMovers />
            </AutoColumn>
          </DarkGreyCard>
        </HideSmall> */}
      <TopTokenMovers />
      <Heading scale="lg" mt="40px" mb="16px">
        {t('All Tokens')}
      </Heading>
      <TokenTable tokenDatas={formattedTokens} />
    </Page>
  )
}
