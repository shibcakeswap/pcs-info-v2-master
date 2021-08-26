import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'ShibcakeSwap Info & Analytics',
  description: 'View statistics for Shibcakeswap exchanges.',
  image: 'https://shibcakeswap.finance',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  switch (path) {
    case '/':
      return {
        title: `${t('Overview')} | ${t('ShibcakeSwap Info & Analytics')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('ShibcakeSwap Info & Analytics')}`,
      }
    case '/tokens':
      return {
        title: `${t('Tokens')} | ${t('ShibcakeSwap Info & Analytics')}`,
      }
    default:
      return null
  }
}
