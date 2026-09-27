document.addEventListener('DOMContentLoaded', () => {
    // Shared embedded data
    const N_RESPONSE = {
        rates: [0, 48, 96, 144, 192, 240, 288],
        continuous: [1.2, 3.0, 4.8, 6.5, 7.5, 7.8, 7.5],
        rotational: [2.2, 5.0, 7.2, 9.0, 9.9, 10.2, 10.0],
        leaching: [8, 12, 15, 22, 35, 65, 90],
        marginal_cont: [null, 37.5, 37.5, 35.4, 20.8, 6.3, -6.3],
        marginal_rot: [null, 58.3, 45.8, 37.5, 18.8, 6.3, -4.2]
    };

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#d6d3d1' : '#44403c';
    const gridColor = isDark ? '#44403c' : '#e7e5e4';

    // 1. Main Interactive Curve
    const ctxMain = document.getElementById('mainCurveChart').getContext('2d');
    const mainChart = new Chart(ctxMain, {
        type: 'line',
        data: {
            labels: N_RESPONSE.rates,
            datasets: [
                {
                    label: 'Rotational Wheat',
                    data: N_RESPONSE.rotational,
                    borderColor: '#10b981', // emerald-500
                    backgroundColor: '#10b981',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Continuous Wheat',
                    data: N_RESPONSE.continuous,
                    borderColor: '#f59e0b', // amber-500
                    backgroundColor: '#f59e0b',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                tooltip: { backgroundColor: 'rgba(0,0,0,0.8)' },
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Nitrogen Applied (kg N/ha)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: {
                    title: { display: true, text: 'Grain Yield (t/ha)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor },
                    min: 0,
                    max: 12
                }
            }
        }
    });

    // Slider Interaction
    const slider = document.getElementById('n-slider');
    const statN = document.getElementById('stat-n');
    const statYield = document.getElementById('stat-yield');
    const statEff = document.getElementById('stat-eff');
    const statLeach = document.getElementById('stat-leach');

    slider.addEventListener('input', (e) => {
        const idx = parseInt(e.target.value);
        
        statN.textContent = N_RESPONSE.rates[idx];
        statYield.textContent = N_RESPONSE.rotational[idx].toFixed(1);
        statEff.textContent = N_RESPONSE.marginal_rot[idx] ? N_RESPONSE.marginal_rot[idx].toFixed(1) : '--';
        statLeach.textContent = N_RESPONSE.leaching[idx];
        
        // Highlight active point on chart
        mainChart.setActiveElements([
            { datasetIndex: 0, index: idx },
            { datasetIndex: 1, index: idx }
        ]);
        mainChart.tooltip.setActiveElements([
            { datasetIndex: 0, index: idx },
            { datasetIndex: 1, index: idx }
        ], { x: 0, y: 0 });
        mainChart.update();
    });

    // 2. Environmental Cliff Chart (Dual Axis)
    const ctxCliff = document.getElementById('cliffChart').getContext('2d');
    const cliffChart = new Chart(ctxCliff, {
        type: 'line',
        data: {
            labels: N_RESPONSE.rates,
            datasets: [
                {
                    label: 'Yield (t/ha)',
                    data: N_RESPONSE.rotational,
                    borderColor: '#10b981',
                    backgroundColor: '#10b981',
                    yAxisID: 'y',
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Nitrate Leached (kg N/ha)',
                    data: N_RESPONSE.leaching,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: true,
                    yAxisID: 'y1',
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                annotation: {
                    annotations: {
                        limitLine: {
                            type: 'line',
                            yMin: 50,
                            yMax: 50,
                            borderColor: 'rgba(239, 68, 68, 0.5)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            yScaleID: 'y1',
                            label: {
                                display: true,
                                content: 'EU Water Limit Proxy',
                                position: 'end',
                                color: '#ef4444',
                                backgroundColor: 'transparent'
                            }
                        }
                    }
                }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Yield (t/ha)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'N Leached (kg/ha)', color: textColor },
                    grid: { drawOnChartArea: false },
                    ticks: { color: textColor }
                }
            }
        }
    });

    // 3. Marginal Returns Waterfall (Bar)
    const ctxMarginal = document.getElementById('marginalChart').getContext('2d');
    
    // Create colors based on value
    const marginalColors = N_RESPONSE.marginal_rot.slice(1).map(val => {
        if (val > 25) return '#10b981'; // Good return - emerald
        if (val > 0) return '#94a3b8';  // Poor return - slate
        return '#ef4444';               // Negative return - red
    });

    const marginalChart = new Chart(ctxMarginal, {
        type: 'bar',
        data: {
            labels: ['0→48', '48→96', '96→144', '144→192', '192→240', '240→288'],
            datasets: [{
                label: 'kg Grain / kg N',
                data: N_RESPONSE.marginal_rot.slice(1),
                backgroundColor: marginalColors,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { 
                    title: { display: true, text: 'N Rate Step (kg/ha)', color: textColor },
                    grid: { display: false },
                    ticks: { color: textColor }
                },
                y: {
                    title: { display: true, text: 'Efficiency (kg/kg)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                }
            }
        }
    });

    // 4. Rotation Premium (Grouped Bar)
    const ctxRotation = document.getElementById('rotationChart').getContext('2d');
    const rotationChart = new Chart(ctxRotation, {
        type: 'bar',
        data: {
            labels: N_RESPONSE.rates,
            datasets: [
                {
                    label: 'Rotational (1st Wheat)',
                    data: N_RESPONSE.rotational,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                },
                {
                    label: 'Continuous Wheat',
                    data: N_RESPONSE.continuous,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterBody: (context) => {
                            if (context.length === 2) {
                                const diff = context[0].raw - context[1].raw;
                                return `\nPremium: +${diff.toFixed(1)} t/ha`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'N Rate (kg/ha)', color: textColor },
                    grid: { display: false },
                    ticks: { color: textColor }
                },
                y: {
                    title: { display: true, text: 'Yield (t/ha)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                }
            }
        }
    });
    
    // Register charts for theme changes (if shared.js supports it)
    if (window.BK && window.BK._charts) {
        window.BK._charts.push(mainChart, cliffChart, marginalChart, rotationChart);
    }
});
