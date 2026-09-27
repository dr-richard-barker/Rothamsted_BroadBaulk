#!/usr/bin/env python3
"""
Fetch historical daily weather data for Rothamsted Research Station
from the Open-Meteo Historical Weather API.

Station coordinates: 51.8282°N, 0.3571°W, elevation 128m ASL.

Computes harvest-year agronomic indices:
  - Total annual rainfall (mm)
  - Spring critical rainfall Apr-Jul (mm)
  - Growing Degree Days (base 0°C)
  - Heat stress days (Tmax > 25°C and > 30°C in June-July)
  - Mean summer temperature Jun-Aug (°C)
"""

import os
import pandas as pd
import numpy as np

try:
    import openmeteo_requests
    import requests_cache
    from retry_requests import retry

    HAS_OPENMETEO = True
except ImportError:
    HAS_OPENMETEO = False
    print("Warning: openmeteo-requests not installed. Install with:")
    print("  pip install openmeteo-requests requests-cache retry-requests")


# Rothamsted Research Station coordinates
LAT = 51.8282
LON = -0.3571

# Harvest year runs Sep 1 to Aug 31
START_DATE = "1950-01-01"
END_DATE = "2024-12-31"


def fetch_daily_weather(output_dir: str):
    """Fetch daily weather data from Open-Meteo Historical Archive API."""

    if not HAS_OPENMETEO:
        print("Skipping Open-Meteo fetch (dependencies not installed).")
        return None

    print("Fetching daily weather from Open-Meteo Historical Archive API...")
    print(f"  Location: {LAT}°N, {LON}°W")
    print(f"  Period:   {START_DATE} to {END_DATE}")

    # Setup cached session
    cache_session = requests_cache.CachedSession(
        os.path.join(output_dir, ".weather_cache"), expire_after=-1
    )
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    params = {
        "latitude": LAT,
        "longitude": LON,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "temperature_2m_mean",
            "precipitation_sum",
            "sunshine_duration",
        ],
        "timezone": "Europe/London",
    }

    responses = openmeteo.weather_api(
        "https://archive-api.open-meteo.com/v1/archive", params=params
    )

    response = responses[0]
    daily = response.Daily()

    dates = pd.date_range(
        start=pd.to_datetime(daily.Time(), unit="s", utc=True),
        end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=daily.Interval()),
        inclusive="left",
    )

    df = pd.DataFrame(
        {
            "date": dates,
            "tmax": daily.Variables(0).ValuesAsNumpy(),
            "tmin": daily.Variables(1).ValuesAsNumpy(),
            "tmean": daily.Variables(2).ValuesAsNumpy(),
            "precip_mm": daily.Variables(3).ValuesAsNumpy(),
            "sunshine_sec": daily.Variables(4).ValuesAsNumpy(),
        }
    )

    df["date"] = pd.to_datetime(df["date"]).dt.tz_localize(None)
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month

    # Save raw daily data
    daily_path = os.path.join(output_dir, "rothamsted_weather_daily.csv")
    df.to_csv(daily_path, index=False)
    print(f"  Daily weather saved: {daily_path} ({len(df)} rows)")

    return df


def compute_harvest_year_indices(df: pd.DataFrame, output_dir: str):
    """Compute agronomic indices aggregated by harvest year (Sep 1 - Aug 31)."""

    if df is None or df.empty:
        print("No weather data to aggregate.")
        return

    print("Computing harvest-year agronomic indices...")

    # Assign harvest year (Sep-Dec → next year's harvest)
    df["harvest_year"] = df["year"]
    df.loc[df["month"] >= 9, "harvest_year"] = df.loc[df["month"] >= 9, "year"] + 1

    records = []
    for hy, group in df.groupby("harvest_year"):
        if hy < 1951 or hy > 2024:
            continue

        # Total annual rainfall
        total_rain = group["precip_mm"].sum()

        # Spring rainfall (Apr-Jul)
        spring = group[group["month"].isin([4, 5, 6, 7])]
        spring_rain = spring["precip_mm"].sum()

        # Growing Degree Days (base 0°C, full year)
        gdd = group["tmean"].clip(lower=0).sum()

        # Summer metrics (June-July for grain fill)
        summer = group[group["month"].isin([6, 7])]
        summer_tmean = summer["tmean"].mean() if len(summer) > 0 else np.nan
        heat_days_25 = (summer["tmax"] > 25).sum() if len(summer) > 0 else 0
        heat_days_30 = (summer["tmax"] > 30).sum() if len(summer) > 0 else 0

        # Annual mean temperature
        annual_tmean = group["tmean"].mean()

        records.append(
            {
                "harvest_year": int(hy),
                "total_rainfall_mm": round(total_rain, 1),
                "spring_rainfall_mm": round(spring_rain, 1),
                "gdd_base0": round(gdd, 0),
                "summer_mean_temp_c": round(summer_tmean, 2) if not np.isnan(summer_tmean) else None,
                "heat_days_tmax25": int(heat_days_25),
                "heat_days_tmax30": int(heat_days_30),
                "annual_mean_temp_c": round(annual_tmean, 2),
            }
        )

    indices_df = pd.DataFrame(records)
    indices_path = os.path.join(output_dir, "rothamsted_harvest_year_indices.csv")
    indices_df.to_csv(indices_path, index=False)
    print(f"  Harvest-year indices saved: {indices_path} ({len(indices_df)} rows)")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    climate_dir = os.path.join(project_root, "data", "climate")
    os.makedirs(climate_dir, exist_ok=True)

    print("Rothamsted Climate Data Pipeline")
    print("-" * 40)

    df = fetch_daily_weather(climate_dir)
    compute_harvest_year_indices(df, climate_dir)

    print("\nDone!")


if __name__ == "__main__":
    main()
