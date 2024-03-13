/*
 * LightningChartJS example that showcases different directions of progressivity and using custom axes.
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Import xydata
const xydata = require('@arction/xydata')

// Extract required parts from LightningChartJS.
const { lightningChart, AxisScrollStrategies, Themes } = lcjs

// Import data-generator from 'xydata'-library.
const { createProgressiveFunctionGenerator } = xydata

const viewRange = Math.PI * 2 * 10

// Create Dashboard.
// NOTE: Using `Dashboard` is no longer recommended for new applications. Find latest recommendations here: https://lightningchart.com/js-charts/docs/basic-topics/grouping-charts/
const grid = lightningChart().Dashboard({
    theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    numberOfRows: 1,
    numberOfColumns: 2,
})

// Create two XY-charts.
const chart1 = grid.createChartXY({
    columnIndex: 0,
    rowIndex: 0,
    columnSpan: 1,
    rowSpan: 1,
})
const chart2 = grid.createChartXY({
    columnIndex: 1,
    rowIndex: 0,
    columnSpan: 1,
    rowSpan: 1,
})

// Create progressive series with different directions and configure Y-axes suitably.
// First, a vertically regressive series.
chart1.setTitle('Vertical regressive')
chart1.getDefaultAxisY().setInterval({ start: viewRange, end: 0, stopAxisAfter: false }).setScrollStrategy(AxisScrollStrategies.regressive)
const series1 = chart1
    .addLineSeries({
        dataPattern: {
            // pattern: 'RegressiveY' => Each consecutive data point has decreased Y coordinate.
            pattern: 'RegressiveY',
            // regularProgressiveStep: true => The Y step between each consecutive data point is regular (for example, always `1.0`).
            regularProgressiveStep: true,
        },
    })
    // Destroy automatically outscrolled data (old data becoming out of scrolling axis range).
    // Actual data cleaning can happen at any convenient time (not necessarily immediately when data goes out of range).
    .setDataCleaning({ minDataPointCount: 10000 })
    // Point to nearest Y data point with auto cursor.
    .setCursorSolveBasis('nearest-y')

// Second, a vertically progressive series with custom axis.
chart2.setTitle('Vertical progressive')
// Add new axis to 'right' side of chart.
const customAxisY = chart2
    .addAxisY(true)
    .setDefaultInterval((state) => ({ end: state.dataMax, start: (state.dataMax ?? 0) - viewRange, stopAxisAfter: false }))
    .setScrollStrategy(AxisScrollStrategies.progressive)

const series2 = chart2
    .addLineSeries({
        yAxis: customAxisY,
        dataPattern: {
            // pattern: 'ProgressiveY' => Each consecutive data point has increased Y coordinate.
            pattern: 'ProgressiveY',
            // regularProgressiveStep: true => The Y step between each consecutive data point is regular (for example, always `1.0`).
            regularProgressiveStep: true,
        },
    })
    // Destroy automatically outscrolled data (old data becoming out of scrolling axis range).
    // Actual data cleaning can happen at any convenient time (not necessarily immediately when data goes out of range).
    .setDataCleaning({ minDataPointCount: 10000 })
    // Point to nearest Y data point with auto cursor.
    .setCursorSolveBasis('nearest-y')

// Dispose unused default Y-axis.
chart2.getDefaultAxisY().dispose()

// Lastly, setup data-generation for both series.
createProgressiveFunctionGenerator()
    .setSamplingFunction(Math.sin)
    .setEnd(Math.PI * 2)
    .setStep(0.015)
    .generate()
    // 1 second / 20 milliseconds * 20 points per batch = 1000 points / sec
    .setStreamBatchSize(20)
    .setStreamInterval(20)
    .setStreamRepeat(true)
    .toStream()
    .forEach((point) => {
        // Transform point to suit series.
        series1.add({ x: point.y, y: -point.x })
    })

createProgressiveFunctionGenerator()
    .setSamplingFunction((x) => Math.sin(x * 0.5) + Math.sin(x) + Math.cos(x * 1.5) + Math.cos(x * 0.25))
    .setEnd(Math.PI * 100)
    .setStep(0.015)
    .generate()
    // 1000 points / sec
    .setStreamBatchSize(20)
    .setStreamInterval(20)
    .setStreamRepeat(true)
    .toStream()
    .forEach((point) => {
        // Transform point to suit series.
        series2.add({ x: point.y, y: point.x })
    })
