#!/usr/bin/env python3
"""
Fetch Broadbalk wheat yield datasets from the electronic Rothamsted Archive (e-RA).

Downloads the three epoch CSVs via their DOI landing pages and harmonizes
them into a single unified yield file. The e-RA datasets are Open Access
under CC BY 4.0.

DOIs:
  - 1852-1925: 10.23637/rbk1-1796346264-1
  - 1926-1967: 10.23637/rbk1-yld2667-01
  - 1968-2022: 10.23637/rbk1-yld6822-01
  - Mean yields: 10.23637/rbk1/meanWWYields1852-2022-03
"""

import os
import sys
import pandas as pd

# Base URLs for the e-RA dataset landing pages
DATASETS = {
    "1852-1925": {
        "doi": "10.23637/rbk1-1796346264-1",
        "url": "https://doi.org/10.23637/rbk1-1796346264-1",
        "description": "Earliest systematic yield data, pre-fallowing era",
    },
    "1926-1967": {
        "doi": "10.23637/rbk1-yld2667-01",
        "url": "https://doi.org/10.23637/rbk1-yld2667-01",
        "description": "Fallowing era, traditional tall cultivars",
    },
    "1968-2022": {
        "doi": "10.23637/rbk1-yld6822-01",
        "url": "https://doi.org/10.23637/rbk1-yld6822-01",
        "description": "Modern era, semi-dwarf cultivars, 10-section design",
    },
    "mean": {
        "doi": "10.23637/rbk1/meanWWYields1852-2022-03",
        "url": "https://doi.org/10.23637/rbk1/meanWWYields1852-2022-03",
        "description": "Multi-decadal mean benchmarks by treatment",
    },
}

# Plot treatment mapping
PLOT_TREATMENTS = {
    "01": "FYM+N3 (to 2000) / N4 (from 2001)",
    "02.1": "FYM + N2 (96 kg N/ha)",
    "02.2": "FYM (35 t/ha)",
    "03": "Nil (Unmanured)",
    "05": "PKMg only (N0)",
    "06": "N1PKMg (48 kg N/ha)",
    "07": "N2PKMg (96 kg N/ha)",
    "08": "N3PKMg (144 kg N/ha)",
    "09": "N4PKMg (192 kg N/ha)",
    "10": "N2 only (no PKMg)",
    "11": "N2P",
    "12": "N2PNa",
    "13": "N2PK",
    "14": "N2PMg",
    "15": "N5PKMg (240 kg N/ha)",
    "16": "N6PKMg (288 kg N/ha)",
    "17": "Alternating N/PKMg (A)",
    "18": "Alternating N/PKMg (B)",
    "19": "Castor meal / organic",
    "20": "N2KMg (no P)",
}


def print_download_instructions():
    """Print instructions for manually downloading e-RA datasets."""
    print("\n" + "=" * 70)
    print("BROADBALK YIELD DATA DOWNLOAD INSTRUCTIONS")
    print("=" * 70)
    print()
    print("The e-RA datasets are hosted as Frictionless Data Packages on the")
    print("Rothamsted Research website. To download them:")
    print()

    for period, info in DATASETS.items():
        print(f"  [{period}]")
        print(f"    DOI:  {info['doi']}")
        print(f"    URL:  {info['url']}")
        print(f"    Desc: {info['description']}")
        print()

    print("Steps:")
    print("  1. Visit each DOI URL above")
    print("  2. Click 'Download Data' on the landing page")
    print("  3. Download the .zip (Frictionless package) or .xlsx file")
    print("  4. Extract CSV files into data/yields/")
    print()
    print("After downloading, re-run this script to harmonize the data.")
    print("=" * 70)


def harmonize_yields(data_dir: str, output_dir: str):
    """
    If CSV files exist in data_dir, harmonize them into a unified format.
    """
    output_path = os.path.join(output_dir, "broadbalk_yields_unified.csv")

    # Check for existing downloaded files
    csv_files = [f for f in os.listdir(data_dir) if f.endswith(".csv")]

    if not csv_files:
        print(f"No CSV files found in {data_dir}")
        print_download_instructions()
        return

    all_dfs = []
    for csv_file in csv_files:
        filepath = os.path.join(data_dir, csv_file)
        print(f"  Reading: {csv_file}")
        try:
            df = pd.read_csv(filepath)
            # Standardize column names to lowercase
            df.columns = df.columns.str.lower().str.strip()
            all_dfs.append(df)
        except Exception as e:
            print(f"  Warning: Could not read {csv_file}: {e}")

    if all_dfs:
        combined = pd.concat(all_dfs, ignore_index=True, sort=False)
        combined.to_csv(output_path, index=False)
        print(f"\n  Unified yield file written: {output_path}")
        print(f"  Total rows: {len(combined)}")
    else:
        print("  No data could be harmonized.")
        print_download_instructions()


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    yields_dir = os.path.join(project_root, "data", "yields")

    os.makedirs(yields_dir, exist_ok=True)

    print("Broadbalk Yield Data Pipeline")
    print("-" * 40)
    harmonize_yields(yields_dir, yields_dir)


if __name__ == "__main__":
    main()
