# 🌾 Rothamsted Broadbalk Explorer

[![Deploy to GitHub Pages](https://github.com/OWNER/REPOSITORY/actions/workflows/deploy.yml/badge.svg)](https://github.com/OWNER/REPOSITORY/actions/workflows/deploy.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![e-RA: Open Access](https://img.shields.io/badge/e--RA-Open_Access_Datasets-emerald.svg)](https://www.era.rothamsted.ac.uk/)

An interactive, serverless web application and scientific data exploration hub for the **Broadbalk Wheat Experiment** at Rothamsted Research (Harpenden, UK) — the longest-running continuous agricultural experiment in the world (established in autumn 1843).

This site combines continuous 180+ year crop yield records with integrated agrometeorological indicators, atmospheric $\text{CO}_2$ reconstructions, soil chemistry, and grain nutrition data. It is deployed as a zero-build static site ready for **GitHub Pages**.

---

## 🌟 Key Pages & Scientific Narratives

| Page | File | Key Scientific Hero Takeaway | Primary Data Sources |
|:---|:---|:---|:---|
| **🌾 Dashboard Hub** | [`index.html`](index.html) | Multi-treatment interactive time series (1852–2022) with selectable climate overlays and CSV exporter | e-RA Yields + Open-Meteo Weather |
| **📈 $\text{CO}_2$ & Yields** | [`co2.html`](co2.html) | $+50\%$ atmospheric $\text{CO}_2$ since 1843 contributed only **$+9.4\%$** to yield growth; genetics and nitrogen drove the $+300\%$ increase | Law Dome + Mauna Loa + Sirius Model |
| **🌡️ Thermal Effects** | [`thermal.html`](thermal.html) | Grain weight drops **$4\text{–}8\%$ per $1^\circ\text{C}$** warming post-anthesis; flowering heat stress losses projected to rise $+77\%$ by 2090 | Rothamsted Met Station (1853–present) |
| **🧬 Genotype & Cultivars** | [`genotype.html`](genotype.html) | **$88\%$** of UK wheat yield increases since 1982 are purely genetic; Harvest Index expanded from $32\%$ to $52\%$ | Austin et al. (1980) + Mackay et al. (2011) |
| **🌱 Soil Organic Carbon** | [`soc.html`](soc.html) | Farmyard manure tripled SOC to $\sim 85\text{ t C/ha}$, but plateaued after 120 years — proof of carbon saturation kinetics | e-RA SOC (`KeyRefOABKsoc-02`, RothC) |
| **📉 Nutrient Dilution** | [`nutrients.html`](nutrients.html) | Grain $\text{Zn}$ and $\text{Fe}$ dropped **$20\text{–}30\%$** post-1968 despite stable soil levels — starch accumulation outpaced root uptake | Rothamsted Sample Archive (Fan et al., 2008) |
| **⚡ Nitrogen Curve** | [`nitrogen.html`](nitrogen.html) | First $48\text{ kg N}$ yields $58\text{ kg}$ grain/kg N; beyond optimum ($>192\text{ kg N}$), leaching jumps $+300\%$ | Broadbalk $N_0\text{--}N_6$ Tile Drains (Goulding et al.) |
| **💾 Data Access & DOIs** | [`data.html`](data.html) | Complete catalog of official e-RA DOIs, metadata descriptions, and Python/R programmatic access snippets | e-RA Open Access Datasets |

---

## 🏗️ Architecture & Tech Stack

This project is built to run directly on **GitHub Pages with zero build steps**:

* **Frontend**: Pure HTML5, modern vanilla JavaScript (ES6+), and responsive CSS.
* **Styling**: Tailwind CSS via CDN with full dark/light mode toggle.
* **Charts & Visualizations**: Chart.js 4 + Chart.js Annotation Plugin (dual-axis curves, scatter regressions, grouped bars).
* **In-Browser Analytics**: PapaParse for CSV parsing and simple-statistics for linear regression and Pearson correlation coefficients ($r, R^2$).
* **Automation**: GitHub Actions for one-click deployment and automated monthly weather/climate updates.

```
rothamsted-broadbalk-explorer/
├── index.html                    # Interactive Dashboard Hub
├── co2.html                      # CO₂ & Yield Trends Narrative
├── thermal.html                  # Thermal & Climate Effects Narrative
├── genotype.html                 # Genotype & Cultivar Eras Narrative
├── soc.html                      # Soil Organic Carbon Narrative
├── nutrients.html                # Micronutrient Dilution Narrative
├── nitrogen.html                 # Nitrogen Response Curve Narrative
├── data.html                     # Data Access & DOI Reference Page
├── css/
│   └── style.css                 # Custom styling, transitions & themes
├── js/
│   ├── shared.js                 # Universal top navigation, footer, theme switcher
│   ├── data-loader.js            # Cached CSV/JSON loaders & file exporter
│   ├── chart-factory.js          # Chart.js preset factory, annotations & regressions
│   ├── dashboard.js              # Dashboard time-series & climate overlay logic
│   ├── co2.js                    # Dual-axis CO₂ & attribution charts
│   ├── thermal.js                # Temperature vs. grain weight regression
│   ├── genotype.js               # Cultivar era annotations & harvest index
│   ├── soc.js                    # 180-year SOC kinetics & 4-per-1000 benchmark
│   ├── nutrients.js              # Grain mineral dilution vs. yield
│   └── nitrogen.js               # Mitscherlich yield & nitrate leaching curves
├── data/
│   ├── meta/                     # Treatment mappings, section designs & cultivar eras
│   ├── yields/                   # Benchmark historical crop yield series
│   ├── climate/                  # Rothamsted climate indices & global CO₂ series
│   ├── soils/                    # 1843–2015 Soil organic carbon records
│   └── nutrients/                # 1845–2005 Grain trace element series
├── data-pipeline/                # Optional Python ETL scripts
│   ├── fetch_era_yields.py       # e-RA yield downloader & harmonizer
│   ├── fetch_climate_data.py     # Open-Meteo daily weather fetcher
│   ├── build_co2_composite.py    # Law Dome + Mauna Loa CO₂ splicer
│   └── requirements.txt          # Python dependencies for ETL
├── .github/workflows/
│   ├── deploy.yml                # Native GitHub Pages deployment action
│   └── update-weather.yml        # Monthly cron weather & CO₂ updater
└── img/
    └── favicon.svg               # SVG Wheat Ear Favicon
```

---

## 🚀 Quick Start & Deployment to GitHub Pages

### Option 1: Deploy in 2 Minutes via GitHub Web UI

1. Create a new GitHub repository (e.g. `broadbalk-explorer`).
2. Push or upload this codebase to the `main` branch.
3. In your repository on GitHub, navigate to **Settings** > **Pages**.
4. Under **Build and deployment** > **Source**, choose **GitHub Actions** (the included `.github/workflows/deploy.yml` will automatically build and publish).
5. Your site is live immediately at `https://<your-username>.github.io/<repo-name>/`!

### Option 2: Run Locally (Any Static HTTP Server)

Because the project requires no compilation or package installation, you can serve it with any local web server:

```bash
# Using Python 3 built-in server:
python3 -m http.server 8000

# Or using Node.js npx:
npx serve .
```

Open `http://localhost:8000` in your web browser.

---

## 🐍 Running the Optional Data Pipeline

The web application already includes pre-packaged, validated benchmark datasets for offline instant rendering. If you wish to update or query the raw upstream APIs:

```bash
cd data-pipeline
pip install -r requirements.txt

# Fetch latest weather and calculate harvest-year indices (Open-Meteo):
python fetch_climate_data.py

# Rebuild composite Law Dome + Mauna Loa CO₂ records:
python build_co2_composite.py

# Harmonize downloaded e-RA yield packages:
python fetch_era_yields.py
```

---

## 📖 Primary e-RA Datasets & DOIs

All underlying experimental data are published by **Rothamsted Research** via the [Electronic Rothamsted Archive (e-RA)](https://www.era.rothamsted.ac.uk/):

1. **Broadbalk Wheat Annual Grain and Straw Yields 1968–2022**  
   DOI: [10.23637/rbk1-yld6822-01](https://doi.org/10.23637/rbk1-yld6822-01)
2. **Broadbalk Wheat Annual Grain and Straw Yields 1926–1967**  
   DOI: [10.23637/rbk1-yld2667-01](https://doi.org/10.23637/rbk1-yld2667-01)
3. **Broadbalk Wheat Annual Grain and Straw Yields 1852–1925**  
   DOI: [10.23637/rbk1-1796346264-1](https://doi.org/10.23637/rbk1-1796346264-1)
4. **Broadbalk Mean Long-Term Yields of Winter Wheat 1852–2022**  
   DOI: [10.23637/rbk1/meanWWYields1852-2022-03](https://doi.org/10.23637/rbk1/meanWWYields1852-2022-03)
5. **Broadbalk Wheat Grain Micronutrients 1845–2005**  
   DOI: [10.23637/rbk1-trace2005-01](https://doi.org/10.23637/rbk1-trace2005-01)
6. **Broadbalk Crop Nutrient Content (Wheat 1968–2017)**  
   DOI: [10.23637/rbk1-BKNUTRW-01](https://doi.org/10.23637/rbk1-BKNUTRW-01) (v2: `02`)
7. **Broadbalk Soil Organic Carbon Content 1843–2015**  
   DOI: [10.23637/KeyRefOABKsoc-02](https://doi.org/10.23637/KeyRefOABKsoc-02)
8. **Broadbalk Soil Chemical Properties 1843–2021**  
   DOI: [10.23637/rbk1-bksoils-01](https://doi.org/10.23637/rbk1-bksoils-01)
9. **Rothamsted Monthly & Annual Rainfall 1853–2024**  
   DOI: [10.23637/rmsTMArain1853-2024-01](https://doi.org/10.23637/rmsTMArain1853-2024-01)
10. **Rothamsted Monthly & Annual Air Temperature 1878–2024**  
    DOI: [10.23637/rmsMAAirTemp1878-2024-01](https://doi.org/10.23637/rmsMAAirTemp1878-2024-01)

---

## 📜 Attribution & Licensing

* **Broadbalk Open Access Datasets**: Licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). Data produced by Rothamsted Research under the Rothamsted Long-Term Experiments National Bioscience Research Infrastructure (RLTE-NBRI), supported by the UK Biotechnology and Biological Sciences Research Council (BBSRC; award BBS/E/RH/23NB0007).
* **Climate Reanalysis**: Powered by [Open-Meteo Historical Weather API](https://open-meteo.com/) (Copernicus ERA5 / Met Office).
* **Atmospheric $\text{CO}_2$**: Law Dome ice core records (Etheridge et al.) and NOAA Global Monitoring Laboratory (GML) Mauna Loa Observatory records.
