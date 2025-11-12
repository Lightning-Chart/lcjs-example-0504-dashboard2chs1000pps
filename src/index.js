/*
 * LightningChartJS example that showcases different directions of progressivity and using custom axes.
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

// Import xydata
const xydata = require('@lightningchart/xydata')

// Extract required parts from LightningChartJS.
const { lightningChart, AxisScrollStrategies, emptyFill, Themes } = lcjs

// Import data-generator from 'xydata'-library.
const { createProgressiveFunctionGenerator } = xydata

const viewRange = Math.PI * 2 * 10

// Create Dashboard.
// NOTE: Using `Dashboard` is no longer recommended for new applications. Find latest recommendations here: https://lightningchart.com/js-charts/docs/more-guides/grouping-charts/
const grid = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        }).Dashboard({
    theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    numberOfRows: 1,
    numberOfColumns: 2,
})

// Create two XY-charts.
const chart1 = grid.createChartXY({
    columnIndex: 0,
    rowIndex: 0,
    columnSpan: 1,
    rowSpan: 1,
    legend: { visible: false },

})
const chart2 = grid.createChartXY({
    columnIndex: 1,
    rowIndex: 0,
    columnSpan: 1,
    rowSpan: 1,
    legend: { visible: false },

})

// Create progressive series with different directions and configure Y-axes suitably.
// First, a vertically regressive series.
chart1.setTitle('Vertical regressive')
chart1.getDefaultAxisY().setInterval({ start: viewRange, end: 0, stopAxisAfter: false }).setScrollStrategy(AxisScrollStrategies.scrolling({ progressive: false }))
const series1 = chart1
    .addLineSeries({
        schema: {
            x: { pattern: null },
            y: { pattern: 'regressive' },
        },
    })
    .setMaxSampleCount(10_000)

// Second, a vertically progressive series with custom axis.
chart2.setTitle('Vertical progressive')
// Add new axis to 'right' side of chart.
const customAxisY = chart2
    .addAxisY({ opposite: true })
    .setDefaultInterval((state) => ({ end: state.dataMax, start: (state.dataMax ?? 0) - viewRange, stopAxisAfter: false }))
    .setScrollStrategy(AxisScrollStrategies.scrolling)

const series2 = chart2
    .addLineSeries({
        schema: {
            x: { pattern: null },
            y: { pattern: 'progressive' },
        },
        axisY: customAxisY,
    })
    .setMaxSampleCount(10_000)

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
        series1.appendSample({ x: point.y, y: -point.x })
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
        series2.appendSample({ x: point.y, y: point.x })
    })
