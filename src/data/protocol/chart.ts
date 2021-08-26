/* eslint-disable no-await-in-loop */
import { ChartDayData } from 'types'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { client } from 'config/apolloClient'

dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

/**
 * Data for displaying TVL and Volume charts on Home page
 */
const GLOBAL_CHART = gql`
  query pancakeDayDatas($startTime: Int!, $skip: Int!) {
    pancakeDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

interface ChartResults {
  pancakeDayDatas: {
    date: number
    dailyVolumeUSD: string
    totalLiquidityUSD: string
  }[]
}

async function fetchChartData() {
  let data: {
    date: number
    volumeUSD: string
    tvlUSD: string
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  let requestFailed = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const {
        data: chartResData,
        error,
        loading,
      } = await client.query<ChartResults>({
        query: GLOBAL_CHART,
        variables: {
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (!loading) {
        skip += 1000
        if (chartResData.pancakeDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          const formatted = chartResData.pancakeDayDatas.map((entry) => ({
            date: entry.date,
            volumeUSD: entry.dailyVolumeUSD,
            tvlUSD: entry.totalLiquidityUSD,
          }))
          data = data.concat(formatted)
        }
      }
    }
  } catch {
    requestFailed = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: ChartDayData }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      // eslint-disable-next-line no-param-reassign
      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: parseFloat(dayData.volumeUSD),
        tvlUSD: parseFloat(dayData.tvlUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.tvlUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          volumeUSD: 0,
          tvlUSD: latestTvl,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].tvlUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => {
      return formattedExisting[parseInt(key)]
    })

    return {
      data: dateMap,
      error: false,
    }
  }
  return {
    data: undefined,
    error: requestFailed,
  }
}

/**
 * Fetch historic chart data
 */
const useFetchGlobalChartData = (): {
  error: boolean
  data: ChartDayData[] | undefined
} => {
  const [data, setData] = useState<ChartDayData[] | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data: fetchData, error: fetchError } = await fetchChartData()
      if (fetchData && !fetchError) {
        setData(fetchData)
      } else if (fetchError) {
        setError(true)
      }
    }
    if (!data && !error) {
      fetch()
    }
  }, [data, error])

  return {
    error,
    data,
  }
}

export default useFetchGlobalChartData
