const HARVEST_INDEX = [
    {y:1852,hi:0.32},{y:1870,hi:0.32},{y:1900,hi:0.34},{y:1920,hi:0.34},{y:1940,hi:0.36},{y:1960,hi:0.38},
    {y:1968,hi:0.42},{y:1975,hi:0.43},{y:1980,hi:0.44},{y:1985,hi:0.46},{y:1990,hi:0.47},
    {y:1995,hi:0.48},{y:2000,hi:0.49},{y:2005,hi:0.50},{y:2010,hi:0.51},{y:2015,hi:0.52},{y:2020,hi:0.52}
];

const HEAD_TO_HEAD = [
    {n_rate:'N₀ (0)',sqm:1.0,brimstone:1.8},
    {n_rate:'N₁ (48)',sqm:2.0,brimstone:4.5},
    {n_rate:'N₂ (96)',sqm:2.5,brimstone:6.5},
    {n_rate:'N₃ (144)',sqm:2.0,brimstone:7.8},
    {n_rate:'N₄ (192)',sqm:1.5,brimstone:8.5}
];

// Generate Plot 08 Yield Timeline Data (synthetic approximation of true trends)
const YIELD_TIMELINE = [];
for (let y = 1852; y <= 2022; y++) {
    let base = 2.5; // Default for 08 (minerals + N)
    if (y > 1968) base = 5.0; // Early dwarfs
    if (y > 1985) base = 7.5; // Mid-modern
    if (y > 2000) base = 9.5; // Current
    
    // Add noise and occasional drops for bad years
    let noise = (Math.random() - 0.5) * 1.5;
    if (y === 1976 || y === 2003 || y === 2012) noise -= 2.0; // Bad years
    if (y === 2014) noise += 2.5; // Great year

    let yieldVal = base + noise;
    if (yieldVal < 0) yieldVal = 0.5;

    // Only add a point every few years for visual clarity unless it's a key year
    if (y % 4 === 0 || [1968, 1976, 1985, 2000, 2003, 2012, 2014, 2022].includes(y)) {
        YIELD_TIMELINE.push({ year: y, yield: yieldVal });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initYieldTimelineChart();
    initHarvestIndexChart();
    initHeadToHeadChart();
});

function initYieldTimelineChart() {
    // If BK functions are available, use them. Otherwise, simple fallbacks or errors will occur.
    // Assuming BK object is available via chart-factory.js
    let annotations = {};
    if (window.BK && window.BK.buildCultivarAnnotations) {
        annotations = { annotations: window.BK.buildCultivarAnnotations() };
    }

    const chartConfig = {
        data: {
            labels: YIELD_TIMELINE.map(d => d.year),
            datasets: [{
                label: 'Plot 08 Yield (t/ha)',
                data: YIELD_TIMELINE.map(d => d.yield),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            plugins: {
                annotation: annotations
            },
            scales: {
                y: { title: { display: true, text: 'Yield (t/ha)' }, min: 0 }
            }
        }
    };

    if (window.BK && window.BK.createTimeSeriesChart) {
        window.BK.createTimeSeriesChart('yieldTimelineChart', chartConfig);
    } else {
        new Chart(document.getElementById('yieldTimelineChart'), chartConfig);
    }
}

function initHarvestIndexChart() {
    const chartConfig = {
        data: {
            labels: HARVEST_INDEX.map(d => d.y),
            datasets: [{
                label: 'Harvest Index',
                data: HARVEST_INDEX.map(d => d.hi),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.2,
                pointRadius: 4,
                pointBackgroundColor: '#2563eb'
            }]
        },
        options: {
            scales: {
                y: { title: { display: true, text: 'Harvest Index' }, min: 0.2, max: 0.6 }
            }
        }
    };

    if (window.BK && window.BK.createTimeSeriesChart) {
        window.BK.createTimeSeriesChart('harvestIndexChart', chartConfig);
    } else {
        new Chart(document.getElementById('harvestIndexChart'), chartConfig);
    }
}

function initHeadToHeadChart() {
    const chartConfig = {
        data: {
            labels: HEAD_TO_HEAD.map(d => d.n_rate),
            datasets: [
                {
                    label: "Squarehead's Master (Traditional)",
                    data: HEAD_TO_HEAD.map(d => d.sqm),
                    backgroundColor: '#f59e0b'
                },
                {
                    label: "Brimstone (Modern)",
                    data: HEAD_TO_HEAD.map(d => d.brimstone),
                    backgroundColor: '#10b981'
                }
            ]
        },
        options: {
            scales: {
                y: { title: { display: true, text: 'Yield (t/ha)' } }
            }
        }
    };

    if (window.BK && window.BK.createBarChart) {
        window.BK.createBarChart('headToHeadChart', chartConfig);
    } else {
        new Chart(document.getElementById('headToHeadChart'), { type: 'bar', ...chartConfig });
    }
}
