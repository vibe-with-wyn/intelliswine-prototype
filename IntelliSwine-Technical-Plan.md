# IntelliSwine Technical Plan

## 1. Product Objective and Scope
IntelliSwine is a swine production management and decision-support platform focused on operational efficiency, planning quality, and reliable batch-level insights.

In scope:
- Farm setup and production readiness
- Batch lifecycle management
- Immutable base task planning with overlay adjustments
- Daily operational logging (feed, weight, mortality)
- Batch-level projection and metrics
- Management alerts with clear actions

Out of scope:
- Veterinary diagnosis and treatment recommendations
- Prescription logic
- Pen-level or individual pig tracking in the current MVP

## 2. Core Product Flow
1. Registration
- Collect minimal required identity and farm starter fields.
- Create user and farm shell.
- Mark farm setup status as PARTIAL.

2. Login
- Always allow dashboard access.
- If setup is PARTIAL, show non-blocking reminder.

3. Farm setup gate (production trigger)
- Setup is required only when farmer starts production actions (for example, batch creation).
- Capture required farm context and biosecurity toggles.
- Set setup status to COMPLETE.

4. Batch creation
- Allow only when setup status is COMPLETE.
- Capture curated batch inputs (batchSize, geneticsType, initialWeightKg, feedType, startDate, targetMarketWeightKg).
- Trigger base task generation.

5. Daily operations
- Task completion and overlays
- Daily feed logging
- Weight logging (Scale or Tape)
- Mortality logging

6. Metrics and projection
- Recompute snapshots on event triggers.
- Return confidence-aware metrics, projection, and alerts.

## 3. Architecture Principles

### Frontend
- HCI-first interactions (progressive disclosure, one-screen daily work, low typing burden)
- Farmer-first wording in labels, guidance, and alerts
- Accessible and mobile-friendly UX
- Reusable component architecture

### Backend
- SOLID design with thin controllers and service-centric business logic
- DRY shared validators, utilities, and domain rules
- KISS and YAGNI in module design
- Explicit validation and stable error semantics
- Event-driven snapshot recalculation for performance

### Message architecture
Centralized message templates with:
- severity: INFO, WARNING, CRITICAL
- audience: FARMER, SYSTEM, ADMIN
- type: ALERT, VALIDATION, GUIDANCE, STATUS
- messageCode for stable backend/frontend mapping

## 4. Domain Model Summary

### Core entities
- Users
- Farm
- Batch
- GeneratedTask
- TaskGenerationRun

### Operational logs
- FeedLog
- WeightLog
- MortalityLog

### Insight outputs
- BatchMetricSnapshot
- ProjectionSnapshot
- Alert

## 5. Key Data Policies

### Setup and biosecurity
Required setup includes:
- housingType
- waterSystem
- feedingSystem
- farmCapacity
- environmentProfile
- hasFootbath
- hasPerimeterFence
- hasVisitorLogbook

### Batch planning policy
- Base task plan is immutable after generation.
- Changes use forward-dated overlay tasks only.

### Feed log policy
- feedType is inherited from Batch and not accepted in feed logs.

### Weight method policy
- Allowed methods: SCALE, TAPE_ESTIMATE
- TAPE_ESTIMATE requires tape measurements and server-side auto-computation.

## 6. Weight, Uniformity, and Confidence

### Required weight integrity
- sampleSize is required
- minSampleWeightKg <= averageWeightKg <= maxSampleWeightKg

### Uniformity metric
sampleSpreadPercent = ((maxSampleWeightKg - minSampleWeightKg) / averageWeightKg) * 100

Uniformity bands:
- GOOD: < 15%
- WATCH: 15% to 25%
- ALERT: > 25%

Confidence guard:
- If sample ratio < 10%, do not escalate to hard RED alert.

### Confidence policy
- HIGH: sampleRatio >= 0.15
- MEDIUM: 0.10 <= sampleRatio < 0.15
- LOW: sampleRatio < 0.10

## 7. Gompertz Projection Framework (5 Layers)
Model:
W_t = alpha * exp(-beta * exp(-kappa * t))

1. Genetic baseline
- alpha, kappa, maturity profile from genetics library

2. Biological/statistical sanity
- age/stage-aware ADG plausibility checks
- warning-first handling for improbable but possible values

3. Environmental/climatic offsets
- bounded kappa adjustment based on climate context and housing
- density impact included

4. Management/strategy offsets
- feed form and feeding strategy effects on growth behavior

5. Measurement reliability
- scale and tape reliability weighting
- confidence and reliability reasons in response

## 8. Metrics and Operational Reality Engine

### ADG
ADG = (W_t - W_(t-1)) / daysElapsed

### Mandatory pig-days ADFI
ADFI = sum(dailyFeedKg) / sum(activePigsPerDay)

Required helpers:
- getPigDays(batchId, startDate, endDate)
- getCurrentHeadcount(batchId, asOfDate)

### Density
densityKgPerM2 = (currentHeadcount * currentAverageWeightKg) / activeFloorAreaM2

### Mortality-aware updates
- Metrics must be date-scoped to mortality events.
- Denominator changes from mortality effective date onward.
- Missing feed-day inputs lower dataCompleteness and add reliability reasons.

### FCR and EFI
- FCR includes mortality-aware economic context.
- EFI uses survival multiplier and trend-based interpretation.
- No fixed universal EFI gold score in this phase.

### Regional warm-start benchmarking
- Batch #1: regional baseline window
- Batch #2: compare to Batch #1
- Batch #3+: rolling average consistency

## 9. Registry Pattern (No Hard-Coded Constants)
Thresholds and penalties are stored in a configurable registry.

Example keys:
- MAX_ADG_GROWER
- MAX_DENSITY_FINISHER
- UNIFORMITY_ALERT_THRESHOLD
- MORTALITY_CRITICAL_THRESHOLD
- KAPPA_PENALTY_DENSITY_MAX

Registry metadata:
- key, value, unit
- scope dimensions (region, profile, phase)
- source, version, effectiveFrom, effectiveTo
- fallback: specific scope -> regional default -> global default

## 10. Event-Driven Recalculation and Snapshots
Trigger recomputation on:
- Weight log saved
- Feed log saved
- Mortality event saved
- Transfer/area-change event saved

Recompute sequence:
1. Update headcount timeline
2. Recompute density and survivability
3. Apply Gompertz offsets
4. Recompute projection and reliability reasons
5. Persist Batch_Analytics_Snapshot (or equivalent)

No full recomputation on every page refresh.

## 11. API Contract Highlights

### Projection response
- expectedWeightKg
- actualWeightKg
- weightDeviationPercent
- projectedMarketDate
- confidenceLevel
- modelType
- modelVersion
- reliabilityReasons[]

### Metrics response
- adg, fcr, adfi, efi
- currentHeadcount
- survivalRate
- stockingDensityKgPerM2
- sampleSpreadPercent
- uniformityBand
- dataCompleteness
- confidenceLevel
- benchmarkContext

## 12. Validation and Safety Rules
- Handle divide-by-zero and null denominators safely.
- Negative ADG is not auto-rejected; treat as management deviation with non-diagnostic wording.
- Hard reject only physically impossible or extreme invalid values.

## 13. Acceptance Test Matrix (Priority)
1. Setup gate applies only on production start actions.
2. Daily feed logging flow works with simple required fields.
3. Tape modal payload is required and auto-computed server-side.
4. Uniformity bands and confidence guard behave correctly.
5. Pig-days ADFI changes denominator after mortality effective date.
6. Density and crowding penalties affect projection date.
7. Registry value changes update behavior without redeploy.
8. Regional benchmark progression works across batch history.
9. Non-diagnostic wording guard is enforced.
10. Ownership and JWT controls block cross-owner access.

## 14. Readiness for Next Phase
This plan is ready for implementation sequencing with:
- Shared threshold registry
- Event-driven analytics snapshot pipeline
- DTO and endpoint completion
- Test-first rollout for metrics/projection correctness
