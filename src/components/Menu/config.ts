import { MenuEntry } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

const config: (t: ContextApi['t']) => MenuEntry[] = (t) => [
  {
    label: t('Home'),
    icon: 'HomeIcon',
    href: 'https://pancakeswap.finance',
  },
  {
    label: t('Trade'),
    icon: 'TradeIcon',
    items: [
      {
        label: t('Exchange'),
        href: 'https://exchange.pancakeswap.finance/#/swap',
      },
      {
        label: t('Liquidity'),
        href: 'https://exchange.pancakeswap.finance/#/pool',
      },
      {
        label: t('LP Migration'),
        href: 'https://v1exchange.pancakeswap.finance/#/migrate',
      },
      {
        label: t('V1 Liquidity (Old)'),
        href: 'https://v1exchange.pancakeswap.finance/#/pool',
      },
    ],
  },
  {
    label: t('Farms'),
    icon: 'FarmIcon',
    href: 'https://pancakeswap.finance/farms',
  },
  {
    label: t('Pools'),
    icon: 'PoolIcon',
    href: 'https://pancakeswap.finance/pools',
  },
  {
    label: t('Prediction (BETA)'),
    icon: 'PredictionsIcon',
    href: 'https://pancakeswap.finance/prediction',
  },
  {
    label: t('Lottery'),
    icon: 'TicketIcon',
    href: 'https://pancakeswap.finance/lottery',
  },
  {
    label: t('Collectibles'),
    icon: 'NftIcon',
    href: 'https://pancakeswap.finance/collectibles',
  },
  {
    label: t('Team Battle'),
    icon: 'TeamBattleIcon',
    href: 'https://pancakeswap.finance/competition',
  },
  {
    label: t('Teams & Profile'),
    icon: 'GroupsIcon',
    items: [
      {
        label: t('Leaderboard'),
        href: 'https://pancakeswap.finance/teams',
      },
      {
        label: t('Task Center'),
        href: 'https://pancakeswap.finance/profile/tasks',
      },
      {
        label: t('Your Profile'),
        href: 'https://pancakeswap.finance/profile',
      },
    ],
  },
  {
    label: t('Info'),
    icon: 'InfoIcon',
    href: '/',
    status: {
      text: 'NEW',
      color: 'success',
    },
  },
  {
    label: t('IFO'),
    icon: 'IfoIcon',
    href: 'https://pancakeswap.finance/ifo',
  },
  {
    label: t('More'),
    icon: 'MoreIcon',
    items: [
      {
        label: t('Contact'),
        href: 'https://docs.pancakeswap.finance/contact-us',
      },
      {
        label: t('Voting'),
        href: 'https://voting.pancakeswap.finance',
      },
      {
        label: t('Github'),
        href: 'https://github.com/pancakeswap',
      },
      {
        label: t('Docs'),
        href: 'https://docs.pancakeswap.finance',
      },
      {
        label: t('Blog'),
        href: 'https://pancakeswap.medium.com',
      },
      {
        label: t('Merch'),
        href: 'https://pancakeswap.creator-spring.com/',
      },
    ],
  },
]

export default config
