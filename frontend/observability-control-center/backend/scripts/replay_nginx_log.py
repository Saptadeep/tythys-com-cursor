from __future__ import annotations

import argparse
import time

import requests


def main() -> None:
    parser = argparse.ArgumentParser(description="Replay NGINX access log lines to backend ingest API.")
    parser.add_argument("--file", required=True, help="Path to NGINX access.log file")
    parser.add_argument("--api", default="http://localhost:8000", help="Backend API base URL")
    parser.add_argument("--sleep-ms", type=int, default=50, help="Delay between lines in milliseconds")
    args = parser.parse_args()

    endpoint = f"{args.api.rstrip('/')}/ingest/nginx-line"
    sent = 0
    ingested = 0

    with open(args.file, "r", encoding="utf-8", errors="ignore") as handle:
        for line in handle:
            sent += 1
            response = requests.post(endpoint, json={"line": line.strip()}, timeout=5)
            response.raise_for_status()
            ingested += int(response.json().get("ingested", 0))
            time.sleep(args.sleep_ms / 1000)

    print(f"sent={sent} ingested={ingested}")


if __name__ == "__main__":
    main()
