import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Logo from 'components/Logo'

export const getTokenLogoURL = (address: string) =>
  `https://assets.trustwalletapp.com/blockchains/smartchain/assets/${address}/logo.png`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`

const CurrencyLogo: React.FC<{
  address?: string
  size?: string
  style?: React.CSSProperties
}> = ({ address, size = '24px', style, ...rest }) => {
  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)

    if (checkSummed) {
      return [getTokenLogoURL(checkSummed)]
    }
    return []
  }, [address])

  return <StyledLogo size={size} srcs={srcs} alt="token logo" style={style} {...rest} />
}

export default CurrencyLogo
