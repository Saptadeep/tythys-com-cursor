import urllib.request


def read(url: str) -> str:
    with urllib.request.urlopen(url) as response:
        return response.read().decode("utf-8")


def main():
    print("frontend_services_proxy:", read("http://localhost:3000/api/services/api-gateway-observability"))
    print("frontend_ingest_proxy:", read("http://localhost:3000/api/ingest/latest"))


if __name__ == "__main__":
    main()
