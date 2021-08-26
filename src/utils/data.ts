export const get24hChange = (valueNow: string, value24HoursAgo: string): [number, number] => {
  const dayDifference = parseFloat(valueNow) - parseFloat(value24HoursAgo)
  const currentChange = (parseFloat(valueNow) * 100) / parseFloat(value24HoursAgo) - 100
  return [dayDifference, currentChange]
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow: string | undefined, value24HoursAgo: string | undefined): number => {
  if (valueNow && value24HoursAgo) {
    return ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
  }
  return 0
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChangeForNumbers = (
  valueNow: number | undefined,
  value24HoursAgo: number | undefined,
): number => {
  if (valueNow && value24HoursAgo) {
    return ((valueNow - value24HoursAgo) / value24HoursAgo) * 100
  }
  return 0
}
