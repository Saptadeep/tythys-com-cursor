from __future__ import annotations

import re
import time
from typing import Optional

from .models import NginxEvent

# Supports common "combined" format with optional request_time at end.
# Example:
# 127.0.0.1 - - [24/Apr/2026:17:40:10 +0000] "GET /api/v1/users HTTP/1.1" 200 523 "-" "curl/8.0" 0.142
NGINX_ACCESS_RE = re.compile(
    r'^(?P<ip>\S+)\s+\S+\s+\S+\s+\[[^\]]+\]\s+"(?P<method>[A-Z]+)\s+(?P<path>\S+)\s+[^"]+"\s+'
    r"(?P<status>\d{3})\s+\S+\s+\"[^\"]*\"\s+\"[^\"]*\"(?:\s+(?P<request_time>\S+))?"
)


def parse_nginx_access_line(line: str) -> Optional[NginxEvent]:
    match = NGINX_ACCESS_RE.match(line.strip())
    if not match:
        return None

    request_time = match.group("request_time")
    try:
        latency_ms = float(request_time) * 1000 if request_time else 0.0
    except ValueError:
        latency_ms = 0.0

    return NginxEvent(
        timestamp=time.time(),
        ip=match.group("ip"),
        path=match.group("path"),
        status=int(match.group("status")),
        latency_ms=round(latency_ms, 2),
    )
