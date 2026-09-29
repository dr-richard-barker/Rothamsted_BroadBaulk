/**
 * Broadbalk Explorer — Chart Factory
 * Provides consistent Chart.js defaults, dual-axis helpers,
 * cultivar-era annotations, and epoch markers.
 */
(function () {
    'use strict';

    if (typeof window !== 'undefined') {
        window.BK = window.BK || {};
        window.BK._charts = window.BK._charts || [];
    }

    /* ── Global Chart.js Defaults ───────────────────────── */
    const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const textColor = () => isDark() ? '#d6d3d1' : '#57534e';
    const gridColor = () => isDark() ? '#44403c' : '#e7e5e4';

    if (typeof Chart !== 'undefined' && Chart.defaults) {
        Chart.defaults.font.family = "'Karla', 'Inter', 'system-ui', '-apple-system', sans-serif";
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

        Chart.defaults.elements.point.radius = 2.5;
        Chart.defaults.elements.point.hoverRadius = 6;
        Chart.defaults.elements.point.hitRadius = 8;
        Chart.defaults.elements.line.tension = 0.25;
        Chart.defaults.elements.line.borderWidth = 2;
    }

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
        if (!source || typeof source !== 'object') return result;
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    /* ── Point Normalizer ───────────────────────────────── */
    function normalizePoint(pt) {
        if (!pt) return null;
        if (typeof pt !== 'object') return pt;
        if (Array.isArray(pt)) {
            const x = Number(pt[0]);
            const y = pt[1] !== null && pt[1] !== undefined ? Number(pt[1]) : null;
            return isNaN(x) ? null : { x, y };
        }
        let x, y;
        if (pt.x !== undefined) {
            x = pt.x;
            y = pt.y;
        } else if (pt.year !== undefined) {
            x = pt.year;
            y = pt.yield !== undefined ? pt.yield : (pt.v !== undefined ? pt.v : (pt.value !== undefined ? pt.value : pt.y));
        } else if (pt.v !== undefined) {
            // format: { y: 1852, v: 1.4 }
            x = pt.y;
            y = pt.v;
        } else {
            x = pt.x;
            y = pt.y;
        }
        if (x === undefined || isNaN(Number(x))) return null;
        return {
            x: Number(x),
            y: y !== null && y !== undefined && !isNaN(Number(y)) ? Number(y) : null
        };
    }

    /* ── Dataset Builder Helpers ─────────────────────────── */
    function makeYieldDataset(plotId, data, options = {}) {
        const pc = PLOT_COLORS[plotId];
        const normalized = Array.isArray(data)
            ? data.map(normalizePoint).filter(p => p !== null)
            : [];
        return {
            label: pc ? pc.label : `Plot ${plotId}`,
            data: normalized,
            borderColor: pc ? pc.bg : '#6b7280',
            backgroundColor: (pc ? pc.bg : '#6b7280') + '20',
            fill: false,
            pointRadius: 2.5,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0.2,
            ...options,
        };
    }

    /* ── Chart Creator: Time Series ─────────────────────── */
    function createTimeSeriesChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const rawDatasets = (config.data && config.data.datasets) || config.datasets || [];
        const rawLabels = (config.data && config.data.labels) || config.labels || [];

        // Normalize datasets for linear x-axis
        const normalizedDatasets = rawDatasets.map(ds => {
            const copy = { ...ds };
            if (Array.isArray(copy.data)) {
                // If data is numbers and labels are provided, pair them as {x, y}
                if (rawLabels.length > 0 && typeof copy.data[0] === 'number') {
                    copy.data = copy.data.map((val, idx) => ({
                        x: Number(rawLabels[idx]),
                        y: val !== null && val !== undefined ? Number(val) : null
                    })).filter(p => !isNaN(p.x));
                } else {
                    copy.data = copy.data.map(normalizePoint).filter(p => p !== null);
                }
            }
            if (!copy.yAxisID) copy.yAxisID = 'y';
            return copy;
        });

        const defaults = {
            type: 'line',
            data: {
                datasets: normalizedDatasets,
                labels: rawLabels,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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

        const cleanConfig = { ...config };
        delete cleanConfig.datasets;
        delete cleanConfig.labels;

        // Support root-level y / yLeft configuration
        if (config.y || config.yLeft) {
            cleanConfig.options = cleanConfig.options || {};
            cleanConfig.options.scales = cleanConfig.options.scales || {};
            cleanConfig.options.scales.y = cleanConfig.options.scales.y || {};
            const yConf = config.y || config.yLeft;
            if (typeof yConf === 'string') {
                cleanConfig.options.scales.y.title = { display: true, text: yConf };
            } else if (yConf.title) {
                cleanConfig.options.scales.y.title = typeof yConf.title === 'string'
                    ? { display: true, text: yConf.title }
                    : yConf.title;
            }
        }

        const merged = deepMerge(defaults, cleanConfig);
        merged.data = {
            datasets: normalizedDatasets,
            labels: rawLabels,
        };

        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);

        if (config.annotations) {
            addAnnotations(chart, typeof config.annotations === 'object' ? config.annotations : {});
        }

        return chart;
    }

    /* ── Chart Creator: Dual Axis ───────────────────────── */
    function createDualAxisChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const rawDatasets = (config.data && config.data.datasets) || config.datasets || [];
        const rawLabels = (config.data && config.data.labels) || config.labels || [];

        // In dual-axis mode, datasets without yAxisID or with 'y' default to 'yLeft'
        const normalizedDatasets = rawDatasets.map(ds => {
            const copy = { ...ds };
            if (Array.isArray(copy.data)) {
                if (rawLabels.length > 0 && typeof copy.data[0] === 'number') {
                    copy.data = copy.data.map((val, idx) => ({
                        x: Number(rawLabels[idx]),
                        y: val !== null && val !== undefined ? Number(val) : null
                    })).filter(p => !isNaN(p.x));
                } else {
                    copy.data = copy.data.map(normalizePoint).filter(p => p !== null);
                }
            }
            if (!copy.yAxisID || copy.yAxisID === 'y') {
                copy.yAxisID = 'yLeft';
            }
            return copy;
        });

        const defaults = {
            type: 'line',
            data: {
                datasets: normalizedDatasets,
                labels: rawLabels,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        title: { display: true, text: 'Grain Yield (t/ha @ 85% DM)', color: textColor() },
                    },
                    yRight: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: textColor() },
                        title: { display: true, text: '', color: textColor() },
                    },
                },
                interaction: { mode: 'nearest', intersect: false },
                plugins: {
                    legend: { labels: { color: textColor() } },
                },
            },
        };

        const cleanConfig = { ...config };
        delete cleanConfig.datasets;
        delete cleanConfig.labels;

        if (config.yLeft) {
            cleanConfig.options = cleanConfig.options || {};
            cleanConfig.options.scales = cleanConfig.options.scales || {};
            cleanConfig.options.scales.yLeft = cleanConfig.options.scales.yLeft || {};
            if (typeof config.yLeft === 'string') {
                cleanConfig.options.scales.yLeft.title = { display: true, text: config.yLeft };
            } else if (config.yLeft.title) {
                cleanConfig.options.scales.yLeft.title = typeof config.yLeft.title === 'string'
                    ? { display: true, text: config.yLeft.title }
                    : config.yLeft.title;
            }
        }

        if (config.yRight) {
            cleanConfig.options = cleanConfig.options || {};
            cleanConfig.options.scales = cleanConfig.options.scales || {};
            cleanConfig.options.scales.yRight = cleanConfig.options.scales.yRight || {};
            if (typeof config.yRight === 'string') {
                cleanConfig.options.scales.yRight.title = { display: true, text: config.yRight };
            } else if (config.yRight.title) {
                cleanConfig.options.scales.yRight.title = typeof config.yRight.title === 'string'
                    ? { display: true, text: config.yRight.title }
                    : config.yRight.title;
            }
        }

        const merged = deepMerge(defaults, cleanConfig);
        merged.data = {
            datasets: normalizedDatasets,
            labels: rawLabels,
        };

        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);

        if (config.annotations) {
            addAnnotations(chart, {
                cultivars: true,
                epochs: true,
                yScaleID: 'yLeft',
                ...(typeof config.annotations === 'object' ? config.annotations : {})
            });
        }

        return chart;
    }

    /* ── Chart Creator: Bar Chart ───────────────────────── */
    function createBarChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const rawDatasets = (config.data && config.data.datasets) || config.datasets || [];
        const rawLabels = (config.data && config.data.labels) || config.labels || [];

        const defaults = {
            type: 'bar',
            data: {
                datasets: rawDatasets,
                labels: rawLabels,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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

        const cleanConfig = { ...config };
        delete cleanConfig.datasets;
        delete cleanConfig.labels;

        const merged = deepMerge(defaults, cleanConfig);
        merged.data = {
            datasets: rawDatasets,
            labels: rawLabels,
        };

        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);
        return chart;
    }

    /* ── Chart Creator: Scatter with Regression ─────────── */
    function createScatterChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) { console.warn(`Canvas #${canvasId} not found`); return null; }

        const rawDatasets = (config.data && config.data.datasets) || config.datasets || [];
        const rawLabels = (config.data && config.data.labels) || config.labels || [];

        const defaults = {
            type: 'scatter',
            data: {
                datasets: rawDatasets,
                labels: rawLabels,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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

        const cleanConfig = { ...config };
        delete cleanConfig.datasets;
        delete cleanConfig.labels;

        const merged = deepMerge(defaults, cleanConfig);
        merged.data = {
            datasets: rawDatasets,
            labels: rawLabels,
        };

        const chart = new Chart(ctx, merged);
        window.BK._charts.push(chart);
        return chart;
    }

    /* ── Annotation: Cultivar Era Bands ──────────────────── */
    function buildCultivarAnnotations(xScaleID = 'x', yScaleID) {
        const annotations = {};
        CULTIVAR_ERAS.forEach((era, i) => {
            const anno = {
                type: 'box',
                xScaleID: xScaleID,
                xMin: era.start,
                xMax: era.end,
                backgroundColor: (isDark() ? era.color + '25' : era.color + '40'),
                borderWidth: 0,
                z: -1,
            };
            if (yScaleID) {
                anno.yScaleID = yScaleID;
            }
            annotations[`era_${i}`] = anno;
        });
        return annotations;
    }

    /* ── Annotation: Epoch Lines ─────────────────────────── */
    function buildEpochAnnotations(xScaleID = 'x', yScaleID) {
        const annotations = {};
        EPOCH_EVENTS.forEach((e, i) => {
            const anno = {
                type: 'line',
                scaleID: xScaleID,
                xScaleID: xScaleID,
                value: e.year,
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
            if (yScaleID) {
                anno.yScaleID = yScaleID;
            }
            annotations[`epoch_${i}`] = anno;
        });
        return annotations;
    }

    /* ── Convenience: Add All Annotations ────────────────── */
    function addAnnotations(chart, { cultivars = true, epochs = true, xScaleID, yScaleID } = {}) {
        if (!chart || !chart.options) return;
        if (!chart.options.plugins) chart.options.plugins = {};
        if (!chart.options.plugins.annotation) chart.options.plugins.annotation = {};

        // Resolve scale IDs
        const xId = xScaleID || (chart.options.scales && chart.options.scales.x ? 'x' : 'x');
        const yId = yScaleID || (chart.options.scales && chart.options.scales.yLeft ? 'yLeft' : (chart.options.scales && chart.options.scales.y ? 'y' : undefined));

        const existing = chart.options.plugins.annotation.annotations || {};
        try {
            chart.options.plugins.annotation.annotations = {
                ...existing,
                ...(cultivars ? buildCultivarAnnotations(xId, yId) : {}),
                ...(epochs ? buildEpochAnnotations(xId, yId) : {}),
            };
            chart.update('none');
        } catch (err) {
            console.warn('Broadbalk Chart Factory: Unable to render annotations:', err);
        }
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
    window.BK.normalizePoint = normalizePoint;
})();
