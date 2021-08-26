import React, { useState } from 'react'
import { HelpIcon } from '@pancakeswap/uikit'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export interface LogoProps {
  style: React.CSSProperties
  alt: string
  srcs: string[]
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, ...rest }: LogoProps) {
  const [, refresh] = useState<number>(0)

  const logoSrc: string | undefined = srcs.find((src) => !BAD_SRCS[src])

  if (logoSrc) {
    return (
      <img
        {...rest}
        alt={alt}
        src={logoSrc}
        onError={() => {
          if (logoSrc) BAD_SRCS[logoSrc] = true
          refresh((i) => i + 1)
        }}
      />
    )
  }

  return <HelpIcon {...rest} />
}
