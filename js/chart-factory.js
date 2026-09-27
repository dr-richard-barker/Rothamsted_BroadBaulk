/**
 * Broadbalk Explorer — Chart Factory
 * Provides consistent Chart.js defaults, dual-axis helpers,
 * cultivar-era annotations, and epoch markers.
 */
(function () {
    'use strict';

    /* ── Global Chart.js Defaults ───────────────────────── */
    const isDark = () => document.documentElement.classList.contains('dark');
    const textColor = () => isDark() ? '#d6d3d1' : '#57534e';
    const gridColor = () => isDark() ? '#44403c' : '#e7e5e4';

    Chart.defaults.font.family = "'Inter', 'system-ui', '-apple-system', sans-serif";
    Chart.defaults.font.size = 13;
    Chart.defaults.color = textColor();
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;

    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(28, 25, 23, 0.92)';
    Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.padding = { top: 10, bottom: 10, left: 14, right: 14 };
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding = 4;

    Chart.defaults.elements.point.radius = 1.5;
    Chart.defaults.elements.point.hoverRadius = 5;
    Chart.defaults.elements.point.hitRadius = 8;
    Chart.defaults.elements.line.tension = 0.25;
    Chart.defaults.elements.line.borderWidth = 2;

    /* ── Plot Treatment Colors ──────────────────────────── */
    const PLOT_COLORS = {
        '03':  { bg: '#6b7280', label: 'Nil (Unmanured)' },
        '05':  { bg: '#a855f7', label: 'PKMg only (N₀)' },
        '06':  { bg: '#3b82f6', label: 'N₁PKMg (48 kg N/ha)' },
        '07':  { bg: '#06b6d4', label: 'N₂PKMg (96 kg N/ha)' },
        '08':  { bg: '#22c55e', label: 'N₃PKMg (144 kg N/ha)' },
        '09':  { bg: '#eab308', label: 'N₄PKMg (192 kg N/ha)' },
        '15':  { bg: '#f97316', label: 'N₅PKMg (240 kg N/ha)' },
        '16':  { bg: '#ef4444', label: 'N₆PKMg (288 kg N/ha)' },
        '2.1': { bg: '#854d0e', label: 'FYM + N₂' },
        '2.2': { bg: '#a16207', label: 'FYM (35 t/ha)' },
    };

    /* ── Cultivar Eras ──────────────────────────────────── */
    const CULTIVAR_ERAS = [
        { start: 1843, end: 1900, cultivar: 'Red Club / Red Rostock',   color: '#fef3c7', type: 'landrace' },
        { start: 1901, end: 1927, cultivar: "Squarehead's Master",      color: '#fde68a', type: 'selection' },
        { start: 1928, end: 1939, cultivar: 'Little Joss',              color: '#fcd34d', type: 'bred' },
        { start: 1940, end: 1967, cultivar: 'Cappelle-Desprez',         color: '#fbbf24', type: 'bred' },
        { start: 1968, end: 1978, cultivar: 'Cappelle-Desprez (semi)',   color: '#bfdbfe', type: 'semi-dwarf' },
        { start: 1979, end: 1984, cultivar: 'Flanders',                 color: '#93c5fd', type: 'semi-dwarf' },
        { start: 1985, end: 1990, cultivar: 'Brimstone',                color: '#60a5fa', type: 'semi-dwarf' },
        { start: 1991, end: 1995, cultivar: 'Apollo',                   color: '#3b82f6', type: 'modern' },
        { start: 1996, end: 2012, cultivar: 'Hereward',                 color: '#2563eb', type: 'modern' },
        { start: 2013, end: 2022, cultivar: 'Crusoe',                   color: '#1d4ed8', type: 'modern' },
    ];

    /* ── Epoch Markers ──────────────────────────────────── */
    const EPOCH_EVENTS = [
        { year: 1926, label: '1926: Fallowing begins',        color: '#f59e0b' },
        { year: 1968, label: '1968: Semi-dwarf + 10 sections', color: '#ef4444' },
        { year: 1985, label: '1985: N₅/N₆ added',             color: '#8b5cf6' },
    ];

    /* ── Helper: Deep Merge ─────────────────────────────── */
    function deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    /* ── Chart Creator: Time Series ─────────────────────── */
    function createTimeSeriesChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const defaults = {
            type: 'line',
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Year', color: textColor() },
                        ticks: { callback: v => v.toString(), color: textColor() },
                        grid: { color: gridColor() },
                    },
                    y: {
                        title: { display: true, text: 'Grain Yield (t/ha @ 85% DM)', color: textColor() },
                        beginAtZero: true,
                        ticks: { color: textColor() },
                        grid: { color: gridColor() },
                    },
                },
                interaction: { mode: 'nearest', intersect: false },
                plugins: {
                    legend: { labels: { color: textColor() } },
                },
            },
        };

        const merged = deepMerge(defaults, config);
        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);
        return chart;
    }

    /* ── Chart Creator: Dual Axis ───────────────────────── */
    function createDualAxisChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const defaults = {
            type: 'line',
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Year', color: textColor() },
                        ticks: { callback: v => v.toString(), color: textColor() },
                        grid: { color: gridColor() },
                    },
                    yLeft: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        ticks: { color: textColor() },
                        grid: { color: gridColor() },
                        title: { display: true, color: textColor() },
                    },
                    yRight: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: textColor() },
                        title: { display: true, color: textColor() },
                    },
                },
                interaction: { mode: 'nearest', intersect: false },
                plugins: {
                    legend: { labels: { color: textColor() } },
                },
            },
        };

        const merged = deepMerge(defaults, config);
        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);
        return chart;
    }

    /* ── Chart Creator: Bar Chart ───────────────────────── */
    function createBarChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const defaults = {
            type: 'bar',
            options: {
                scales: {
                    x: {
                        ticks: { color: textColor() },
                        grid: { color: gridColor() },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor() },
                        grid: { color: gridColor() },
                        title: { display: true, color: textColor() },
                    },
                },
                plugins: {
                    legend: { labels: { color: textColor() } },
                },
            },
        };

        const merged = deepMerge(defaults, config);
        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);
        return chart;
    }

    /* ── Chart Creator: Scatter with Regression ─────────── */
    function createScatterChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const defaults = {
            type: 'scatter',
            options: {
                scales: {
                    x: {
                        ticks: { color: textColor() },
                        grid: { color: gridColor() },
                        title: { display: true, color: textColor() },
                    },
                    y: {
                        ticks: { color: textColor() },
                        grid: { color: gridColor() },
                        title: { display: true, color: textColor() },
                    },
                },
                plugins: {
                    legend: { labels: { color: textColor() } },
                },
                elements: { point: { radius: 4, hoverRadius: 7 } },
            },
        };

        const merged = deepMerge(defaults, config);
        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);
        return chart;
    }

    /* ── Annotation: Cultivar Era Bands ──────────────────── */
    function buildCultivarAnnotations() {
        const annotations = {};
        CULTIVAR_ERAS.forEach((era, i) => {
            annotations[`era_${i}`] = {
                type: 'box',
                xMin: era.start,
                xMax: era.end,
                backgroundColor: (isDark() ? era.color + '25' : era.color + '40'),
                borderWidth: 0,
                z: -1,
            };
        });
        return annotations;
    }

    /* ── Annotation: Epoch Lines ─────────────────────────── */
    function buildEpochAnnotations() {
        const annotations = {};
        EPOCH_EVENTS.forEach((e, i) => {
            annotations[`epoch_${i}`] = {
                type: 'line',
                xMin: e.year,
                xMax: e.year,
                borderColor: e.color,
                borderWidth: 2,
                borderDash: [6, 4],
                z: 0,
                label: {
                    display: true,
                    content: e.label,
                    position: 'start',
                    backgroundColor: e.color,
                    color: '#fff',
                    font: { size: 10, weight: '600' },
                    padding: { top: 3, bottom: 3, left: 6, right: 6 },
                    borderRadius: 4,
                },
            };
        });
        return annotations;
    }

    /* ── Convenience: Add All Annotations ────────────────── */
    function addAnnotations(chart, { cultivars = true, epochs = true } = {}) {
        if (!chart.options.plugins) chart.options.plugins = {};
        if (!chart.options.plugins.annotation) chart.options.plugins.annotation = {};
        const existing = chart.options.plugins.annotation.annotations || {};
        chart.options.plugins.annotation.annotations = {
            ...existing,
            ...(cultivars ? buildCultivarAnnotations() : {}),
            ...(epochs ? buildEpochAnnotations() : {}),
        };
        chart.update();
    }

    /* ── Regression Helpers ──────────────────────────────── */
    function linearRegression(points) {
        if (!points || points.length < 3) return null;
        const xs = points.map(p => Array.isArray(p) ? p[0] : (p && p.x !== undefined ? p.x : p[0]));
        const ys = points.map(p => Array.isArray(p) ? p[1] : (p && p.y !== undefined ? p.y : p[1]));
        const n = xs.length;
        const sumX = xs.reduce((a, b) => a + b, 0);
        const sumY = ys.reduce((a, b) => a + b, 0);
        const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
        const sumX2 = xs.reduce((a, x) => a + x * x, 0);
        const denom = (n * sumX2 - sumX * sumX);
        const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
        const intercept = (sumY - slope * sumX) / n;
        // Pearson r
        const meanX = sumX / n;
        const meanY = sumY / n;
        const ssX = xs.reduce((a, x) => a + (x - meanX) ** 2, 0);
        const ssY = ys.reduce((a, y) => a + (y - meanY) ** 2, 0);
        const ssXY = xs.reduce((a, x, i) => a + (x - meanX) * (ys[i] - meanY), 0);
        const rDenom = Math.sqrt(ssX * ssY);
        const r = rDenom !== 0 ? ssXY / rDenom : 0;
        return { slope: slope || 0, intercept: intercept || 0, r: r || 0, r2: (r * r) || 0, n };
    }

    function regressionLine(points, reg) {
        if (!reg || !points || points.length === 0) return [];
        const xs = points.map(p => Array.isArray(p) ? p[0] : (p && p.x !== undefined ? p.x : p[0]));
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        return [
            { x: minX, y: reg.slope * minX + reg.intercept },
            { x: maxX, y: reg.slope * maxX + reg.intercept },
        ];
    }

    /* ── Dataset Builder Helpers ─────────────────────────── */
    function makeYieldDataset(plotId, data, options = {}) {
        const pc = PLOT_COLORS[plotId];
        return {
            label: pc ? pc.label : `Plot ${plotId}`,
            data: data,
            borderColor: pc ? pc.bg : '#6b7280',
            backgroundColor: (pc ? pc.bg : '#6b7280') + '20',
            fill: false,
            pointRadius: 1.5,
            ...options,
        };
    }

    /* ── Export ──────────────────────────────────────────── */
    window.BK = window.BK || {};
    window.BK.PLOT_COLORS = PLOT_COLORS;
    window.BK.CULTIVAR_ERAS = CULTIVAR_ERAS;
    window.BK.EPOCH_EVENTS = EPOCH_EVENTS;
    window.BK.createTimeSeriesChart = createTimeSeriesChart;
    window.BK.createDualAxisChart = createDualAxisChart;
    window.BK.createBarChart = createBarChart;
    window.BK.createScatterChart = createScatterChart;
    window.BK.addAnnotations = addAnnotations;
    window.BK.buildCultivarAnnotations = buildCultivarAnnotations;
    window.BK.buildEpochAnnotations = buildEpochAnnotations;
    window.BK.linearRegression = linearRegression;
    window.BK.regressionLine = regressionLine;
    window.BK.makeYieldDataset = makeYieldDataset;
})();
