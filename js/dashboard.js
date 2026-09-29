// js/dashboard.js

(function () {
  'use strict';

  // --- Embedded Data ---
  const YIELD_DATA = {
    // Plot 03 - Nil (Unmanured): remarkably flat ~1.0-1.4 t/ha
    '03': [
      {y:1852,v:1.4},{y:1855,v:1.2},{y:1860,v:1.3},{y:1865,v:1.1},{y:1870,v:1.5},{y:1875,v:1.2},{y:1880,v:1.0},{y:1885,v:1.3},{y:1890,v:1.1},{y:1895,v:1.2},
      {y:1900,v:1.1},{y:1905,v:1.0},{y:1910,v:1.2},{y:1915,v:1.1},{y:1920,v:0.9},{y:1925,v:1.0},{y:1930,v:1.1},{y:1935,v:1.2},{y:1940,v:1.0},{y:1945,v:1.1},
      {y:1950,v:0.9},{y:1955,v:1.0},{y:1960,v:1.1},{y:1965,v:1.0},{y:1970,v:1.2},{y:1975,v:1.1},{y:1980,v:1.3},{y:1985,v:1.0},{y:1990,v:1.2},{y:1995,v:1.1},
      {y:2000,v:1.3},{y:2005,v:1.0},{y:2010,v:1.2},{y:2015,v:1.1},{y:2020,v:1.3},{y:2022,v:1.2}
    ],
    // Plot 2.2 - FYM: ~2.5 early, rises to ~4-5 modern
    '2.2': [
      {y:1852,v:2.5},{y:1855,v:2.3},{y:1860,v:2.6},{y:1865,v:2.4},{y:1870,v:2.8},{y:1875,v:2.5},{y:1880,v:2.3},{y:1885,v:2.6},{y:1890,v:2.4},{y:1895,v:2.5},
      {y:1900,v:2.4},{y:1905,v:2.5},{y:1910,v:2.7},{y:1915,v:2.3},{y:1920,v:2.2},{y:1925,v:2.4},{y:1930,v:2.6},{y:1935,v:2.5},{y:1940,v:2.3},{y:1945,v:2.4},
      {y:1950,v:2.5},{y:1955,v:2.6},{y:1960,v:2.7},{y:1965,v:2.8},{y:1970,v:3.5},{y:1975,v:3.8},{y:1980,v:4.0},{y:1985,v:4.2},{y:1990,v:4.5},{y:1995,v:4.8},
      {y:2000,v:5.0},{y:2005,v:4.6},{y:2010,v:5.2},{y:2015,v:4.8},{y:2020,v:5.1},{y:2022,v:5.0}
    ],
    // Plot 06 - N1PKMg (48 kg N): ~2.0 early, rises to ~5-6 modern
    '06': [
      {y:1852,v:2.0},{y:1860,v:2.1},{y:1870,v:2.3},{y:1880,v:2.0},{y:1890,v:2.1},{y:1900,v:2.0},{y:1910,v:2.2},{y:1920,v:1.9},{y:1930,v:2.1},{y:1940,v:2.0},
      {y:1950,v:2.1},{y:1960,v:2.2},{y:1968,v:3.0},{y:1975,v:3.8},{y:1980,v:4.2},{y:1985,v:4.8},{y:1990,v:5.2},{y:1995,v:5.0},{y:2000,v:5.5},{y:2005,v:5.1},
      {y:2010,v:5.8},{y:2015,v:5.3},{y:2020,v:5.6},{y:2022,v:5.4}
    ],
    // Plot 08 - N3PKMg (144 kg N): ~2.5-3.0 early, rises to ~8-10 modern
    '08': [
      {y:1852,v:2.8},{y:1855,v:2.5},{y:1860,v:3.0},{y:1865,v:2.7},{y:1870,v:3.2},{y:1875,v:2.8},{y:1880,v:2.5},{y:1885,v:2.9},{y:1890,v:2.6},{y:1895,v:2.7},
      {y:1900,v:2.6},{y:1905,v:2.8},{y:1910,v:3.0},{y:1915,v:2.5},{y:1920,v:2.3},{y:1925,v:2.5},{y:1930,v:2.8},{y:1935,v:2.9},{y:1940,v:2.6},{y:1945,v:2.7},
      {y:1950,v:2.8},{y:1955,v:2.9},{y:1960,v:3.0},{y:1965,v:3.2},{y:1970,v:5.5},{y:1975,v:6.0},{y:1980,v:6.8},{y:1985,v:7.5},{y:1990,v:8.0},{y:1995,v:8.5},
      {y:2000,v:9.0},{y:2005,v:8.2},{y:2010,v:9.5},{y:2015,v:8.8},{y:2020,v:9.2},{y:2022,v:9.0}
    ],
    // Plot 09 - N4PKMg (192 kg N): available from 1968
    '09': [
      {y:1968,v:5.0},{y:1970,v:5.8},{y:1975,v:6.5},{y:1980,v:7.2},{y:1985,v:8.0},{y:1990,v:8.8},{y:1995,v:9.5},{y:2000,v:10.0},{y:2005,v:9.0},{y:2010,v:10.2},
      {y:2015,v:9.5},{y:2020,v:9.8},{y:2022,v:9.6}
    ],
    // Plot 16 - N6PKMg (288 kg N): available from 1985, often lower than N4 due to lodging
    '16': [
      {y:1985,v:7.2},{y:1990,v:8.0},{y:1995,v:8.8},{y:2000,v:9.5},{y:2005,v:8.5},{y:2010,v:9.8},{y:2015,v:9.0},{y:2020,v:9.5},{y:2022,v:9.2}
    ]
  };

  const CLIMATE_DATA = [
    {y:1970,rain:750,springRain:280,summerTemp:14.5,gdd:1850},
    {y:1975,rain:680,springRain:220,summerTemp:15.2,gdd:1920},
    {y:1976,rain:520,springRain:150,summerTemp:16.8,gdd:2100}, // drought year
    {y:1980,rain:720,springRain:260,summerTemp:14.2,gdd:1800},
    {y:1985,rain:780,springRain:290,summerTemp:14.8,gdd:1880},
    {y:1990,rain:700,springRain:240,summerTemp:15.0,gdd:1950},
    {y:1995,rain:650,springRain:210,summerTemp:15.5,gdd:2000},
    {y:2000,rain:830,springRain:310,summerTemp:15.2,gdd:1960},
    {y:2003,rain:580,springRain:180,summerTemp:17.2,gdd:2180}, // heatwave
    {y:2005,rain:710,springRain:250,summerTemp:15.5,gdd:2010},
    {y:2010,rain:690,springRain:230,summerTemp:15.0,gdd:1930},
    {y:2015,rain:740,springRain:270,summerTemp:15.8,gdd:2050},
    {y:2018,rain:610,springRain:190,summerTemp:17.0,gdd:2160}, // heat
    {y:2020,rain:760,springRain:280,summerTemp:15.5,gdd:2020},
    {y:2022,rain:590,springRain:170,summerTemp:17.5,gdd:2200}, // UK 40°C
  ];

  // --- State ---
  const activePlots = new Set(['03', '2.2', '08']);
  let activeClimate = 'none';
  let chart = null;

  // --- Initialization ---
  function init() {
    renderPlotControls();
    setupEventListeners();
    updateChart();
  }

  function renderPlotControls() {
    const container = document.getElementById('plot-controls');
    if (!container) return;
    container.innerHTML = '';

    const plots = ['03', '2.2', '08', '09', '06', '16'];
    const BK = window.BK || {};
    const plotColors = BK.PLOT_COLORS || {
      '03':  { bg: '#6b7280', label: 'Nil (Unmanured)' },
      '2.2': { bg: '#a16207', label: 'FYM (35 t/ha)' },
      '08':  { bg: '#22c55e', label: 'N₃PKMg (144 kg N/ha)' },
      '09':  { bg: '#eab308', label: 'N₄PKMg (192 kg N/ha)' },
      '06':  { bg: '#3b82f6', label: 'N₁PKMg (48 kg N/ha)' },
      '16':  { bg: '#ef4444', label: 'N₆PKMg (288 kg N/ha)' },
    };
    
    plots.forEach(plotId => {
      const config = plotColors[plotId] || { bg: '#888', label: `Plot ${plotId}` };
      
      const wrapper = document.createElement('label');
      wrapper.className = 'flex items-center gap-3 p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer transition-colors';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = plotId;
      checkbox.checked = activePlots.has(plotId);
      checkbox.className = 'w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-100 border-stone-300 dark:bg-stone-700 dark:border-stone-600';
      
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          activePlots.add(plotId);
        } else {
          activePlots.delete(plotId);
        }
        updateChart();
      });

      const colorBadge = document.createElement('span');
      colorBadge.className = 'w-3 h-3 rounded-full inline-block flex-shrink-0';
      colorBadge.style.backgroundColor = config.bg;

      const labelText = document.createElement('span');
      labelText.className = 'text-sm font-medium leading-tight';
      labelText.textContent = config.label;

      wrapper.appendChild(checkbox);
      wrapper.appendChild(colorBadge);
      wrapper.appendChild(labelText);
      container.appendChild(wrapper);
    });
  }

  function setupEventListeners() {
    const climateSelect = document.getElementById('climate-select');
    if (climateSelect) {
      climateSelect.addEventListener('change', (e) => {
        activeClimate = e.target.value;
        updateChart();
      });
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportData();
      });
    }
  }

  function updateChart() {
    const BK = window.BK || {};
    const isDual = activeClimate !== 'none';
    const yAxisID = isDual ? 'yLeft' : 'y';
    const datasets = [];

    // Add selected plots
    Array.from(activePlots).forEach(plotId => {
      if (YIELD_DATA[plotId]) {
        const points = YIELD_DATA[plotId].map(d => ({ x: d.y, y: d.v }));
        if (typeof BK.makeYieldDataset === 'function') {
          datasets.push(BK.makeYieldDataset(plotId, points, { yAxisID: yAxisID }));
        } else {
          datasets.push({
            label: `Plot ${plotId}`,
            data: points,
            yAxisID: yAxisID,
            borderWidth: 2,
            pointRadius: 2.5,
            fill: false
          });
        }
      }
    });

    // Add climate overlay if selected
    let rightAxisTitle = '';
    if (isDual) {
      const climateMapped = CLIMATE_DATA.map(d => ({ x: d.y, y: d[activeClimate] }));
      
      let label = '';
      let color = '#3b82f6';

      if (activeClimate === 'rain') { label = 'Annual Rain (mm)'; rightAxisTitle = 'Rainfall (mm)'; color = '#3b82f6'; }
      if (activeClimate === 'springRain') { label = 'Spring Rain (mm)'; rightAxisTitle = 'Spring Rain (mm)'; color = '#0ea5e9'; }
      if (activeClimate === 'summerTemp') { label = 'Summer Temp (°C)'; rightAxisTitle = 'Temperature (°C)'; color = '#ef4444'; }
      if (activeClimate === 'gdd') { label = 'GDD'; rightAxisTitle = 'Growing Degree Days'; color = '#f59e0b'; }

      datasets.push({
        label: label,
        data: climateMapped,
        borderColor: color,
        backgroundColor: color,
        yAxisID: 'yRight',
        type: 'bar',
        barPercentage: 0.5,
        order: 2
      });
    }

    if (chart) {
      chart.destroy();
      chart = null;
    }

    const chartOptions = {
      scales: {
        x: {
          type: 'linear',
          min: 1850,
          max: 2025,
          title: { display: true, text: 'Year' },
          ticks: { callback: v => v.toString() }
        }
      }
    };

    if (isDual) {
      chartOptions.scales.yLeft = {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Grain Yield (t/ha @ 85% DM)' },
        beginAtZero: true
      };
      chartOptions.scales.yRight = {
        type: 'linear',
        position: 'right',
        title: { display: true, text: rightAxisTitle },
        grid: { drawOnChartArea: false }
      };

      if (typeof BK.createDualAxisChart === 'function') {
        chart = BK.createDualAxisChart('dashboard-chart', {
          data: { datasets: datasets },
          options: chartOptions,
          annotations: { cultivars: true, epochs: true, yScaleID: 'yLeft' }
        });
      }
    } else {
      chartOptions.scales.y = {
        type: 'linear',
        title: { display: true, text: 'Grain Yield (t/ha @ 85% DM)' },
        beginAtZero: true
      };

      if (typeof BK.createTimeSeriesChart === 'function') {
        chart = BK.createTimeSeriesChart('dashboard-chart', {
          data: { datasets: datasets },
          options: chartOptions,
          annotations: { cultivars: true, epochs: true, yScaleID: 'y' }
        });
      }
    }

    if (chart && typeof BK.addAnnotations === 'function') {
      BK.addAnnotations(chart, { cultivars: true, epochs: true, yScaleID: isDual ? 'yLeft' : 'y' });
    }
  }

  function exportData() {
    const BK = window.BK || {};
    // Collect all years
    const yearsSet = new Set();
    Object.values(YIELD_DATA).forEach(plot => plot.forEach(d => yearsSet.add(d.y ?? d.x)));
    CLIMATE_DATA.forEach(d => yearsSet.add(d.y ?? d.x));
    
    const years = Array.from(yearsSet).sort((a, b) => a - b);
    
    // Build rows
    const rows = years.map(y => {
      const row = { Year: y };
      
      // Plots
      ['03', '2.2', '06', '08', '09', '16'].forEach(plotId => {
        const pt = YIELD_DATA[plotId]?.find(d => (d.y ?? d.x) === y);
        row[`Plot_${plotId}_Yield`] = pt ? (pt.v ?? pt.y) : '';
      });
      
      // Climate
      const clim = CLIMATE_DATA.find(d => (d.y ?? d.x) === y);
      row['AnnualRain_mm'] = clim ? (clim.rain ?? '') : '';
      row['SpringRain_mm'] = clim ? (clim.springRain ?? '') : '';
      row['SummerTemp_C'] = clim ? (clim.summerTemp ?? '') : '';
      row['GDD'] = clim ? (clim.gdd ?? '') : '';
      
      return row;
    });

    if (typeof BK.exportCSV === 'function') {
      BK.exportCSV(rows, 'broadbalk_dashboard_data.csv');
    } else {
      console.warn('BK.exportCSV not available');
    }
  }

  // --- Bootstrap ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 30));
  } else {
    setTimeout(init, 30);
  }
})();
