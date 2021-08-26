import React, { useEffect, Dispatch, SetStateAction, ReactNode } from 'react'
import { Box, Flex, Spinner } from '@pancakeswap/uikit'
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import styled from 'styled-components'
import { RowBetween } from 'components/Row'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useTheme from 'hooks/useTheme'
import { formatDollarAmount } from 'utils/numbers'

dayjs.extend(utc)

const DEFAULT_HEIGHT = '308px'
const DEFAULT_CHART_HEIGHT = '246px'

const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export type LineChartProps = {
  data: any[]
  color?: string
  height?: string
  chartHeight?: string
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  )
}

const HoverUpdater = ({ parsedValue, label, payload, setValue, setLabel }) => {
  useEffect(() => {
    if (setValue && parsedValue !== payload.value) {
      setValue(payload.value)
    }
    const formattedTime = dayjs(payload.time).format('MMM D, YYYY')
    if (setLabel && label !== formattedTime) setLabel(formattedTime)
  }, [parsedValue, label, payload.value, payload.time, setValue, setLabel])

  return null
}

const Chart = ({
  data,
  color = '#56B2A4',
  setValue,
  setLabel,
  value,
  label,
  height = DEFAULT_HEIGHT,
  chartHeight = DEFAULT_CHART_HEIGHT,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: LineChartProps) => {
  const { theme } = useTheme()
  const parsedValue = value

  return (
    <Wrapper height={height}>
      {!data || data.length === 0 ? (
        <Flex height="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      ) : (
        <Box height={chartHeight}>
          {(topLeft || topRight) && (
            <RowBetween>
              {topLeft ?? null}
              {topRight ?? null}
            </RowBetween>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 15,
                left: 0,
                bottom: 5,
              }}
              onMouseLeave={() => {
                if (setLabel) setLabel(undefined)
                if (setValue) setValue(undefined)
              }}
            >
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={(time) => dayjs(time).format('DD')}
                minTickGap={10}
              />
              <YAxis
                dataKey="value"
                tickCount={6}
                scale="linear"
                axisLine={false}
                tickLine={false}
                color={theme.colors.textSubtle}
                fontSize="12px"
                tickFormatter={(val) => formatDollarAmount(val)}
                orientation="right"
                tick={{ dx: 10, fill: theme.colors.textSubtle }}
              />
              <Tooltip
                cursor={{ fill: theme.colors.backgroundDisabled }}
                contentStyle={{ display: 'none' }}
                formatter={(tooltipValue, name, props) => (
                  <HoverUpdater
                    parsedValue={parsedValue}
                    label={label}
                    payload={props.payload}
                    setValue={setValue}
                    setLabel={setLabel}
                  />
                )}
              />
              <Bar
                dataKey="value"
                fill={color}
                shape={(props) => {
                  return <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          {(bottomLeft || bottomRight) && (
            <RowBetween>
              {bottomLeft ?? null}
              {bottomRight ?? null}
            </RowBetween>
          )}
        </Box>
      )}
    </Wrapper>
  )
}

export default Chart
