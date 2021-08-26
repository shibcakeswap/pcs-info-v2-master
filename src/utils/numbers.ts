export const formatDollarAmount = (num: number | undefined, digits = 2, notation = 'compact') => {
  if (num === 0) return '$0.00'
  if (!num) return '-'

  let smallValue = false
  if (num < 1) {
    smallValue = true
  }

  const nf = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: smallValue ? 9 : digits,
    notation,
  })
  return nf.format(parseFloat(num.toFixed(smallValue ? 9 : digits)))
}

export const formatAmount = (num: number | undefined, digits = 2, notation = 'compact') => {
  if (num === 0) return '0'
  if (!num) return '-'
  if (num < 0.001) {
    return '<0.001'
  }
  const nf = new Intl.NumberFormat('en', { notation })
  return nf.format(parseFloat(num.toFixed(num > 1000 ? 0 : digits)))
}
