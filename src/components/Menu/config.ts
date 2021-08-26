import { MenuEntry } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

const config: (t: ContextApi['t']) => MenuEntry[] = (t) => [
  {
    label: t('Home'),
    icon: 'HomeIcon',
    href: '/',
  },
  {
    label: t('Trade'),
    icon: 'TradeIcon',
    items: [
      {
        label: t('Exchange'),
        href: '/swap',
      },
      {
        label: t('Liquidity'),
        href: '/pool',
      },
    ],
  },
  {
    label: t('Farms'),
    icon: 'FarmIcon',
    href: '/farms',
  },
 {
    label: t('Pools'),
    icon: 'PoolIcon',
    href: '/pools',
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
    label: t('More'),
    icon: 'MoreIcon',
    items: [
      {
        label: t('Shibcake'),
        href: 'https://shibcake.com',
      },
      {
        label: t('Docs'),
        href: 'https://docs.shibcakeswap.com',
      },
      {
        label: t('Blog'),
        href: 'https://shibcakeswap.medium.com',
      },
    ],
  },
]

export default config
