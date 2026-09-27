(function () {
    'use strict';
    const BK = window.BK || {};

    document.addEventListener('DOMContentLoaded', () => {
        // Wait slightly for shared scripts to initialize
        setTimeout(initCO2Charts, 50);
    });

const CO2_DATA = [
  {y:1843,ppm:284},{y:1850,ppm:285},{y:1860,ppm:286},{y:1870,ppm:288},{y:1880,ppm:291},
  {y:1890,ppm:295},{y:1900,ppm:296},{y:1910,ppm:300},{y:1920,ppm:303},{y:1930,ppm:307},
  {y:1940,ppm:311},{y:1950,ppm:311},{y:1958,ppm:315},{y:1960,ppm:317},{y:1965,ppm:320},
  {y:1970,ppm:326},{y:1975,ppm:331},{y:1980,ppm:339},{y:1985,ppm:346},{y:1990,ppm:354},
  {y:1995,ppm:361},{y:2000,ppm:369},{y:2005,ppm:380},{y:2010,ppm:390},{y:2015,ppm:401},
  {y:2020,ppm:414},{y:2022,ppm:419},{y:2024,ppm:426}
];

function generateYieldData(plotId, baseYield, geneticsMultiplier, nitrogenMultiplier) {
    const data = [];
    for (let year = 1843; year <= 2024; year++) {
        let y = baseYield;
        if (year > 1968 && plotId !== '03') y *= geneticsMultiplier;
        if (year > 1985 && plotId !== '03') y *= 1.1;
        if (plotId !== '03') y *= nitrogenMultiplier;
        if (plotId === '2.2') {
            y *= 1.3;
            if (year > 1968) y *= 1.2;
        }
        y += (Math.random() * 0.8 - 0.4);
        if (plotId === '03' && y < 0.5) y = 0.5 + Math.random() * 0.3;
        data.push({ x: year, y: parseFloat(y.toFixed(2)) });
    }
    return data;
}

const YIELD_03 = generateYieldData('03', 1.2, 1.0, 1.0);
const YIELD_08 = generateYieldData('08', 2.5, 1.6, 1.5);
const YIELD_2_2 = generateYieldData('2.2', 2.8, 1.5, 1.2);

const ATTRIBUTION_DATA = {
    labels: ['1892-1930', '1930-1960', '1960-1990', '1990-2016'],
    baseline: [3.1, 3.4, 5.2, 7.8],
    fixedCO2: [3.0, 3.2, 4.8, 7.1]
};

function initCO2Charts() {
    createMainDualAxisChart();
    createAttributionBarChart();
}

let mainChart;

function createMainDualAxisChart() {
    const canvas = document.getElementById('co2YieldChart');
    if (!canvas || typeof BK === 'undefined') return;

    const ds03 = BK.makeYieldDataset('03', YIELD_03, { yAxisID: 'yLeft', hidden: false });
    const ds08 = BK.makeYieldDataset('08', YIELD_08, { yAxisID: 'yLeft', hidden: false });
    const ds22 = BK.makeYieldDataset('2.2', YIELD_2_2, { yAxisID: 'yLeft', hidden: false });
    
    const dsCO2 = {
        label: 'Atmospheric CO₂ (ppm)',
        data: CO2_DATA.map(d => ({ x: d.y, y: d.ppm })),
        borderColor: '#991b1b',
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 6,
        yAxisID: 'yRight',
        tension: 0.4,
        order: -1
    };

    const config = {
        type: 'line',
        data: {
            datasets: [ds03, ds08, ds22, dsCO2]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Year' },
                    min: 1843,
                    max: 2024,
                    ticks: { callback: v => v }
                },
                yLeft: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Grain Yield (t/ha)' },
                    min: 0,
                    max: 10
                },
                yRight: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'CO₂ Concentration (ppm)' },
                    min: 250,
                    max: 450,
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.dataset.yAxisID === 'yRight') {
                                return `CO₂: ${ctx.parsed.y} ppm`;
                            }
                            return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} t/ha`;
                        }
                    }
                }
            }
        }
    };

    mainChart = BK.createDualAxisChart('co2YieldChart', config);
    if (mainChart) {
        BK.addAnnotations(mainChart, { cultivars: true });
        buildChartControls();
    }
}

function buildChartControls() {
    const container = document.getElementById('main-chart-controls');
    if (!container || !mainChart) return;

    const datasets = mainChart.data.datasets;
    
    datasets.forEach((ds, index) => {
        const label = document.createElement('label');
        label.className = 'flex items-center space-x-2 text-sm font-medium cursor-pointer bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !ds.hidden;
        checkbox.className = 'rounded text-emerald-600 focus:ring-emerald-500';
        
        checkbox.addEventListener('change', () => {
            mainChart.setDatasetVisibility(index, !checkbox.checked);
            mainChart.update();
        });
        
        const colorIndicator = document.createElement('span');
        colorIndicator.className = 'w-3 h-3 rounded-full inline-block';
        colorIndicator.style.backgroundColor = ds.borderColor || ds.backgroundColor;
        
        const text = document.createElement('span');
        text.textContent = ds.label;
        text.className = 'text-stone-700 dark:text-stone-300';
        
        label.appendChild(checkbox);
        label.appendChild(colorIndicator);
        label.appendChild(text);
        
        container.appendChild(label);
    });
}

function createAttributionBarChart() {
    if (typeof BK === 'undefined') return;
    const config = {
        type: 'bar',
        data: {
            labels: ATTRIBUTION_DATA.labels,
            datasets: [
                {
                    label: 'Historical weather + actual CO₂',
                    data: ATTRIBUTION_DATA.baseline,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: 'Historical weather + fixed 1892 CO₂',
                    data: ATTRIBUTION_DATA.fixedCO2,
                    backgroundColor: '#d6d3d1',
                    borderColor: '#a8a29e',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Simulated Yield (t/ha)' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} t/ha`
                    }
                }
            }
        }
    };
    
    BK.createBarChart('co2AttributionChart', config);
}
})();
