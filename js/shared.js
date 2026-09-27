/**
 * Broadbalk Explorer — Shared Navigation, CoSE Theme & Utilities
 * Collaborative Science Environment (CoSE) Edition
 * (Full-width responsive top navigation — no vertical sidebar)
 */
(function () {
    'use strict';

    const SITE_TITLE = 'Broadbalk Explorer';
    const COSE_ORG = 'CoSE';
    const SITE_EMOJI = '🌾';

    const PAGES = [
        { id: 'dashboard', label: 'Dashboard',      href: 'index.html' },
        { id: 'co2',       label: 'CO₂ & Yields',   href: 'co2.html' },
        { id: 'thermal',   label: 'Thermal',         href: 'thermal.html' },
        { id: 'genotype',  label: 'Genotype',        href: 'genotype.html' },
        { id: 'soc',       label: 'Soil Carbon',     href: 'soc.html' },
        { id: 'nutrients', label: 'Nutrients',       href: 'nutrients.html' },
        { id: 'nitrogen',  label: 'Nitrogen',        href: 'nitrogen.html' },
        { id: 'qc',        label: 'ABAI QC Screen',  href: 'qc.html', highlight: true },
        { id: 'data',      label: 'Data Access',     href: 'data.html' },
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
        if (window.BK && window.BK._charts) {
            const textColor = isDark ? '#94a3b8' : '#475569';
            const gridColor = isDark ? '#334155' : '#f1f5f9';
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

        nav.className = 'cose-nav sticky top-0 z-50';
        nav.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Brand / Logo -->
                    <div class="flex items-center gap-3 flex-shrink-0">
                        <a href="index.html" class="flex items-center gap-2 group">
                            <span class="text-2xl transform group-hover:scale-110 transition-transform">${SITE_EMOJI}</span>
                            <div class="flex flex-col">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                        ${SITE_TITLE}
                                    </span>
                                    <span class="cose-badge hidden sm:inline-flex">CoSE</span>
                                </div>
                                <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase hidden sm:block">
                                    Collaborative Science Environment
                                </span>
                            </div>
                        </a>
                    </div>

                    <!-- Desktop Links (Horizontal — No left-hand sidebar) -->
                    <div class="hidden xl:flex items-center gap-0.5">
                        ${PAGES.map(p => `
                            <a href="${p.href}"
                               class="px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all
                                      ${p.id === currentId
                                          ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 font-semibold shadow-xs'
                                          : p.highlight
                                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                                      }">
                                ${p.highlight ? '🧪 ' : ''}${p.label}
                            </a>
                        `).join('')}
                        <button id="theme-toggle" title="Toggle dark/light mode"
                                class="ml-2 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="dark:hidden text-lg">🌙</span>
                            <span class="hidden dark:inline text-lg">☀️</span>
                        </button>
                    </div>

                    <!-- Medium & Mobile Nav Button -->
                    <div class="xl:hidden flex items-center gap-2">
                        <button id="mobile-theme-toggle" title="Toggle dark mode"
                                class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span class="dark:hidden text-lg">🌙</span>
                            <span class="hidden dark:inline text-lg">☀️</span>
                        </button>
                        <button id="mobile-menu-btn"
                                class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path id="menu-icon-open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                                <path id="menu-icon-close" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Mobile Dropdown Menu -->
            <div id="mobile-menu" class="xl:hidden hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md">
                <div class="px-4 py-3 space-y-1.5">
                    ${PAGES.map(p => `
                        <a href="${p.href}"
                           class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                  ${p.id === currentId
                                      ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 font-semibold'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }">${p.highlight ? '🧪 ' : ''}${p.label}</a>
                    `).join('')}
                </div>
            </div>
        `;

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

        footer.className = 'border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-20';
        footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <!-- Column 1: CoSE & Project -->
                    <div class="md:col-span-1">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-2xl">${SITE_EMOJI}</span>
                            <span class="font-bold text-lg text-slate-900 dark:text-slate-100">${SITE_TITLE}</span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                            A Collaborative Science Environment (CoSE) interactive research portal exploring 180+ years of continuous crop yields and agrometeorology.
                        </p>
                        <div class="inline-flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-400 font-semibold">
                            <span>Powered by</span>
                            <a href="https://cosecloud.com" target="_blank" rel="noopener" class="underline hover:text-sky-500">CoSE Cloud</a>
                        </div>
                    </div>

                    <!-- Column 2: Data Narratives -->
                    <div>
                        <h3 class="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-heading">
                            Data Narratives
                        </h3>
                        <ul class="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                            <li><a href="co2.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Atmospheric CO₂ & Yields</a></li>
                            <li><a href="thermal.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Thermal & Heat Stress</a></li>
                            <li><a href="genotype.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Genotype & Cultivar Eras</a></li>
                            <li><a href="soc.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Soil Organic Carbon</a></li>
                            <li><a href="nutrients.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Micronutrient Dilution</a></li>
                            <li><a href="nitrogen.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Nitrogen Response Curve</a></li>
                        </ul>
                    </div>

                    <!-- Column 3: Quality Control & Standards -->
                    <div>
                        <h3 class="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-heading">
                            QC & Standards
                        </h3>
                        <ul class="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                            <li><a href="qc.html" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">🧪 ABAI QC Data Screen</a></li>
                            <li><a href="data.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">e-RA Open Access DOIs</a></li>
                            <li><a href="https://www.era.rothamsted.ac.uk/" target="_blank" rel="noopener" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Electronic Rothamsted Archive</a></li>
                            <li><a href="https://open-meteo.com/" target="_blank" rel="noopener" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Open-Meteo Weather API</a></li>
                        </ul>
                    </div>

                    <!-- Column 4: Licensing & Citation -->
                    <div>
                        <h3 class="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-heading">
                            Attribution & License
                        </h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                            Broadbalk data is Open Access under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" class="underline hover:text-sky-600">CC BY 4.0</a>. Supported by RLTE-NBRI (BBSRC award BBS/E/RH/23NB0007).
                        </p>
                        <p class="text-xs text-slate-400 dark:text-slate-500">
                            © ${new Date().getFullYear()} CoSE · Collaborative Science Environment
                        </p>
                    </div>
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

    /* ── Utilities ──────────────────────────────────────── */
    function fmt(n, decimals = 1) {
        if (n == null || isNaN(n)) return '—';
        return Number(n).toFixed(decimals);
    }

    function fmtPct(n, decimals = 0) {
        if (n == null || isNaN(n)) return '—';
        return (n > 0 ? '+' : '') + Number(n).toFixed(decimals) + '%';
    }

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

    window.BK = window.BK || {};
    window.BK.PAGES = PAGES;
    window.BK.toggleTheme = toggleTheme;
    window.BK.getCurrentPageId = getCurrentPageId;
    window.BK.fmt = fmt;
    window.BK.fmtPct = fmtPct;
    window.BK._charts = [];
})();
