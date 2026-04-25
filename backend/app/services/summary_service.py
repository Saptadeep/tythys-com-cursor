import random

from app.schemas.service_summary import ServiceSummary


def gateway_summary() -> ServiceSummary:
    latency = max(7, 18 + random.randint(-4, 6))
    rpm = max(150, 1200 + random.randint(-250, 300))
    err = round(max(0.01, 0.10 + random.uniform(-0.05, 0.08)), 3)
    return ServiceSummary(
        serviceId="api-gateway-observability",
        health="healthy" if latency < 35 and err < 0.5 else "degraded",
        latencyMs=latency,
        uptimePct=99.97,
        requestsPerMin=rpm,
        errorRatePct=err,
        notes="Gateway traces and metrics are nominal.",
    )


def anomaly_lens_summary() -> ServiceSummary:
    return ServiceSummary(
        serviceId="anomaly-lens",
        health="degraded",
        latencyMs=64,
        uptimePct=99.41,
        requestsPerMin=220,
        errorRatePct=0.91,
        notes="Packet anomaly baseline is still stabilizing.",
    )


def get_service_summary(service_id: str) -> ServiceSummary:
    if service_id == "api-gateway-observability":
        return gateway_summary()
    if service_id == "anomaly-lens":
        return anomaly_lens_summary()
    raise ValueError(f"Unsupported serviceId: {service_id}")
