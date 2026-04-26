import json
import urllib.request


def read(url: str, headers: dict[str, str] | None = None, method: str = "GET", data: dict | None = None) -> str:
    body = None if data is None else json.dumps(data).encode("utf-8")
    request = urllib.request.Request(url, headers=headers or {}, method=method, data=body)
    with urllib.request.urlopen(request) as response:
        return response.read().decode("utf-8")


def main():
    print("health:", read("http://localhost:8080/health"))
    print("summary:", read("http://localhost:8080/v1/services/api-gateway-observability/summary"))
    payload = {
        "service_id": "api-gateway-observability",
        "events": [
            {
                "request_id": "demo-req-1",
                "route": "/checkout",
                "status": 502,
                "latency_ms": 1780,
                "bytes_sent": 1210,
                "timestamp": "2026-04-26T00:00:00Z",
                "tenant": "demo-tenant",
            }
        ],
    }
    headers = {"Content-Type": "application/json", "x-api-key": "dev-ingest-key"}
    print("ingest_post:", read("http://localhost:8080/v1/ingest/events", headers=headers, method="POST", data=payload))
    print(
        "ingest_latest:",
        read("http://localhost:8080/v1/ingest/events/latest", headers={"x-api-key": "dev-ingest-key"}),
    )


if __name__ == "__main__":
    main()
