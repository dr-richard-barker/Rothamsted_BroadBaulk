/**
 * Broadbalk Explorer — Data Loader
 * CSV/JSON fetch with caching, and data export utilities.
 * Uses PapaParse for CSV parsing (loaded via CDN).
 */
(function () {
    'use strict';

    const cache = {};

    /**
     * Load and parse a CSV file. Returns an array of objects (header-keyed rows).
     * @param {string} url - URL or relative path to the CSV file
     * @returns {Promise<Object[]>}
     */
    async function loadCSV(url) {
        if (cache[url]) return cache[url];

        return new Promise((resolve, reject) => {
            if (typeof Papa === 'undefined') {
                reject(new Error('PapaParse not loaded'));
                return;
            }
            Papa.parse(url, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: 'greedy',
                complete: (results) => {
                    cache[url] = results.data;
                    resolve(results.data);
                },
                error: (err) => reject(err),
            });
        });
    }

    /**
     * Load a JSON file.
     * @param {string} url - URL or relative path to the JSON file
     * @returns {Promise<*>}
     */
    async function loadJSON(url) {
        if (cache[url]) return cache[url];
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
        const data = await resp.json();
        cache[url] = data;
        return data;
    }

    /**
     * Export an array of objects as a CSV file download.
     * @param {Object[]} data
     * @param {string} [filename='broadbalk_export.csv']
     */
    function exportCSV(data, filename) {
        if (!data || data.length === 0) return;
        const csv = typeof Papa !== 'undefined'
            ? Papa.unparse(data)
            : fallbackCSV(data);
        downloadBlob(csv, 'text/csv;charset=utf-8;', filename || 'broadbalk_export.csv');
    }

    /**
     * Export data as a JSON file download.
     * @param {*} data
     * @param {string} [filename='broadbalk_export.json']
     */
    function exportJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        downloadBlob(json, 'application/json', filename || 'broadbalk_export.json');
    }

    function downloadBlob(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }

    function fallbackCSV(data) {
        const keys = Object.keys(data[0]);
        const header = keys.join(',');
        const rows = data.map(row => keys.map(k => {
            const v = row[k];
            return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
        }).join(','));
        return [header, ...rows].join('\n');
    }

    /**
     * Clear the data cache (useful after data updates).
     */
    function clearCache() {
        Object.keys(cache).forEach(k => delete cache[k]);
    }

    /* ── Export ──────────────────────────────────────────── */
    window.BK = window.BK || {};
    window.BK.loadCSV = loadCSV;
    window.BK.loadJSON = loadJSON;
    window.BK.exportCSV = exportCSV;
    window.BK.exportJSON = exportJSON;
    window.BK.clearCache = clearCache;
})();
