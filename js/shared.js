/**
 * Broadbalk Explorer — Shared Navigation & Utilities
 * Renders the site navigation dynamically on every page.
 * Handles dark/light mode toggle and mobile menu.
 */
(function () {
    'use strict';

    const SITE_TITLE = 'Broadbalk Explorer';
    const SITE_EMOJI = '🌾';

    const PAGES = [
        { id: 'dashboard', label: 'Dashboard',   href: 'index.html' },
        { id: 'co2',       label: 'CO₂ & Yields', href: 'co2.html' },
        { id: 'thermal',   label: 'Thermal',      href: 'thermal.html' },
        { id: 'genotype',  label: 'Genotype',     href: 'genotype.html' },
        { id: 'soc',       label: 'Soil Carbon',  href: 'soc.html' },
        { id: 'nutrients', label: 'Nutrients',    href: 'nutrients.html' },
        { id: 'nitrogen',  label: 'Nitrogen',     href: 'nitrogen.html' },
        { id: 'data',      label: 'Data Access',  href: 'data.html' },
    ];

    /* ── Theme ──────────────────────────────────────────── */
    function initTheme() {
        const stored = localStorage.getItem('bk-theme');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('bk-theme', isDark ? 'dark' : 'light');
        // Update Chart.js colors if any charts exist
        if (window.BK && window.BK._charts) {
            const textColor = isDark ? '#d6d3d1' : '#57534e';
            const gridColor = isDark ? '#44403c' : '#e7e5e4';
            window.BK._charts.forEach(chart => {
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) scale.ticks.color = textColor;
                        if (scale.title) scale.title.color = textColor;
                        if (scale.grid) scale.grid.color = gridColor;
                    });
                }
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                chart.update('none');
            });
        }
    }

    /* ── Current Page Detection ─────────────────────────── */
    function getCurrentPageId() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        if (filename === '' || filename === 'index.html') return 'dashboard';
        const page = PAGES.find(p => p.href === filename);
        return page ? page.id : 'dashboard';
    }

    /* ── Navigation Renderer ────────────────────────────── */
    function renderNav() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const currentId = getCurrentPageId();

        nav.className = 'bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50';
        nav.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-2xl">${SITE_EMOJI}</span>
                        <a href="index.html" class="font-bold text-lg text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                            ${SITE_TITLE}
                        </a>
                    </div>

                    <!-- Desktop Links -->
                    <div class="hidden lg:flex items-center gap-0.5">
                        ${PAGES.map(p => `
                            <a href="${p.href}"
                               class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                      ${p.id === currentId
                                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-200'
                                      }">${p.label}</a>
                        `).join('')}
                        <button id="theme-toggle" title="Toggle dark mode"
                                class="ml-3 p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                            <span class="dark:hidden text-lg">🌙</span>
                            <span class="hidden dark:inline text-lg">☀️</span>
                        </button>
                    </div>

                    <!-- Mobile Menu Button -->
                    <div class="lg:hidden flex items-center gap-2">
                        <button id="mobile-theme-toggle" title="Toggle dark mode"
                                class="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700">
                            <span class="dark:hidden text-lg">🌙</span>
                            <span class="hidden dark:inline text-lg">☀️</span>
                        </button>
                        <button id="mobile-menu-btn"
                                class="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path id="menu-icon-open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                                <path id="menu-icon-close" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div id="mobile-menu" class="lg:hidden hidden border-t border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-800/95 backdrop-blur-md">
                <div class="px-4 py-3 space-y-1">
                    ${PAGES.map(p => `
                        <a href="${p.href}"
                           class="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                  ${p.id === currentId
                                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                                  }">${p.label}</a>
                    `).join('')}
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
        document.getElementById('mobile-theme-toggle')?.addEventListener('click', toggleTheme);
        document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
            const menu = document.getElementById('mobile-menu');
            const iconOpen = document.getElementById('menu-icon-open');
            const iconClose = document.getElementById('menu-icon-close');
            if (menu) {
                menu.classList.toggle('hidden');
                iconOpen?.classList.toggle('hidden');
                iconClose?.classList.toggle('hidden');
            }
        });
    }

    /* ── Footer Renderer ────────────────────────────────── */
    function renderFooter() {
        const footer = document.getElementById('site-footer');
        if (!footer) return;

        footer.className = 'border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 mt-16';
        footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="font-semibold text-stone-900 dark:text-stone-100 mb-2">${SITE_EMOJI} ${SITE_TITLE}</h3>
                        <p class="text-sm text-stone-500 dark:text-stone-400">
                            Exploring 180+ years of the world's longest-running agricultural experiment.
                            Data sourced from the electronic Rothamsted Archive (e-RA).
                        </p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-stone-900 dark:text-stone-100 mb-2">Data Sources</h3>
                        <ul class="text-sm text-stone-500 dark:text-stone-400 space-y-1">
                            <li><a href="https://www.era.rothamsted.ac.uk/" target="_blank" rel="noopener" class="hover:text-emerald-600 dark:hover:text-emerald-400 underline">e-RA — Electronic Rothamsted Archive</a></li>
                            <li><a href="https://www.rothamsted.ac.uk/" target="_blank" rel="noopener" class="hover:text-emerald-600 dark:hover:text-emerald-400 underline">Rothamsted Research</a></li>
                            <li><a href="https://gml.noaa.gov/ccgg/trends/" target="_blank" rel="noopener" class="hover:text-emerald-600 dark:hover:text-emerald-400 underline">NOAA GML — CO₂ Records</a></li>
                            <li><a href="https://open-meteo.com/" target="_blank" rel="noopener" class="hover:text-emerald-600 dark:hover:text-emerald-400 underline">Open-Meteo Historical Weather API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold text-stone-900 dark:text-stone-100 mb-2">Attribution</h3>
                        <p class="text-sm text-stone-500 dark:text-stone-400">
                            Broadbalk datasets are Open Access under
                            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" class="underline hover:text-emerald-600 dark:hover:text-emerald-400">CC BY 4.0</a>.
                            Supported by RLTE-NBRI (BBSRC BBS/E/RH/23NB0007).
                        </p>
                    </div>
                </div>
                <div class="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700 text-center text-xs text-stone-400 dark:text-stone-500">
                    © ${new Date().getFullYear()} Broadbalk Explorer · Built with Chart.js, Tailwind CSS & Open Data
                </div>
            </div>
        `;
    }

    /* ── Collapsible Sections ───────────────────────────── */
    function initCollapsibles() {
        document.querySelectorAll('.collapsible-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.target);
                if (target) {
                    target.classList.toggle('open');
                    btn.classList.toggle('open');
                }
            });
        });
    }

    /* ── Utility: Format Numbers ────────────────────────── */
    function fmt(n, decimals = 1) {
        if (n == null || isNaN(n)) return '—';
        return Number(n).toFixed(decimals);
    }

    function fmtPct(n, decimals = 0) {
        if (n == null || isNaN(n)) return '—';
        return (n > 0 ? '+' : '') + Number(n).toFixed(decimals) + '%';
    }

    /* ── Initialize ─────────────────────────────────────── */
    initTheme();

    function init() {
        renderNav();
        renderFooter();
        initCollapsibles();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ── Export to global BK namespace ───────────────────── */
    window.BK = window.BK || {};
    window.BK.PAGES = PAGES;
    window.BK.toggleTheme = toggleTheme;
    window.BK.getCurrentPageId = getCurrentPageId;
    window.BK.fmt = fmt;
    window.BK.fmtPct = fmtPct;
    window.BK._charts = [];  // Registry for theme-aware chart updates
})();
