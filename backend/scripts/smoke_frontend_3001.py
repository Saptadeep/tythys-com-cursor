import urllib.request


def check(url: str):
    with urllib.request.urlopen(url) as response:
        print(url, response.status, response.getheader("content-type"))


def main():
    check("http://localhost:3001/api/services/api-gateway-observability")
    check("http://localhost:3001/api/ingest/latest")
    check("http://localhost:3001/")


if __name__ == "__main__":
    main()
