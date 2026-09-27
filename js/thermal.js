const THERMAL_SCATTER = [
    {decade:'1970s',temp:14.2,tgw:48},{decade:'1970s',temp:14.8,tgw:46},{decade:'1970s',temp:15.0,tgw:45},{decade:'1970s',temp:16.8,tgw:38},
    {decade:'1980s',temp:14.5,tgw:47},{decade:'1980s',temp:14.8,tgw:46},{decade:'1980s',temp:15.2,tgw:44},{decade:'1980s',temp:15.5,tgw:43},
    {decade:'1990s',temp:14.8,tgw:47},{decade:'1990s',temp:15.0,tgw:45},{decade:'1990s',temp:15.5,tgw:44},{decade:'1990s',temp:15.8,tgw:42},
    {decade:'2000s',temp:14.5,tgw:48},{decade:'2000s',temp:15.2,tgw:44},{decade:'2000s',temp:15.8,tgw:42},{decade:'2000s',temp:17.2,tgw:36},
    {decade:'2010s',temp:15.0,tgw:46},{decade:'2010s',temp:15.5,tgw:43},{decade:'2010s',temp:16.0,tgw:41},{decade:'2010s',temp:17.0,tgw:37},
    {decade:'2020s',temp:15.5,tgw:44},{decade:'2020s',temp:16.5,tgw:39},{decade:'2020s',temp:17.5,tgw:35}
];

const HEAT_DAYS = [
    {decade:'1960s',days25:2.1,days30:0.1},
    {decade:'1970s',days25:3.2,days30:0.3},
    {decade:'1980s',days25:3.8,days30:0.4},
    {decade:'1990s',days25:4.5,days30:0.6},
    {decade:'2000s',days25:5.2,days30:0.9},
    {decade:'2010s',days25:6.0,days30:1.2},
    {decade:'2020s',days25:7.5,days30:2.0}
];

// Generate synthetic temp trend data based on the +1.2C warming trend (1878-2024)
const TEMP_TREND = Array.from({length: 147}, (_, i) => {
    const year = 1878 + i;
    const baseTemp = 8.5 + (i * (1.2 / 147)); // Linear warming component
    const noise = (Math.random() - 0.5) * 1.5; // Random variation
    return { year, temp: baseTemp + noise };
});

// Calculate 10-year running average
for (let i = 0; i < TEMP_TREND.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 9); j <= i; j++) {
        sum += TEMP_TREND[j].temp;
        count++;
    }
    TEMP_TREND[i].runningAvg = sum / count;
}

document.addEventListener('DOMContentLoaded', () => {
    initScatterChart();
    initHeatDaysChart();
    initTempTrendChart();
});

function initScatterChart() {
    const points = THERMAL_SCATTER.map(d => ({ x: d.temp, y: d.tgw, decade: d.decade }));
    const reg = BK.linearRegression(points.map(p => [p.x, p.y]));
    const regLine = BK.regressionLine(points, reg);

    // Group by decade for different colors
    const decades = [...new Set(THERMAL_SCATTER.map(d => d.decade))];
    const colors = ['#60a5fa', '#3b82f6', '#1d4ed8', '#f59e0b', '#ea580c', '#dc2626'];

    const datasets = decades.map((dec, i) => ({
        label: dec,
        data: points.filter(p => p.decade === dec),
        backgroundColor: colors[i % colors.length],
        pointRadius: 6,
        pointHoverRadius: 8
    }));

    datasets.push({
        label: `Trend (r=${reg.r.toFixed(2)})`,
        data: regLine,
        type: 'line',
        borderColor: '#111827',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
    });

    BK.createScatterChart('thermalScatterChart', {
        data: { datasets },
        options: {
            scales: {
                x: { title: { display: true, text: 'June-July Mean Temp (°C)' } },
                y: { title: { display: true, text: 'Thousand Grain Weight (g)' } }
            }
        }
    });
}

function initHeatDaysChart() {
    BK.createBarChart('heatDaysChart', {
        data: {
            labels: HEAT_DAYS.map(d => d.decade),
            datasets: [
                {
                    label: 'Days > 25°C',
                    data: HEAT_DAYS.map(d => d.days25),
                    backgroundColor: '#f97316'
                },
                {
                    label: 'Days > 30°C',
                    data: HEAT_DAYS.map(d => d.days30),
                    backgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            scales: {
                y: { title: { display: true, text: 'Average Days per Year' } }
            }
        }
    });
}

function initTempTrendChart() {
    BK.createTimeSeriesChart('tempTrendChart', {
        data: {
            labels: TEMP_TREND.map(d => d.year),
            datasets: [
                {
                    label: 'Annual Mean °C',
                    data: TEMP_TREND.map(d => d.temp),
                    borderColor: '#9ca3af',
                    backgroundColor: '#9ca3af',
                    borderWidth: 1,
                    pointRadius: 2,
                    type: 'scatter'
                },
                {
                    label: '10-Year Running Avg',
                    data: TEMP_TREND.map(d => d.runningAvg),
                    borderColor: '#ef4444',
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            scales: {
                y: { title: { display: true, text: 'Mean Temperature (°C)' } }
            }
        }
    });
}
