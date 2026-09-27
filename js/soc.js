// js/soc.js
document.addEventListener('DOMContentLoaded', () => {
    // Check if BK is defined, if not we will setup a fallback (in case shared.js is stubbed or missing)
    window.BK = window.BK || {
        _charts: [],
        createTimeSeriesChart: (id, config) => new Chart(document.getElementById(id), config),
        createBarChart: (id, config) => new Chart(document.getElementById(id), config)
    };

    const SOC_DATA = {
        nil: [{y:1843,c:25},{y:1865,c:26},{y:1881,c:25},{y:1893,c:25},{y:1914,c:26},{y:1936,c:25},{y:1944,c:25},{y:1966,c:26},{y:1987,c:27},{y:1992,c:26},{y:2000,c:27},{y:2010,c:27},{y:2015,c:28}],
        pkm: [{y:1843,c:25},{y:1865,c:26},{y:1881,c:27},{y:1893,c:28},{y:1914,c:29},{y:1936,c:29},{y:1944,c:30},{y:1966,c:30},{y:1987,c:31},{y:1992,c:31},{y:2000,c:32},{y:2010,c:32},{y:2015,c:32}],
        npk: [{y:1843,c:25},{y:1865,c:27},{y:1881,c:28},{y:1893,c:30},{y:1914,c:32},{y:1936,c:33},{y:1944,c:33},{y:1966,c:34},{y:1987,c:35},{y:1992,c:36},{y:2000,c:36},{y:2010,c:37},{y:2015,c:38}],
        fym: [{y:1843,c:25},{y:1865,c:40},{y:1881,c:52},{y:1893,c:60},{y:1914,c:68},{y:1936,c:73},{y:1944,c:76},{y:1966,c:80},{y:1987,c:83},{y:1992,c:84},{y:2000,c:86},{y:2010,c:87},{y:2015,c:88}],
        wilderness: [{y:1882,c:25},{y:1900,c:35},{y:1920,c:48},{y:1940,c:58},{y:1960,c:70},{y:1980,c:85},{y:2000,c:95},{y:2015,c:105}]
    };

    // Helper to format data for Chart.js
    const formatData = (arr) => arr.map(pt => ({x: pt.y, y: pt.c}));

    const commonLineOptions = {
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.2
    };

    const mainChartCtx = document.getElementById('socMainChart');
    if (mainChartCtx) {
        let chartConfig = {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Plot 3 (Nil)',
                        data: formatData(SOC_DATA.nil),
                        borderColor: '#9ca3af', // Gray
                        backgroundColor: '#9ca3af',
                        ...commonLineOptions
                    },
                    {
                        label: 'Plot 5 (PKMg)',
                        data: formatData(SOC_DATA.pkm),
                        borderColor: '#9333ea', // Purple
                        backgroundColor: '#9333ea',
                        ...commonLineOptions
                    },
                    {
                        label: 'Plot 8 (NPK)',
                        data: formatData(SOC_DATA.npk),
                        borderColor: '#22c55e', // Green
                        backgroundColor: '#22c55e',
                        ...commonLineOptions
                    },
                    {
                        label: 'Plot 2.2 (FYM)',
                        data: formatData(SOC_DATA.fym),
                        borderColor: '#d97706', // Amber
                        backgroundColor: '#d97706',
                        ...commonLineOptions
                    },
                    {
                        label: 'Wilderness',
                        data: formatData(SOC_DATA.wilderness),
                        borderColor: '#064e3b', // Dark green
                        backgroundColor: '#064e3b',
                        borderDash: [5, 5],
                        ...commonLineOptions
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Year' },
                        min: 1840,
                        max: 2020,
                        ticks: { callback: (value) => value.toString().replace(',', '') }
                    },
                    y: {
                        title: { display: true, text: 'Soil Organic Carbon (t C/ha)' },
                        min: 0,
                        suggestedMax: 110
                    }
                },
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            title: (ctx) => `Year: ${ctx[0].parsed.x}`,
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} t C/ha`
                        }
                    }
                }
            }
        };

        if (window.BK.createTimeSeriesChart) {
            window.BK.createTimeSeriesChart('socMainChart', chartConfig);
        } else {
            new Chart(mainChartCtx, chartConfig);
        }
    }

    const barChartCtx = document.getElementById('socBarChart');
    if (barChartCtx) {
        let barConfig = {
            type: 'bar',
            data: {
                labels: ['Target (4‰)', 'FYM (0-20 yrs)', 'FYM (60 yrs)', 'FYM (120 yrs)', 'NPK (avg)', 'Nil'],
                datasets: [{
                    label: 'Carbon Accumulation Rate (‰ per year)',
                    data: [4, 30.5, 5, 1, 3, 0], // Using ~30.5 as midpoint for 18-43‰
                    backgroundColor: [
                        '#3b82f6', // Blue target
                        '#d97706', // Amber FYM
                        '#f59e0b', // Lighter Amber
                        '#fcd34d', // Lightest Amber
                        '#22c55e', // Green NPK
                        '#9ca3af'  // Gray Nil
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: { display: true, text: 'Rate (‰ / year)' },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} ‰ per year`
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 4,
                                yMax: 4,
                                borderColor: '#ef4444',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: '4 per 1000 Target',
                                    display: true,
                                    position: 'end'
                                }
                            }
                        }
                    }
                }
            }
        };

        if (window.BK.createBarChart) {
            window.BK.createBarChart('socBarChart', barConfig);
        } else {
            new Chart(barChartCtx, barConfig);
        }
    }
});
