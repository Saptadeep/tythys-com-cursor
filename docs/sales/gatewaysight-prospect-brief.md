# GatewaySight — prospect narrative & demo flow

**Purpose:** Sales/marketing pitch and a repeatable demo order for live prospects.  
**Product:** GatewaySight (`/gateway-observability`) — API gateway observability in the Tythys stack.  
**Last updated:** 2026-05-01

---

## Pitch / narrative (prospect-facing)

**Hook.** Your API gateway is where customer traffic, partner integrations, and internal services all meet. When something goes wrong there, every minute costs credibility—and often real money. GatewaySight is built so your team **sees the gateway as a system**: health, traffic, errors, latency, and **where** the pain is, not just that “something feels slow.”

**The pain we name.** Most organizations either drown in generic dashboards or discover problems when users complain. GatewaySight focuses on **gateway-centric observability**: what’s flowing through, what’s failing, what’s drifting, and what to look at **first** when minutes matter.

**What they get.** A control-plane style view that ties together **live summary signals** (latency, errors, throughput, uptime posture), **evidence of data flowing in**, **open incidents** with severity context, **prioritized next actions** (so on-call isn’t guessing), **route-level breakdowns** (which paths are hot or sick), and a **timeline** that helps tell the story of the last window—ideal for war rooms and post-incident reviews.

**Why Tythys framing (optional line).** We care about **quantities you can trust** (clear metrics, not vibes) and **software you can run** (operators get a workflow, not another chart graveyard).

**Close.** GatewaySight is for teams who’ve outgrown “we’ll check the logs” but aren’t trying to become a full observability consultancy. If the gateway is part of how you make money or serve users, **it deserves its own lens**—and that’s what we built.

---

## Demo flow (~12–18 minutes)

| Phase | Time | Do / say |
|--------|------|-----------|
| **Context** | 0:00–2:00 | Ask where traffic enters and what on-call does first. Bridge: GatewaySight is the **front door** view. |
| **Landing story** | 2:00–4:00 | Open `/gateway-observability`. One glance: health, latency, errors, throughput — **no debate green vs not**. |
| **Prove it’s live** | 4:00–6:00 | Show last update / refresh; **ingest** activity. Emphasize **telemetry arriving**, not a static mock. |
| **Incidents** | 6:00–9:00 | Walk **incidents** — severity, route if shown, impact framing. **Incidents, not 40 graphs.** |
| **Next actions** | 9:00–12:00 | **Ranked actions** with rationale. Observability vs **operations** — ordering next moves under stress. |
| **Drill to route** | 12:00–15:00 | **Per-route / endpoint** table — p95, errors, volume, health. Answer **which route**, not “gateway is slow.” |
| **Timeline** | 15:00–17:00 | **Timeline** — sequence for Slack, leadership, or blameless review. |
| **Stress story (optional)** | 17:00–18:00 | If UI supports it (e.g. nominal vs stressed): same UI, different posture when things go bad. |
| **Close** | — | Pilot on their gateway or sandbox; align alerts/SLOs with their on-call; one-pager + calendar. |

**Short version (~8 min):** Merge context + landing; merge incidents + timeline; keep **ingest proof**, **incidents**, **routes**, **actions** as the spine.

---

## Pillar tie-in (internal)

GatewaySight is tagged in `services.ts` with **Quantitative reasoning** and **Problem-solving + software**: measurable gateway signals, shipped as operator-facing software—not the full four-pillar lab framing unless you choose to extend the story.
