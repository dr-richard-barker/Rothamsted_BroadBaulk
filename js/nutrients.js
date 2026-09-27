// js/nutrients.js
document.addEventListener('DOMContentLoaded', () => {
    window.BK = window.BK || {
        _charts: [],
        createDualAxisChart: (id, config) => new Chart(document.getElementById(id), config),
        createBarChart: (id, config) => new Chart(document.getElementById(id), config)
    };

    const NUTRIENT_DATA = {
        years: [1845,1855,1865,1875,1885,1895,1905,1915,1925,1935,1945,1955,1965,1970,1975,1980,1985,1990,1995,2000,2005],
        yield_plot8: [2.8,2.6,2.7,2.8,2.5,2.7,2.6,2.5,2.5,2.9,2.6,2.8,3.0,5.5,6.0,6.8,7.5,8.0,8.5,9.0,8.2],
        zn: [42,40,41,43,39,40,38,41,40,42,39,41,40,35,30,28,26,25,24,23,22],
        fe: [58,55,57,56,54,55,53,56,55,57,54,56,55,48,44,42,40,39,38,37,36],
        cu: [5.5,5.3,5.4,5.5,5.2,5.3,5.1,5.4,5.3,5.5,5.2,5.4,5.3,4.8,4.5,4.3,4.2,4.1,4.0,3.9,3.8],
        mg: [1350,1320,1340,1350,1310,1330,1300,1340,1330,1350,1310,1340,1330,1250,1200,1180,1160,1150,1140,1130,1120]
    };

    const NUTRIENT_INFO = {
        zn: { label: 'Zinc (mg/kg)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
        fe: { label: 'Iron (mg/kg)', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.2)' },
        cu: { label: 'Copper (mg/kg)', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.2)' },
        mg: { label: 'Magnesium (mg/kg)', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' }
    };

    let mainChart = null;

    const createMainChart = (nutrientKey) => {
        const ctx = document.getElementById('nutrientMainChart');
        if (!ctx) return;

        if (mainChart) {
            mainChart.destroy();
        }

        const info = NUTRIENT_INFO[nutrientKey];
        
        const config = {
            type: 'line',
            data: {
                labels: NUTRIENT_DATA.years,
                datasets: [
                    {
                        label: 'Grain Yield (Plot 8)',
                        data: NUTRIENT_DATA.yield_plot8,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        borderWidth: 2,
                        yAxisID: 'yLeft',
                        type: 'bar',
                        order: 2
                    },
                    {
                        label: info.label,
                        data: NUTRIENT_DATA[nutrientKey],
                        borderColor: info.color,
                        backgroundColor: info.bg,
                        borderWidth: 3,
                        pointRadius: 4,
                        yAxisID: 'yRight',
                        type: 'line',
                        fill: false,
                        tension: 0.2,
                        order: 1
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
                        title: { display: true, text: 'Year' }
                    },
                    yLeft: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Grain Yield (t/ha)' },
                        min: 0,
                        max: 10
                    },
                    yRight: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: info.label },
                        grid: { drawOnChartArea: false }
                    }
                },
                plugins: {
                    legend: { position: 'bottom' },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                xMin: '1968', // Using string might require exact label match, if using indices: 13 (approx 1970) or scale value
                                xMax: '1968',
                                scaleID: 'x',
                                value: 1968,
                                borderColor: '#ef4444',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: '1968: Semi-dwarf cultivars',
                                    display: true,
                                    position: 'start'
                                }
                            }
                        }
                    }
                }
            }
        };

        // Custom handling for finding nearest x value for the annotation
        // Chart.js annotations by value on category scale requires either exact string match or index.
        // We will approximate to index 13 (1970)
        config.options.plugins.annotation.annotations.line1.xMin = 13;
        config.options.plugins.annotation.annotations.line1.xMax = 13;

        if (window.BK && window.BK.createDualAxisChart && typeof window.BK.createDualAxisChart === 'function') {
            mainChart = new Chart(ctx, config); // Use generic Chart for dual axis if method doesn't exist
        } else {
            mainChart = new Chart(ctx, config);
        }
    };

    createMainChart('zn');

    // UI Buttons
    document.querySelectorAll('.nutr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nutr-btn').forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('bg-stone-200', 'text-stone-800', 'dark:bg-stone-700', 'dark:text-stone-200');
            });
            e.target.classList.remove('bg-stone-200', 'text-stone-800', 'dark:bg-stone-700', 'dark:text-stone-200');
            e.target.classList.add('bg-blue-600', 'text-white');
            
            const nutrient = e.target.getAttribute('data-nutrient');
            createMainChart(nutrient);
        });
    });

    // Soil vs Grain Bar Chart
    const soilVsGrainCtx = document.getElementById('soilVsGrainChart');
    if (soilVsGrainCtx) {
        new Chart(soilVsGrainCtx, {
            type: 'bar',
            data: {
                labels: ['Pre-1968', 'Post-1968'],
                datasets: [
                    {
                        label: 'Soil Zn Relative (%)',
                        data: [100, 102],
                        backgroundColor: '#84cc16'
                    },
                    {
                        label: 'Grain Zn Relative (%)',
                        data: [100, 65],
                        backgroundColor: '#3b82f6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Relative Concentration (%)' },
                        max: 120
                    }
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
});
