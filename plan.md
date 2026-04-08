## Plan: IntelliSwine Core Domain Buildout

Implement IntelliSwine in a disciplined backend-first sequence starting from validated grower-finisher domain entities, then repositories, services, and farmer-facing controllers. The approach now enforces one active batch per farm with multi-pen support in the same build, keeps a single-pen default UX for low-friction adoption, preserves one-time farm setup and generated task plans, avoids premature complexity (offline sync deferred), and keeps agricultural assumptions evidence-backed through a documented reference pack.

**Steps**
0. Pre-Phase: Authentication session optimization (must be implemented first)
- migrate from single JWT to dual-token architecture (short-lived access token + long-lived refresh token)
- add refresh token rotation, reuse detection, and device-session revocation controls
- enable silent refresh for mobile continuity and sign-out-all-devices recovery flow
1. Phase 0: Evidence and domain baseline (blocks all downstream work)
2. Compile a reference pack and parameter register using authoritative standards selected by the user: international baseline with local adaptation (FAO/NRC-style sources plus extension-compatible mappings). Define which values are hard constants vs configurable thresholds. Output: source matrix, accepted ranges, unresolved items list.
3. Normalize business vocabulary and lifecycle states for grower-finisher batches: setup, active, interrupted, completed-early, completed-market. Output: shared glossary and lifecycle transition rules.
4. Phase 1: Entity and ERD design (depends on 1-3)
5. Finalize ERD around current implemented core and missing domain objects. Use one-active-batch scope with pen-level operational data as first-class (single-pen default, no per-pig tracking).
6. Extend current core entities and add missing ones for Phase 1 scope only:
- Farm (static context completeness and validation constraints)
- Batch (lifecycle/status, stage progression, effective headcount, completion fields)
- GeneratedTask (persisted planned tasks generated once)
- TaskCompletionLog (append-only completion/logging events, supports conflict review)
- BatchEvent (interruption/early-sale/system events)
- WeightLog (flexible entries with milestone-aware checks Day 30/60/90 and confidence scoring)
7. Define explicit field-level rules per entity: mandatory, optional, allowed ranges, cross-field checks, and source-of-truth rationale (user input vs derived vs computed).
8. Produce versioned ERD plus data dictionary and acceptance criteria for each table before coding begins.
9. Phase 2: Persistence layer and migration strategy (depends on 4-8)
10. Create repositories and query contracts aligned to farmer workflows: my farms, farm batches, batch daily tasks, upcoming overdue tasks, milestone-weight compliance, append-only logs by date range.
11. Introduce migration strategy for schema evolution and seed strategy for task rules. Keep H2 compatibility for local dev while ensuring PostgreSQL-safe schema conventions.
12. Add optimistic locking and audit fields where needed for concurrent edits and future sync safety.
13. Phase 3: Service layer implementation (depends on 9-12)
14. Implement BatchService as orchestration core: create/update/close batch, state transitions, interruption handling, and ownership enforcement.
15. Implement TaskGenerationService to transform rules JSON + farm/batch context into persisted BaseTask rows at batch creation only; after generation, the base plan is immutable.
16. Implement TaskExecutionService to mark tasks complete with a 2-3 day allowance and append TaskCompletionLog entries instead of destructive updates.
17. Implement WeightValidationService pipeline:
- normalize method (scale/tape)
- apply plausibility checks
- milestone compliance checks (Day 30/60/90)
- record confidence flags for downstream analytics
18. Keep offline sync deferred, but implement Gompertz projection foundations now (genetics baseline + measurement reliability + confidence-scored outputs) and define extension interfaces for later environmental/management offsets and advanced alerts.
19. Phase 4: Controller/API contract delivery (depends on 13-18)
20. Deliver farmer endpoints in strict order:
- Batch lifecycle endpoints
- Task query/complete/overlay endpoints
- Feed logging endpoints
- Weight logging endpoints with validation feedback
- Mortality logging endpoints
- Projection and metrics endpoints
- Alert endpoints
21. Standardize API response/error envelope and validation error payloads for frontend consistency.
22. Add role/ownership authorization checks on all farmer routes and ensure zero cross-farm data exposure.
23. Phase 5: Verification and readiness gates (depends on 20-22)
24. Unit tests: entity validation rules, service transition rules, rule-based task generation, milestone enforcement.
25. Integration tests: end-to-end flow (register -> login -> dashboard -> create batch trigger -> setup complete -> batch create with auto `DEFAULT_PEN` -> optional add-pen -> task generation -> task completion -> daily feed/weight logs with resolved pen linkage).
26. Data correctness tests: ADG/FCR/ADFI prerequisites validation and missing-data tolerance behavior.
27. API contract checks against current frontend integration points; document temporary stubs where frontend is ahead.
28. Produce release checklist for Phase 1 completion and Phase 2 handoff (analytics/alerts/offline).

**Relevant files**
- c:\IntelliSwine\prompt.md — canonical problem framing, constraints, and target flow.
- c:\IntelliSwine\IntelliSwine.md — domain narrative and architecture intent.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\entity\farmer\Farm.java — existing farm baseline to refine.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\entity\farmer\Batch.java — current batch baseline to extend with lifecycle/state fields.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\dto\farmer\BatchCreateRequest.java — current batch contract that drives first controller slice.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\dto\farmer\BatchResponse.java — response shape to evolve with new lifecycle data.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\dto\farmer\DailyTaskQuery.java — existing daily retrieval contract.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\dto\farmer\GeneratedTaskResponse.java — task response contract target for GeneratedTask persistence.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\repository\farmer\BatchRepository.java — seed repository to extend for ownership-aware queries.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\service\farmer\FarmService.java — established service pattern for auth/ownership guard reuse.
- c:\IntelliSwine\backend\src\main\java\com\spmss\intelliswine\controller\farmer\FarmController.java — existing controller style to mirror for new farmer modules.
- c:\IntelliSwine\backend\src\main\resources\rules\task-rules.json — current mock rules source for generation pipeline.

**Verification**
1. Confirm no plan step assumes missing files currently claimed by overview docs; use actual workspace inventory as source of truth.
2. Validate ERD against real farmer scenarios: normal cycle, early sale, interruption, missing weights, delayed task logging.
3. Run backend test suite for each phase gate and maintain a green baseline before advancing to next phase.
4. Execute API smoke tests for each new endpoint with JWT auth and cross-owner access denial checks.
5. Verify milestone policy behavior: flexible logs accepted, missing Day 30/60/90 flagged with actionable feedback.
6. Verify append-only conflict behavior by submitting competing same-day logs and checking conflict flags/history.

**Decisions**
- Primary reference hierarchy: DA/BAI and other Philippine official veterinary-agriculture issuances are authoritative for Philippine deployment; international references (FAO, WOAH, NRC/NASEM, peer-reviewed literature) are secondary defaults only when local guidance is absent, with local override precedence documented per rule.
- Phase 1 functional scope: Batch lifecycle plus generated tasks.
- Offline-first synchronization: explicitly deferred until backend core is stable.
- Weighing policy: flexible logging with milestone-aware guidance (Day 30/60/90 strongly recommended, not hard-blocked).
- Granularity: one active batch per farm with multi-pen operations enabled now; logs and analytics are pen-resolved internally, while UI keeps pen input optional by default. No individual pig tracking.
- Data conflict strategy: append logs and mark conflicts for review.

**Further Considerations**
1. Research governance: define how each agricultural threshold becomes configurable so local advisors can tune without code changes.
2. Prepare a compact farmer UX validation loop (3-5 farmers) before locking controller payloads to reduce future contract churn.
3. Keep scope locked against per-pig tracking while implementing pen-level operations now via single-pen default and optional advanced pen workflows.

## Evidence-Based Granularity Update (One Active Batch + Multi-Pen Now)

**Evidence summary used for decision**
1. Carpenter et al. (2018, PMC6095347, PMID 29726991): pigs at 0.91 m2 had higher ADG and ADFI than 0.63 m2, and performance effects appeared before the commonly used k = 0.0336 threshold in some ranges.
2. Thomas et al. (2017, PMC7205350, PMID 32704659): reducing space allowance from 0.84 to 0.65 m2 reduced ADG and ADFI and lowered final body weight by 3.8-5.3 kg in trials.
3. Camp Montoro et al. (2021, PMC7786905, PMID 33407880): lower space allowance (0.72-0.78 m2) materially increased body lesions, and mixing reduced growth performance (for example, non-mixed pigs were 5.4 kg heavier with +74 g/day ADG in one experiment).
4. EFSA AHAW (2022, PMID 36034323): space allowance is a key risk factor linked to welfare outcomes (including tail biting) and has quantified relationships with growth and lying behavior in rearing pigs.

**Planning decision**
1. Keep batch as the business unit and default dashboard summary level, with one active batch allowed per farm.
2. Apply pen-level operations now to capture within-batch differences in space, mortality, weight, and feed logs where farms segregate by pen.
3. Keep per-pig tracking out of scope.


**Granularity scope lock (current build)**
1. Current build (Phase 1): enforce one active batch per farm and support one-or-more pens in that active batch.
2. Pen is the operational data grain for logging, monitoring, and growth computation; batch remains the management summary grain.
3. Pen input in UI is optional by default through single-pen auto-routing, while advanced farms can explicitly select pens.
4. Permanent exclusion: per-pig identity and per-pig lifecycle tracking remain out of scope.

**Implementation policy (phased, low disruption, reliability-first)**
1. Phase 1 core activation (now):
- include Pen as first-class entity in ERD and persistence
- auto-create `DEFAULT_PEN` at batch creation
- persist all feed/weight/mortality logs with resolved `penId` (no null pen linkage)
- keep API/UI pen selection optional through default-pen auto-routing
2. Phase 1.5 operational controls:
- add pen CRUD and ownership chain checks (user -> farm -> batch -> pen)
- add transfer event logging with immediate source/destination recalculation triggers
3. Phase 2 advanced operations:
- add optional explicit pen-aware dashboards and drill-down filters
- add mixed-pen allocation only with explicit allocation engine and quality flags (not silent inference)
4. Guardrails:
- no feature may require advanced pen workflows for simple farms
- no analytics output may hide confidence limitations or missing data assumptions.



## Detailed Model Slice: Authentication to Task Generation

**Scope for this slice**
1. Authentication and account control
2. Farm setup (one-time static context)
3. Batch lifecycle (create and manage production cycle)
4. Rule-based task generation and stored task execution state


**HCI and data-minimization guardrails (mandatory for this build)**
1. Progressive disclosure: collect only the minimum fields needed for the current farmer action.
2. One-screen rule for daily work: daily task completion must not require extra unrelated inputs.
3. Mandatory-first design: each form has strict required fields and a small optional section.
4. Reuse stored context: farm-level static values are captured once and reused during generation/validation.
5. No duplicate capture: never ask again for values already known unless user edits profile.
6. Explain every required field in plain language (why needed and where used).
7. Offline-friendly brevity: minimize typing and prefer picklists/enums where practical.

**Data collection tiers (to avoid too much/too little)**
1. Tier A (required now, because directly used by generation/projection/metrics)
- Auth register: firstName, lastName, email, password, farmName, farmSize
- Farm setup completion: housingType, waterSystem, feedingSystem, farmCapacity, environmentProfile, hasFootbath, hasPerimeterFence, hasVisitorLogbook
- Batch create: farmId, batchSize, geneticsType, initialWeightKg, feedType, startDate, targetMarketWeightKg
- Task generation output: ruleId, scheduledDate, title, category, priority, status
2. Tier B (defer unless proven necessary)
- User: middleName, phoneNumber
- Farm: free-text notes and extended descriptors
- Batch: optional narrative notes and optional additional-pen registration metadata (`pens[]`)
- Task: attachments/media evidence
3. Tier C (out of core scope)
- Nutrient formula detail inputs, ration optimization parameters, and deep veterinary diagnostic fields

**Form-level required field policy**
1. Registration form: required fields are firstName, lastName, email, password, farmName, farmSize.
2. Farm setup form: required fields are the curated farm-adaptation set used by generation and analytics (housingType, waterSystem, feedingSystem, farmCapacity, environmentProfile, hasFootbath, hasPerimeterFence, hasVisitorLogbook).
3. Batch creation form: required fields are farmId, batchSize, geneticsType, initialWeightKg, feedType, startDate, targetMarketWeightKg.
4. Task completion form (later step): completion action requires no unrelated extra fields; specialized logs (feed, weight, mortality) have their own required fields.

**Required-field justification rule (anti-toy guarantee)**
1. A field can be required only if it is consumed by at least one of: task-rule matching, metric calculation, growth projection, or monitoring/alert evaluation.
2. Every required field must be mapped to usage in a traceability table before implementation.
3. If a field has no direct downstream use, it must be optional or removed.


**Acceptance checks for HCI compliance**
1. Every endpoint request DTO must classify fields as required vs optional with documented reason.
2. No create/update endpoint should require fields not consumed by business logic.
3. A farmer can finish initial setup + first batch in under 5 minutes.
4. A farmer can complete a daily task in under 30 seconds without typing long text.

**Entities and attributes**
1. `Users` (existing, keep as identity root)
- `id` Long PK
- `firstName` String(100) required
- `middleName` String(100) optional
- `lastName` String(100) required
- `emailAddress` String(255) required unique
- `phoneNumber` String(30) optional
- `passwordHash` String(255) required
- `role` UserRole required
- `status` UserStatus required default ACTIVE
- `lastLoginAt` LocalDateTime optional
- `createdAt` LocalDateTime required
- `updatedAt` LocalDateTime required

2. `Farm` (existing, refine for controlled vocabulary)
- `id` Long PK
- `owner` FK Users required
- `farmName` String(150) required
- `farmSize` String(50) optional (candidate enum in next phase)
- `location` String(200) optional
- `housingType` String(80) optional (candidate enum)
- `feedingSystem` String(80) optional (candidate enum)
- `waterSystem` String(80) optional (candidate enum)
- `farmCapacity` Integer optional
- `hasFootbath` Boolean optional (required at setup completion)
- `hasPerimeterFence` Boolean optional (required at setup completion)
- `hasVisitorLogbook` Boolean optional (required at setup completion)
- `availableResources` String(255) optional
- `createdAt` LocalDateTime required
- `updatedAt` LocalDateTime required

3. `Batch` (existing, extend for lifecycle)
- `id` Long PK
- `farm` FK Farm required
- `batchName` String(120) optional
- `batchSize` Integer required
- `initialWeightKg` Decimal(8,2) required
- `startDate` LocalDate required
- `geneticsType` String(80) optional
- `feedType` String(80) optional
- `targetMarketWeightKg` Decimal(8,2) optional
- `status` BatchStatus required default ACTIVE
- `endDate` LocalDate optional
- `completionReason` BatchCompletionReason optional
- `currentPhase` BatchPhase optional or derived from day age
- `effectiveHeadcount` Integer required (initialized from `batchSize`, decremented by mortality/cull logs later)
- `createdAt` LocalDateTime required
- `updatedAt` LocalDateTime required


3A. `Pen` (required operational structure for active batch, including auto-created `DEFAULT_PEN`)
- `id` Long PK
- `batch` FK Batch required
- `penName` String(80) required
- `role` PenRole required (`DEFAULT_PEN`, `STANDARD_PEN`, `RECOVERY_PEN`)
- `lengthM` Decimal(8,2) required
- `widthM` Decimal(8,2) required
- `areaM2` Decimal(8,2) required (backend-derived from length x width)
- `isActive` Boolean required default true
- `createdAt` LocalDateTime required
- `updatedAt` LocalDateTime required

4. `GeneratedTask` (new persisted plan output)
- `id` Long PK
- `batch` FK Batch required
- `ruleId` String(100) required (trace to JSON rule)
- `ruleVersion` String(30) optional
- `scheduledDate` LocalDate required
- `dayOffset` Integer required (days from batch start)
- `title` String(160) required
- `detail` String(500) optional
- `category` TaskCategory required
- `priority` TaskPriority required
- `status` TaskStatus required default PENDING
- `allowanceDays` Integer required default 3
- `dueDate` LocalDate required
- `completedAt` LocalDateTime optional
- `skippedAt` LocalDateTime optional
- `skipReason` String(255) optional
- `estimatedMinutes` Integer optional
- `isMilestone` Boolean required default false
- `sourceOrg` String(120) optional
- `sourceDoc` String(160) optional
- `sourceVersion` String(40) optional
- `createdAt` LocalDateTime required
- `updatedAt` LocalDateTime required

5. `TaskGenerationRun` (new audit for base/overlay generation actions and reproducibility)
- `id` Long PK
- `batch` FK Batch required
- `triggerType` TaskGenerationTrigger required
- `triggeredBy` FK Users required
- `ruleSetVersion` String(30) required
- `generatedCount` Integer required
- `startedAt` LocalDateTime required
- `finishedAt` LocalDateTime optional
- `status` GenerationRunStatus required
- `notes` String(255) optional

**Enums required in this slice**
1. Keep existing
- `UserRole`: ADMIN, FARMER
- `UserStatus`: ACTIVE, DISABLED, LOCKED, ARCHIVED
- `TaskCategory`: FEEDING, VACCINATION, DEWORMING, WEIGHING, CLEANING, HEALTH_CHECK, ENVIRONMENT_MANAGEMENT
- `TaskPriority`: LOW, MEDIUM, HIGH, CRITICAL
- `TaskStatus`: PENDING, COMPLETED, SKIPPED, OVERDUE

2. Add new

## Canonical Product Flow (Step 1 to Step 4)

**Step 1: Registration (minimal required)**
1. Collect: firstName, lastName, email, password, farmName, farmSize.
2. Create user account and initial farm shell in one transaction.
3. Mark farm profile as `setupStatus = PARTIAL` to enforce setup completion only when the farmer starts production actions (for example, batch creation).

**Step 2: Authentication (login + persistent session)**
1. User logs in with email + password; client includes `deviceId` to bind browser/device session.
2. Backend issues short-lived `accessToken` and sets long-lived refresh token via secure HttpOnly cookie, plus lightweight user context + farm setup status.
3. Client routes all users to dashboard after successful login.
4. When `accessToken` expires, client silently calls refresh endpoint; server validates refresh cookie and rotates session tokens.
5. Session persists across browser restarts until refresh/session expiry or explicit revocation.
6. If setup is incomplete, show a non-blocking setup reminder on dashboard and enforce a hard gate only on production-start actions.

**Step 3: Conditional farm setup (triggered when starting production)**
1. Farmer can access dashboard even if setup is partial.
2. When farmer initiates production (for example, taps create batch), show setup modal and require completion before proceeding.
3. Pre-fill registration values (farmName, farmSize).
4. Collect remaining farm-level fields required by task adaptation and analytics/projection context.
5. Save finalized farm profile and set `setupStatus = COMPLETE`.
6. Enforce a setup completeness gate only for production-start actions: no batch creation while setup is partial.

**Step 4: Batch creation (after setup complete)**
1. Allow batch creation only when farm setup is complete.
2. Collect the curated batch-required inputs:
- batchSize
- geneticsType
- initialWeightKg
- feedType
- startDate
- targetMarketWeightKg
3. Require pen registry at batch creation with low-friction default behavior:
- system auto-creates `DEFAULT_PEN` so single-pen farms continue with zero extra setup
- farmer may add extra pens (name + lengthM + widthM, with backend area calculation)
4. Persist batch and resolved pen records, then trigger task-generation run.
5. Generate tasks from farm + batch context and store for daily retrieval.
6. Daily operations include feed logging every day, plus weight and mortality logging as needed; if pen is not explicitly selected, backend auto-routes logs to `DEFAULT_PEN`.

## Minimal Entity Set That Still Enables Insights

**A. Identity and access**
1. `Users`
2. `UserSession` (required for refresh-token rotation, device session tracking, and revocation controls)

**B. Farm context**
1. `Farm`
2. `FarmSetupStatus` value in Farm (`PARTIAL`, `COMPLETE`)

**C. Production cycle**
1. `Batch`
2. `Pen` (required child structure for active batch operations; includes `DEFAULT_PEN` auto-created at batch start)
3. `GeneratedTask`
4. `TaskGenerationRun`
5. `TaskActionLog` (append-only completion/skip events)

**D. Observation inputs for analytics/projection/monitoring (minimal)**
1. `WeightLog` (required for projection confidence, sparse and milestone-friendly; always linked to resolved pen)
2. `FeedLog` (simple daily quantity with resolved pen linkage; no deep formula data)
3. `MortalityLog` (count + reason category with resolved pen linkage)

**E. Computed insight outputs (persist snapshots, not heavy raw data)**
1. `PenMetricSnapshot` (pen-level ADG/ADFI/density/mortality/completeness/confidence for operational checks)
2. `BatchMetricSnapshot` (batch roll-up ADG/FCR/ADFI/EFI, survival, uniformity, benchmark context, confidence)
3. `PenProjectionSnapshot` (pen-level expected weight and projected timing signals)
4. `ProjectionSnapshot` (batch roll-up expectedWeight, weightDeviationPercent, projectedMarketDate)
5. `Alert` (severity, type, message, recommendedAction, status, with pen or batch scope tag)

## Attribute Policy Per Module (minimal but sufficient)

1. `WeightLog`
- batchId, penId(resolved required), logDate, averageWeightKg, minSampleWeightKg, maxSampleWeightKg, sampleSpreadPercent(derived), method(scale/tape), sampleSize(required), confidenceScore(derived)
2. `FeedLog`
- batchId, penId(resolved required), logDate, totalFeedKg, note(optional)  // feedType is inherited from Batch and not overrideable in logs
3. `MortalityLog`
- batchId, penId(resolved required), logDate, count, reasonCategory, note(optional)
4. `PenMetricSnapshot`
- batchId, penId, asOfDate, adgPen, adfiPen, densityKgPerM2Pen, mortalityRatePen, dataCompleteness, confidenceLevel
5. `BatchMetricSnapshot`
- batchId, asOfDate, adgBatch, fcrBatch, adfiBatch, efiBatch, currentHeadcount, survivalRate, uniformitySpreadPercent, uniformityBand, dataCompleteness, confidenceLevel, benchmarkContext
6. `PenProjectionSnapshot`
- batchId, penId, asOfDate, expectedWeightKgPen, projectedMarketDatePen, confidenceLevel, reliabilityReasons
7. `ProjectionSnapshot`
- batchId, asOfDate, expectedWeightKgBatch, actualWeightKg(optional), weightDeviationPercent, projectedMarketDate, confidenceLevel, reliabilityReasons
8. `Alert`
- batchId, penId(optional), scope(PEN|BATCH), alertType, severity, message, recommendedAction, status, triggeredAt, acknowledgedAt(optional)

**Data consistency rules for metrics/projection reliability**
1. `WeightLog.sampleSize` is mandatory and must be >= 1 for every weight entry.
2. `WeightLog` must satisfy `minSampleWeightKg <= averageWeightKg <= maxSampleWeightKg`.
3. Derive `sampleSpreadPercent = ((maxSampleWeightKg - minSampleWeightKg) / averageWeightKg) * 100` for uniformity monitoring.
4. Metrics must use date-scoped active headcount from mortality and transfer logs (not static initial headcount).
5. ADFI must be computed at pen level first using pig-days logic: `ADFI_pen = sum(dailyFeedKg_pen) / sum(activePigsPerDay_pen)`.
6. Batch ADFI and other batch metrics must be deterministic roll-ups from pen-level facts, with explicit weighting rules documented.
7. If any day in an analytics period has missing required feed input, mark `dataCompleteness` low and include reliability reason instead of silently assuming zero feed.
8. `FeedLog` cannot override `Batch.feedType`; any feed-type change must go through an explicit batch update event.
9. Every feed/weight/mortality write must resolve and persist `penId`; when omitted, auto-bind to `DEFAULT_PEN`.
10. Enforce one active batch per farm at service and database levels (constraint + guard).
11. Metrics/projection should use warning-first handling for improbable but possible values; hard reject only physically impossible/extreme invalid data.
12. Projection confidence must include sample-size sufficiency, measurement-method reliability (scale vs tape), and pen data completeness.
13. Any mid-cycle feed-type change must be versioned at batch level so downstream analytics remain interpretable.
14. Mixed-pen (multiple batches in one pen) is disabled in Phase 1 to avoid unreliable inferred allocations; enable only with explicit allocation engine and quality flags.


## Enums Required for this extended minimal scope

1. `FarmSetupStatus`: PARTIAL, COMPLETE
2. `BatchStatus`: DRAFT, ACTIVE, INTERRUPTED, COMPLETED
3. `BatchPhase`: STARTER, GROWER, FINISHER, MARKET_READY
4. `PenRole`: DEFAULT_PEN, STANDARD_PEN, RECOVERY_PEN
5. `MonitoringScope`: PEN, BATCH
6. `TaskStatus`: PENDING, COMPLETED, SKIPPED, OVERDUE
7. `TaskActionType`: COMPLETE, SKIP, REOPEN
8. `WeightMethod`: SCALE, TAPE_ESTIMATE
9. `MortalityReasonCategory`: DISEASE, CULLING, ACCIDENT, UNKNOWN
10. `AlertType`: GROWTH_DEVIATION, HIGH_MORTALITY, LOW_UNIFORMITY, TASK_NONCOMPLIANCE, OVERSTOCK_RISK, LOW_DATA_QUALITY
11. `AlertSeverity`: INFO, WARNING, CRITICAL
12. `AlertStatus`: OPEN, ACKNOWLEDGED, RESOLVED, DISMISSED
13. `ConfidenceLevel`: LOW, MEDIUM, HIGH

## HCI Guardrails mapped to the Step 1-4 flow

1. Registration has at most 6 fields and completes in under 2 minutes.
2. First-time setup modal requests only missing fields and uses defaults/select options.
3. Batch creation keeps required fields <= 5 plus 1 recommended field.
4. Daily logging screens are independent and short: feed (daily), weight, mortality each can be submitted in under 30 seconds.
5. Analytics and projections are read-first outputs; users are not asked for complex technical inputs.

## Entity Blueprint Reference (husbandry-grounded)

**Core husbandry sources mapped to fields**
1. WOAH animal welfare / ASF: disease risk, welfare state, containment, mortality, biosecurity, isolation, movement, alert severity.
2. FAO animal body / healthy animal / disease spread: body temperature, appetite, behavior, gait, droppings, breathing, housing cleanliness, clean water/feed, disease observation.
3. National Academies/NRC swine nutrition: feed program, feeding stage context, growth and production planning vocabulary.

**Field design rule**
1. Prefer established husbandry nouns and categories over invented terms.
2. Use enums only where the field is already a standard classification in farm practice.
3. Use numeric/date fields for measurements and event timing; avoid encoded prose where a standard term exists.


## Scope boundaries (to avoid overengineering)

1. Exclude nutrient formula calculation, ration optimization, and deep veterinary diagnostics from core scope.
2. Include actionable guidance, milestones, trend interpretation, and practical recommendations.
3. Use stored snapshots for analytics/projections to keep performance simple and scalable.


## Attribute Justification Matrix (planning deliverable)

For each entity attribute, document:
1. Operational purpose in farmer workflow
2. Feature dependency (task generation, analytics, projection, monitoring, alerts)
3. Evidence family (DA/BAI local guidance, WOAH, FAO husbandry, NRC swine nutrition)
4. Data quality rule (required/optional/derived and validation)
5. Risk if omitted (e.g., wrong task, low projection confidence, false alert)

- `BatchStatus`: DRAFT, ACTIVE, INTERRUPTED, COMPLETED
- `BatchCompletionReason`: MARKET_SOLD, EARLY_SOLD, HEALTH_EVENT, CULLED_OUT, OTHER
- `BatchPhase`: STARTER, GROWER, FINISHER, MARKET_READY
- `TaskGenerationTrigger`: BATCH_CREATED, OVERLAY_GENERATED, RULESET_UPDATED
- `GenerationRunStatus`: RUNNING, SUCCESS, PARTIAL_SUCCESS, FAILED
- `ScheduleType` (for rule parser normalization): INTERVAL, EXPLICIT

**Entity relationships**
1. Users 1..* Farms
2. Farm 1..* Batches
3. Batch 1..* Pens (mandatory default pen + optional additional pens)
4. Batch 1..* GeneratedTasks
5. Batch 1..* TaskGenerationRuns
6. Users 1..* TaskGenerationRuns (triggeredBy)

**Validation and integrity rules**
1. `endDate` must be null unless `status = COMPLETED`.
2. `completionReason` required when `status = COMPLETED`.
3. `effectiveHeadcount` must be `> 0` and `<= batchSize`.
4. `dueDate = scheduledDate + allowanceDays`.
5. `completedAt` allowed only when `status = COMPLETED`.
6. Unique constraint for task plan idempotency: (`batch_id`, `rule_id`, `scheduled_date`, `title`).
7. Generation run should be recorded for every base generation or overlay-generation action.
8. `WeightLog.sampleSize` is required; if missing or invalid, the entry is rejected for analytics/projection use and flagged for correction.
9. `FeedLog` must not accept `feedType`; feed type is immutable per batch plan unless changed through explicit batch update workflow that only creates forward-dated overlay tasks.
10. Any batch feed-type change must not rewrite existing base tasks; instead, create forward-dated overlay tasks and record a `TaskGenerationRun` with trigger `OVERLAY_GENERATED`.
11. If `penId` is provided in any log payload, it must belong to the same `batchId` and ownership chain (`user -> farm -> batch -> pen`).
12. `penId` input stays optional; absence of `penId` always resolves to `DEFAULT_PEN` before persistence (no batch-only raw log rows).

**Implementation order inside this slice**
1. Add enums: `BatchStatus`, `BatchCompletionReason`, `BatchPhase`, `TaskGenerationTrigger`, `GenerationRunStatus`, `ScheduleType`.
2. Extend `Batch` and `Farm` with enum-backed fields and required biosecurity asset toggles.
3. Add `Pen` (default + standard roles), `GeneratedTask`, and `TaskGenerationRun` entities.
4. Add repositories and ownership-scoped query methods.
5. Implement task generation service using rules JSON -> persisted `GeneratedTask`.
6. Expose controllers for batch create/list/get, complete/overlay task actions, daily task retrieval, and operational logging endpoints (feed/weight/mortality) with metrics/projection reads.

**Out-of-scope for this slice**
1. Offline sync conflict resolution implementation.
2. Individual pig tracking.
3. Veterinary diagnosis and treatment recommendation workflows.


## Next Planning Phase: DTO and API Contract Specification

**Goal**
1. Freeze request/response contracts before entity/service/controller implementation.
2. Enforce farmer-friendly payloads with strict required-field justification.

**Auth contracts**
1. `AuthRegisterRequest`
- required: firstName, lastName, email, password, farmName, farmSize
- optional: none
- rules: email unique; password policy validation
2. `AuthLoginRequest`
- required: email, password, deviceId
3. `AuthResponse`
- accessToken, accessTokenExpiresAt, sessionId, userId, firstName, lastName, role, farmId, farmSetupStatus
- note: refresh token is delivered via secure HttpOnly cookie (not response body)
4. `AuthRefreshRequest`
- required: deviceId
- note: refresh token is read from HttpOnly cookie
5. `AuthRefreshResponse`
- accessToken, accessTokenExpiresAt, sessionId
- note: rotated refresh token is returned via updated HttpOnly cookie
6. `AuthLogoutRequest`
- required: sessionId
7. `AuthLogoutAllDevicesRequest`
- required: password, currentDeviceId
8. `AuthSessionResponse`
- sessionId, deviceLabel, issuedAt, lastUsedAt, expiresAt, isCurrentDevice

**Farm setup contracts**
1. `FarmSetupUpdateRequest`
- required: housingType, waterSystem, feedingSystem, farmCapacity, environmentProfile, hasFootbath, hasPerimeterFence, hasVisitorLogbook
- optional: location, availableResources
- note: `biosecurityLevel` enum removed; replaced with 3 binary biosecurity asset toggles (collected during farm setup, drives task generation)
2. `FarmProfileResponse`
- includes registration-prefilled fields + setup completion fields + setupStatus

**Batch contracts**
1. `BatchCreateRequest`
- required: farmId, batchSize, geneticsType, initialWeightKg, feedType, startDate, targetMarketWeightKg
- optional: batchName, pens[] (each: penName required, lengthM required, widthM required)
- behavior: if `pens[]` omitted, backend auto-creates `DEFAULT_PEN`
2. `BatchResponse`
- id, farmId, batchSize, geneticsType, initialWeightKg, feedType, startDate, targetMarketWeightKg, status, currentPhase, effectiveHeadcount, penCount, hasDefaultPen

**Task contracts**
1. `TaskListQuery`
- required: batchId, date
- optional: penId (view filter only)
2. `GeneratedTaskResponse`
- id, batchId, penId(optional), scheduledDate, title, detail, category, priority, status, dueDate, isMilestone, estimatedMinutes
3. `TaskCompleteRequest`
- required: taskId
- optional: note

**Weight/feed/mortality log contracts (phase follow-up, but define now)**
1. `WeightLogCreateRequest`
- required: batchId, logDate, method, sampleSize
- optional: penId, note
- required when `method = SCALE`: averageWeightKg, minSampleWeightKg, maxSampleWeightKg
- required when `method = TAPE_ESTIMATE`: tapeMeasurements[] (per sampled pig: heartGirthCm, bodyLengthCm)
- rules:
  - for tape mode, backend auto-computes each sampled pig weight from tape measurements, then derives `averageWeightKg`, `minSampleWeightKg`, and `maxSampleWeightKg`
  - enforce `minSampleWeightKg <= averageWeightKg <= maxSampleWeightKg`
  - derive `sampleSpreadPercent = ((maxSampleWeightKg - minSampleWeightKg) / averageWeightKg) * 100`
  - if `penId` is omitted, resolve to `DEFAULT_PEN`; if provided, validate that pen belongs to `batchId`
2. `FeedLogCreateRequest`
- required: batchId, logDate, totalFeedKg
- optional: penId, note
- rules: no feedType field allowed; omitted `penId` resolves to `DEFAULT_PEN`
3. `MortalityLogCreateRequest`
- required: batchId, logDate, count, reasonCategory
- optional: penId, note
- rule: omitted `penId` resolves to `DEFAULT_PEN`

**Projection and metrics contracts**
1. `ProjectionSnapshotResponse`
- batchId, penId(optional), scope(`PEN`|`BATCH`), asOfDate, expectedWeightKg, actualWeightKg, weightDeviationPercent, projectedMarketDate, confidenceLevel, modelType(`GOMPERTZ`), modelVersion, reliabilityReasons[]
2. `BatchMetricSnapshotResponse`
- batchId, penId(optional), scope(`PEN`|`BATCH`), asOfDate, adg, fcr, adfi, efi, currentHeadcount, survivalRate, stockingDensityKgPerM2, sampleSpreadPercent, uniformityBand, dataCompleteness, confidenceLevel, benchmarkContext

**Alert contracts**
1. `AlertResponse`
- id, batchId, alertType, severity, message, recommendedAction, status, triggeredAt, acknowledgedAt
2. `AlertAcknowledgeRequest`
- required: alertId

**Validation conventions**
1. Use bean validation annotations for all required fields.
2. Cross-field validators for:
- batch start/end/completion consistency
- weight method vs sample requirements
- method-specific required fields (SCALE direct values vs TAPE_ESTIMATE tapeMeasurements modal payload)
- min/avg/max weight consistency (`min <= avg <= max`)
- no feedType in feed log payload
- optional `penId` ownership-chain validation (`pen -> batch -> farm -> user`)
3. Return consistent validation error shape for frontend mapping.

**Execution order for implementation handoff**
1. Finalize DTO classes and validation annotations.
2. Update service interfaces to consume DTOs.
3. Add controller endpoints with ownership checks.
4. Add contract tests for required fields and invalid payloads.


## Next Planning Phase: Endpoint Acceptance Criteria and Error Semantics

**Purpose**
1. Convert DTO planning into testable API behavior.
2. Define success and failure outcomes per endpoint before coding.

**Global API rules**
1. All farmer endpoints require JWT auth.
2. All farmer endpoints enforce ownership (`farm.ownerId == authenticatedUserId`).
3. Validation errors return consistent shape: field, message, code.
4. Domain errors return stable codes (`FARM_SETUP_INCOMPLETE`, `BATCH_NOT_FOUND`, `TASK_NOT_ACTIONABLE`, `PEN_NOT_IN_BATCH`, `PEN_ACCESS_DENIED`, `AUTH_REFRESH_INVALID`, `AUTH_REFRESH_REUSED`, etc.).

**Auth endpoints**
1. `POST /api/auth/register`
- success: creates user + initial farm shell, returns access token + session context + farmSetupStatus `PARTIAL`, and sets refresh cookie
- validation fail: duplicate email, weak password, missing required fields
2. `POST /api/auth/login`
- success: access token + sessionId + user context + farmSetupStatus, and sets refresh cookie
- fail: invalid credentials, locked/disabled account
3. `POST /api/auth/refresh`
- success: validates refresh cookie, rotates refresh token cookie, and returns new access token
- fail: invalid/revoked/expired refresh token cookie, token reuse detected
4. `POST /api/auth/logout`
- success: revokes current device session and clears refresh cookie
5. `POST /api/auth/logout-all-devices`
- success: revokes all active sessions for the account (lost-device recovery flow) and clears current refresh cookie
6. `GET /api/auth/sessions`
- success: returns active device sessions for account-level review

**Auth security/session rules (mandatory)**
1. Access token lifetime: short-lived (target range 15-60 minutes; default profile can be 20 minutes).
2. Refresh token lifetime: long-lived (target range 30-90 days) with both absolute expiry and inactivity expiry controls.
3. Refresh token transport/storage for web: refresh token must be stored only in secure HttpOnly cookie with `Secure` and appropriate `SameSite` policy.
4. Refresh token rotation: every successful refresh invalidates old token and issues a new token.
5. Refresh token reuse detection: if an old token is reused, revoke compromised session (and optionally all sessions based on risk policy).
6. CSRF protection: refresh/logout endpoints must enforce CSRF defense compatible with cookie-based session refresh.
7. Server-side token storage: store refresh token hashes only (never plain token), with session metadata (deviceId, issuedAt, lastUsedAt, expiresAt, revoked).
8. Lost-device recovery: `logout-all-devices` must revoke all active sessions immediately.

**Farm setup endpoints**
1. `GET /api/farmer/farms/{farmId}`
- success: returns prefilled registration values + setup fields + setupStatus
- fail: forbidden for non-owner
2. `PUT /api/farmer/farms/{farmId}/setup`
- success: persists required setup fields and returns setupStatus `COMPLETE`
- fail: missing required setup fields, including biosecurity toggles (`hasFootbath`, `hasPerimeterFence`, `hasVisitorLogbook`)

**Batch endpoints**
1. `POST /api/farmer/batches`
- precondition: farm setup must be `COMPLETE`
- success: creates one active batch and returns batch summary with pen registry
- side effects: auto-create `DEFAULT_PEN`, persist additional pens when provided, trigger task-generation run
- fail: setup incomplete, another active batch already exists, invalid batch values, or invalid pen payload (for example duplicate pen names in same batch)
2. `GET /api/farmer/farms/{farmId}/batches`
- success: list owner batches sorted by startDate desc
3. `POST /api/farmer/batches/{batchId}/close`
- success: closes batch with completionReason and endDate
- fail: invalid state transition
4. `POST /api/farmer/batches/{batchId}/pens`
- success: adds pen with dimensions (`lengthM`, `widthM`) and computed `areaM2`
- fail: invalid dimensions, duplicate pen name, or non-active batch state
5. `POST /api/farmer/batches/{batchId}/transfers`
- success: records transfer event (`fromPenId`, `toPenId`, `headcount`) and triggers immediate recalculation for both pens
- fail: invalid pen mapping, insufficient source headcount, or cross-batch pen usage

**Task endpoints**
1. `GET /api/farmer/batches/{batchId}/tasks?date=...&penId=...`
- success: returns scheduled tasks with status and dueDate; when `penId` is provided, apply view-level pen filter
2. `POST /api/farmer/tasks/{taskId}/complete`
- success: marks task completed and writes action log
- fail: task already completed or outside allowed transition
3. `POST /api/farmer/batches/{batchId}/overlay-tasks`
- success: creates additional overlay tasks without modifying base generated tasks, stores `TaskGenerationRun` as overlay run
- fail: no permission or invalid batch state

**Weight logging endpoints**
1. `POST /api/farmer/batches/{batchId}/weight-logs`
- required: logDate, method, sampleSize
- optional: penId
- required when SCALE: averageWeightKg, minSampleWeightKg, maxSampleWeightKg
- required when TAPE_ESTIMATE: tapeMeasurements[] captured via tape-measure modal
- success: stores normalized weight log with resolved pen context, derived spread, and computed confidence
- rules:
  - if method is TAPE_ESTIMATE, backend auto-computes weights using heart girth and body length entries
  - enforce min/avg/max consistency after computation
  - if `penId` is omitted, auto-resolve to `DEFAULT_PEN`
  - if `penId` is present, it must belong to the `batchId`
- fail: sampleSize missing/invalid, missing method-specific fields, invalid tape measurement entries, invalid foreign `penId`

**Feed logging endpoints**
1. `POST /api/farmer/batches/{batchId}/feed-logs`
- required: logDate, totalFeedKg
- optional: penId
- rule: feedType is not accepted in payload
- success: stores feed quantity tied to batch feedType with resolved pen context (`penId` explicit or `DEFAULT_PEN` auto-routed)
- fail: invalid quantity/date, invalid foreign `penId`, or forbidden payload field

**Mortality logging endpoints**
1. `POST /api/farmer/batches/{batchId}/mortality-logs`
- required: logDate, count, reasonCategory
- optional: penId
- success: stores event with resolved pen context and updates pen + batch effectiveHeadcount timelines
- fail: count <= 0, resulting headcount invalid, or invalid foreign `penId`

**Projection and metrics endpoints**
1. `GET /api/farmer/batches/{batchId}/projection?penId=...`
- success: returns expectedWeightKg, actualWeightKg, weightDeviationPercent, projectedMarketDate, confidenceLevel, modelType, modelVersion, reliabilityReasons[]
- rule: projection computes pen-first and returns either pen-scoped view (`penId` supplied) or deterministic batch roll-up (`penId` omitted)
- fail: insufficient baseline data -> return low-confidence response with actionable message (not hard crash)
2. `GET /api/farmer/batches/{batchId}/metrics?penId=...`
- success: returns ADG/FCR/ADFI/EFI plus headcount, survival, density, uniformity spread/band, benchmark context, and completeness/confidence fields
- rule: metrics compute from pen-level facts first and return either pen-scoped view (`penId` supplied) or deterministic batch roll-up (`penId` omitted)
- fail: insufficient logs -> return partial metrics with quality flags

**Alert endpoints**
1. `GET /api/farmer/batches/{batchId}/alerts`
- success: list alerts sorted by severity then triggeredAt desc
- includes low-uniformity alerts generated from `sampleSpreadPercent` threshold rules
2. `POST /api/farmer/alerts/{alertId}/acknowledge`
- success: status moves OPEN -> ACKNOWLEDGED
- fail: invalid state transition or non-owner

**Acceptance tests to define before implementation**
1. Auth login path: login returns access+refresh tokens, sessionId, and user context.
2. Silent refresh path: expired access token with valid refresh token returns rotated access+refresh tokens.
3. Refresh reuse-detection path: reused/previous refresh token is rejected and compromised session is revoked.
4. Session expiry path: inactivity and absolute session expiry policies are enforced.
5. Logout current-device path: current session is revoked and refresh endpoint fails afterward.
6. Logout-all-devices path: all sessions are revoked immediately (lost-device recovery).
7. Session-list path: active sessions endpoint returns device sessions with current-device marker.
8. Happy path: register -> login -> dashboard access -> create batch trigger -> complete setup (including biosecurity toggles) -> create batch -> tasks generated with biosecurity-driven tasks -> daily task fetch.
9. Setup-gate behavior path: login never hard-blocks dashboard; setup is hard-gated only when user starts production actions.
10. Guard path: reject batch creation when farm setup incomplete (biosecurity toggles required) and reject creation when another active batch already exists for the farm.
11. Biosecurity path: verify that missing biosecurity asset toggles generate corrective base tasks (e.g., hasFootbath=false generates daily sanitization task).
12. Daily feed path: feed log endpoint supports everyday submissions with simple required fields.
13. Data quality path: reject weight log without sampleSize.
14. Uniformity validation path: reject weight log when `minSampleWeightKg > averageWeightKg` or `averageWeightKg > maxSampleWeightKg`.
15. Tape modal path: when method is TAPE_ESTIMATE, require tapeMeasurements modal payload and auto-compute weights server-side.
16. Uniformity policy path: map spread to GOOD/WATCH/ALERT (`<15`, `15-25`, `>25`).
17. Uniformity confidence guard path: if sample ratio is below 10%, do not escalate to hard RED alert even when spread exceeds 25%.
18. Pig-days path: ADFI uses day-scoped active headcount and changes denominator immediately after mortality-effective date.
19. Date-scoped mortality path: pre-mortality period and post-mortality period compute with different active headcounts.
20. Density path: compute kg/m2 per pen using current headcount * current average weight / pen area, then roll up batch risk summary from pen states.
21. Crowding penalty path: when density threshold is exceeded, bounded kappa penalty is applied and reflected in updated projection date.
22. Threshold registry path: changing threshold values in registry updates alert behavior without redeploy.
23. Regional baseline path: batch #1 compares against regional baseline window; batch #2 compares against batch #1; batch #3+ compares against rolling average.
24. Non-diagnostic wording path: alerts use management-safe language and avoid diagnosis claims.
25. Consistency path: reject feed log payload containing feedType.
26. Ownership path: cross-owner access denied for all farmer resources.
27. Recovery path: projection endpoint returns low-confidence output instead of server error when data sparse.
28. Gompertz baseline path: projection uses genetics profile defaults (`alpha`, `kappa`, maturity profile) when farm-specific calibration is not yet available.
29. Gompertz reliability path: scale-based logs produce higher confidence weighting than tape-based logs, with explicit reliability reasons in response.
30. Batch reality sync path: weight/feed/mortality/transfer events trigger recalculation and snapshot refresh in correct sequence.
31. Mortality economic insight path: logging mortality emits estimated wasted-feed impact message with confidence tag.
32. Pen logging path: weight/feed/mortality log submissions succeed with valid `penId` tied to the same batch.
33. Default-pen routing path: weight/feed/mortality submissions without `penId` are auto-routed to `DEFAULT_PEN` and persisted with resolved `penId`.
34. Default-pen creation path: batch creation auto-creates exactly one `DEFAULT_PEN` before any logging.
35. Pen ownership guard path: reject log payload when `penId` belongs to another batch/farm.
36. Pen-first metrics path: metrics/projection are computed from pen-level facts and exposed as pen view (`penId`) or batch roll-up (no `penId`).
37. Transfer path: transfer event updates source and destination pen headcounts and triggers immediate recalculation.
38. Pen optionality path: single-pen farms complete setup and daily operations without manual pen management.



## Gompertz Growth Projection Framework (5-Layer, Phased and Configurable)

**Purpose**
1. Deliver production-ready pen-first growth projection using Gompertz with deterministic batch roll-up, while preserving farmer trust and data quality transparency.
2. Keep projection behavior configurable by profile/region and avoid hard-coded rules that cannot adapt.

**Core model**
1. Use pen-level Gompertz projection as the canonical computation model:
- `W_pen,t = alpha * exp(-beta * exp(-kappa_pen * t))`
2. Apply crowding/environment/management offsets at pen level before roll-up.
3. Compute batch projection as deterministic roll-up of pen projections using headcount-weighted aggregation.
4. Keep batch as summary and decision layer, with no individual pig tracking.

**Layer 1: Genetic Baseline (ceiling + curve)**
1. Source profile from genetics library:
- `alpha` (asymptotic weight)
- `kappa` (growth rate coefficient)
- maturity profile (breed/cross-specific maturity behavior)
2. Validation and guidance:
- if logged weight exceeds feasible range vs genetics profile, flag mismatch warning (warning-first behavior)
- if observed weight approaches harvest-efficiency boundary, issue management recommendation (not hard diagnostic claim)
3. All thresholds are configuration-driven by profile and can be tuned without code changes.

**Layer 2: Biological and Statistical Sanity (noise filter)**
1. Apply plausibility checks on ADG and interval growth deltas.
2. Maintain sample-size confidence rule (>=10% recommended, <10% low confidence badge).
3. Weight-for-age plausibility check uses configurable growth reference ranges by profile.
4. Entry handling policy:
- warning + confirmation for improbable but possible values
- hard rejection only for physically impossible/extreme invalid data

**Layer 3: Environmental and Climatic Offsets (Mindanao factor)**
1. Add climate-sensitive adjustment pipeline for growth-rate drift (heat stress context).
2. Inputs: month/season fallback + housing type now; optional future real weather inputs.
3. Apply bounded offset to `kappa` (configurable range, capped adjustment).
4. Density rule evaluates pen-level density and applies bounded penalty only to affected pens, then propagates impact into batch roll-up confidence and dates.

**Layer 4: Management and Strategy Inputs (strategy factor)**
1. Adjust projection using stored feeding strategy and feed form:
- feed form multipliers
- feeding system effects on inflection behavior
2. Strategy effects are profile-parameterized and forward-applied by effective date (no backward rewriting).

**Layer 5: Measurement Reliability (evidence factor)**
1. Method support for this phase: `SCALE` and `TAPE_ESTIMATE` only.
2. Tape estimate option uses a dedicated measurement modal and always computes sample weights from required entries (`heartGirthCm`, `bodyLengthCm`), instead of manual weight typing.
3. Method weighting:
- scale observations receive higher reliability weight
- tape observations receive lower reliability weight with smoothing compensation
4. Reliability logic feeds confidence level and response `reliabilityReasons[]`.

**Operational output contract (projection)**
1. Every projection response returns:
- expected weight, deviation, projected market date
- confidence level
- model metadata (`modelType`, `modelVersion`)
- reliability reason codes/messages for transparency
2. If data is sparse/low-quality, return usable low-confidence projection with guidance, not server failure.

**Rollout sequence (recommended)**
1. Phase A: Layer 1 + Layer 5 + existing confidence model.
2. Phase B: Layer 2 sanity filters + uniformity integration.
3. Phase C: Layer 3 environmental offsets.
4. Phase D: Layer 4 management multipliers and calibration tuning.
5. Phase E: profile-level parameter governance and periodic recalibration.

**Scope and safety guard**
1. Keep all projection and alert wording management-focused and non-diagnostic.
2. Use warning-first behavior for uncertain data and avoid unnecessary hard blocking.
3. Any threshold or penalty value must be stored in configurable parameter registry, not hard-coded constants.

## Next Phase: Metrics and Operational Reality Engine (Must-Fix Finalized)

**Phase purpose**
1. Convert raw logs into decision-ready metrics using pen-level computation for operations and batch-level roll-up for business decisions.
2. Keep metrics accurate under mortality, crowding, climate drift, and method uncertainty.
3. Preserve farmer trust through transparent confidence and management-safe wording.

**Metric ownership split (locked)**
1. Pen monitoring (daily check level): `ADG_pen`, `ADFI_pen`, `densityKgPerM2_pen`, pen mortality trend, pen alerts.
2. Batch analytics (business level): `FCR_batch`, total mortality percent, projected harvest date, profitability indicators, batch uniformity.
3. Rule: metrics exposed at batch level must be deterministic roll-ups of pen-level facts.


**1) Performance metrics (growth and feed logic)**
1. Pen-level ADG formula: `ADG_pen = (W_pen,t - W_pen,t-1) / daysElapsed`.
2. Pen-level ADFI formula uses pig-days denominator: `ADFI_pen = sum(dailyFeedKg_pen) / sum(activePigsPerDay_pen)`.
3. Batch FCR formula: `FCR_batch = totalFeedConsumed_allPens / totalLiveWeightGain_allPens` with explicit economic handling for mortality (see section 5).
4. Batch EFI formula: `EFI_batch = survivalRate_batch * (ADG_batch / FCR_batch) * 100` where `survivalRate_batch = currentHeadcount_batch / initialHeadcount_batch`.
5. Handling policy:
- use age/stage-aware benchmark bands
- configurable outlier and stagnation thresholds via registry
- warning-first for improbable values; hard reject only extreme impossible deltas after interval sanity checks
6. Interpretation policy:
- no universal global gold score lock in this phase
- use regional baseline windows first, then farm-specific historical progression (see section 6)

**2) Pig-days logic (mandatory ADFI fix)**
1. ADFI must be computed as: `ADFI_pen = sum(dailyFeedKg_pen) / sum(activePigsPerDay_pen)`.
2. Implement helper: `getPigDays(batchId, penId, startDate, endDate)` sourced from mortality + transfer timeline.
3. Implement helper: `getCurrentHeadcount(batchId, penId, asOfDate)` as the canonical denominator source for date-scoped pen calculations and endpoint responses.
4. Implement roll-up helper: `rollupBatchMetricsFromPens(batchId, asOfDate)` with documented weighting and completeness rules.
5. Date-scoped rule: mortality changes denominator from effective mortality date onward.
6. Mortality timing policy must be standardized (single configured day-cutoff rule) and applied consistently in analytics queries.
7. Missing feed-day handling: do not silently assume zero feed; reduce `dataCompleteness` and emit reliability reason.
8. Result expectation: feed-intake metrics reflect the exact day headcount changes, preventing artificial dilution from outdated denominators.

**3) Operational metrics (risk and space logic)**
1. Dynamic density uses mass-per-space at pen level, not heads-only:
- `densityKgPerM2_pen = (currentHeadcount_pen * currentAverageWeightKg_pen) / penAreaM2`
2. Default phase limits (registry-configurable):
- grower reference limit: `40 kg/m2`
- finisher reference limit: `60 kg/m2`
3. If density exceeds active phase threshold, apply bounded Gompertz `kappa` penalty (default configurable range `5%` to `10%`).
4. Mortality tracker:
- append-only mortality logs
- all metrics (`ADFI`, `FCR`, `density`, `EFI`) re-query current headcount/date scope before calculation
- cumulative mortality threshold alert (default configurable reference: `3%` critical management review)
5. Uniformity tracker uses spread from min/max/avg sample weights:
- `sampleSpreadPercent = ((max - min) / avg) * 100`
- policy bands locked: `0-15%` Excellent, `15-25%` Watch, `>25%` Alert
- recommendation can appear at Watch band (for example, size sorting advice)
- hard RED alert never triggers when sample ratio is below `10%` (confidence guard)

**4) Low-friction density data capture (farmer UX)**
1. One-time setup capture: total available housing area in farm setup.
2. Pen registry UX at batch creation/edit:
- system always creates `DEFAULT_PEN` (zero extra burden for simple farms)
- farmer may add one or more pens using `lengthM` and `widthM`; backend computes `areaM2`
- pen dimensions are stored once and reused for all density calculations
3. Re-ask dimensions only when farmer edits pen profile or records area-change event.
4. Alert behavior: do not spam "space is OK" notices; trigger only when density risk can affect growth/efficiency.

**5) Mortality-aware metric truth (economic and biological)**
1. `ADFI` always uses pig-days denominator.
2. `FCR` economic rule:
- numerator includes all feed consumed by batch (including feed eaten by pigs that later died)
- denominator uses live gain basis for surviving production output in economic reporting view
- expose clear label so farmer understands mortality cost impact
3. `densityKgPerM2` must update after every mortality and weight event.
4. `EFI` survival multiplier must directly penalize high-mortality outcomes.
5. Economic impact insight on mortality event:
- show estimated wasted feed impact message using confidence-tagged estimate

**6) Regional baseline warm start strategy**
1. Introduce `Regional_Baseline` reference for first-cycle contextual benchmarking.
2. Batch comparison progression:
- batch #1: compare to regional + profile baseline window
- batch #2: compare to batch #1 (personal best trend)
- batch #3+: compare to rolling average (consistency trend)
3. Benchmarks should be profile-aware (region, housing, feed form/system, genetics).
4. UI messaging should frame target windows as reachable, actionable guidance (no fail-shaming language).

**7) Registry pattern (no hard-coded constants)**
1. Introduce configurable registry store for thresholds and penalties (for example `Threshold_Registry`).
2. Registry supports entries such as:
- `MAX_ADG_GROWER` (default example `1.2`)
- `MAX_DENSITY_FINISHER` (default example `60.0`)
- `UNIFORMITY_ALERT_THRESHOLD`
- `MORTALITY_CRITICAL_THRESHOLD`
- `KAPPA_PENALTY_DENSITY_MAX`
3. Registry records should include: key, value, unit, scope dimensions (region/profile/phase), source, version, effective dates.
4. Fallback order: most specific scope -> regional default -> global default.

**8) Batch reality sync chain reaction (backend logic engine)**
1. Trigger recalculation workflow when weight/feed/mortality/transfer events are saved.
2. Recompute sequence:
- update active headcount timeline
- recompute density and survivability values
- apply Gompertz offsets (THI/climate, density, feed strategy)
- recompute harvest projection and reliability reasons
- persist analytics snapshot
3. Use event-triggered recomputation and snapshot persistence; do not recompute full analytics on every page refresh.

**9) Technical no-sugar-coating rules (mandatory)**
1. Guard all formulas against divide-by-zero and null denominator states.
2. Negative ADG should not be auto-rejected; treat as high-priority management deviation with non-diagnostic wording.
3. Keep warning-first behavior for improbable but possible values; hard reject only impossible extremes.
4. Snapshot storage is mandatory for performance and consistency across views; persist both pen and batch snapshots (`Pen_Analytics_Snapshot` and `Batch_Analytics_Snapshot`, or equivalent).

**10) Management-safe wording guard (non-diagnostic)**
1. Do not use direct diagnostic claims in alerts/messages.
2. Approved tone examples:
- `Growth Reversal detected. Physical observation of the batch is recommended. Consult a specialist if performance continues to lag.`
- `Environmental Stress or Health Deviation suspected due to performance drop.`
3. All message text for this phase must be centralized under unified message architecture with code-based templates.

## Core Product Objective and Scope Guard (Non-negotiable)

**Objective statement (locked)**
IntelliSwine modernizes swine production by transforming manual, fragmented workflows into a structured, data-driven management system. It provides farmers with a science-based roadmap (tasks) and real-time visibility (analytics) into batch performance. IntelliSwine is a management tool for operational efficiency and informed decision-making, not a diagnostic health or veterinary system.

**Design guardrails derived from objective**
1. Include: planning, scheduling, logging, projections, metrics, monitoring, and actionable management alerts.
2. Exclude: disease diagnosis, treatment recommendation engines, prescription logic, and veterinary decision substitution.
3. Wording rule: alerts must use management language ("risk", "deviation", "check", "consult veterinarian") and avoid diagnostic claims.
4. Data rule: collect only operational inputs needed for tasks/analytics/projection/monitoring.
5. Granularity rule: IntelliSwine enforces one active batch per farm with pen-level operational modeling in the same build; batch remains the management summary layer, and per-pig tracking is out of scope.
6. Feature gate: any new feature must pass an objective-fit check before inclusion.

**Objective-fit check (for all future additions)**
1. Does this improve farm operations workflow?
2. Does it materially improve task quality, projection reliability, or management decisions?
3. Can it be expressed without diagnostic/veterinary claims?
4. Does it preserve one-active-batch scope, pen-level operational integrity, and no per-pig tracking?
5. Is data collection burden justified by clear farmer value?
If any answer is "no", feature is deferred or rejected.


## Engineering and UX Implementation Guardrails (Always Enforced)

**Frontend guardrails (HCI + UI/UX + farmer-first language)**
1. Apply HCI principles in all screens: progressive disclosure, one-screen daily workflow, clear next-step guidance, and visible system status.
2. Use farmer-centered wording in labels, helper text, validation errors, and alerts; use plain farm language first, technical terms second.
3. Every required input must state: what to enter, why it matters, and where it is used.
4. UI/UX quality baseline: readable typography, clear contrast, predictable navigation, mobile-first responsiveness, accessible form interactions, and fast feedback states.
5. Frontend implementation must follow best practices: component reuse, separation of concerns, input validation, API error mapping, loading/empty/error states, and avoid duplicated logic.
6. Web mobile-first auth storage must keep refresh tokens only in secure HttpOnly cookies and never in browser localStorage/sessionStorage.

**Backend guardrails (code quality and architecture)**
1. Enforce SOLID in service/module design; keep controllers thin and place business rules in services.
2. Apply DRY: shared validators, shared mapping utilities, and centralized domain rules.
3. Apply KISS: prefer simple readable flows over unnecessary abstraction.
4. Apply YAGNI: implement only capabilities required by the approved scope and defer speculative features.
5. Follow general software best practices: cohesive modules, meaningful naming, defensive validation, explicit error semantics, and testable units.
6. Authentication services must enforce refresh-token hashing, rotation, reuse detection, and device-session revocation as first-class security controls.

**Unified message architecture (for structure + easy refactor)**
1. Segregate messages by classification dimensions:
- `severity`: `INFO`, `WARNING`, `CRITICAL`
- `audience`: `FARMER`, `SYSTEM`, `ADMIN`
- `type`: `ALERT`, `VALIDATION`, `GUIDANCE`, `STATUS`
2. Use stable `messageCode` keys for backend-frontend mapping; keep display text farmer-friendly and changeable without breaking logic.
3. Centralize messages in a unified message module/folder and reference from APIs, services, and UI components (avoid hard-coded scattered strings).
4. Alert response model should carry `messageCode`, `severity`, `audience`, `type`, and `message`.
5. Copy updates must happen in the centralized message module first, then consumed by all layers.

**Folder and code organization rule (applies across project)**
1. Structure code by feature/domain first, then by layer (controller/service/repository/dto/entity for backend; pages/components/services/utils for frontend).
2. Keep shared cross-cutting assets centralized (`messages`, `validators`, `constants`, `error-codes`) to reduce duplication and refactor risk.
3. New files must follow existing naming and package conventions; avoid dumping unrelated files in generic folders.

**Verification additions for these guardrails**
1. PR review checklist must include frontend HCI/UI-UX checks and farmer-language checks.
2. PR review checklist must include SOLID/DRY/KISS/YAGNI checks.
3. Ensure no user-facing strings are hard-coded across multiple files when a centralized message entry exists.
4. Validate all alert/notification payloads include the agreed message classification fields.
5. Validate auth security controls: refresh hashing, token rotation, reuse detection, and device-session revocation behavior.

## Optimization Updates Approved (Farmer Adoption + Data Quality)

**Optimization 0: Authentication Session Continuity (Dual-Token)**
1. Prioritize auth optimization first to remove repeated login friction for farmers.
2. Implement dual-token model:
- short-lived `accessToken` for API calls
- long-lived `refreshToken` for silent session renewal
3. Session continuity behavior:
- when access token expires, app refreshes silently using refresh token
- farmer remains signed in unless token/session is revoked or expired by policy
4. Security controls:
- refresh token rotation on every refresh
- reuse detection and revocation response
- hashed server-side token storage with device session metadata
- support logout current device and logout all devices
5. Farmer-facing outcome:
- fewer login interruptions
- secure lost-device recovery from account-level session controls

**Optimization 1: Farm Setup Gate Framing (HCI copy update)**
1. Replace generic setup gate text with benefit-linked statement.
2. Canonical setup prompt:
- Title: `Unlock Your IntelliSwine Growth Plan`
- Body: `To generate your personalized, science-backed production guide and growth projections, we need a bit more detail. By describing your housing and water systems now, we can tailor every task to your specific farm-helping you minimize risks and maximize weight gain. Estimated time: 2 minutes.`
- Primary CTA: `Setup My Farm Now`
3. UX behavior:
- after login, allow dashboard access even when `Farm.setupStatus = PARTIAL`
- show setup reminder when `Farm.setupStatus = PARTIAL`
- trigger blocking setup gate only on production-start actions (for example, create batch)
- include progress indicator and estimated completion time
- prefill known fields (farmName, farmSize)

**Optimization 2: Weight Sampling Confidence Policy**
1. Accept all weight logs (including very small samples) to avoid blocking real workflows.
2. Require `sampleSize` always; compute `sampleRatio = sampleSize / batchSize`.
3. Confidence tiering:
- `HIGH`: sampleRatio >= 0.15
- `MEDIUM`: 0.10 <= sampleRatio < 0.15
- `LOW`: sampleRatio < 0.10
4. If sampleSize is below 10% of batch:
- accept log
- show Low Confidence badge
- attach actionable prompt to increase sample next weighing
5. Milestone weighing (Day 30/60/90):
- not hard-blocked
- strongly recommended threshold of >=10% sample for reliable projection updates

**Optimization 3: Feed Strategy vs Feed Stage Separation**
1. Batch-level farmer strategy (set at batch creation):
- `feedingSystem`: `AD_LIBITUM` or `RESTRICTED`
- `feedForm`: `COMMERCIAL_PELLETS` or `HOME_MIXED`
- `feedingSchedule` (required only if RESTRICTED)
2. Task-level scientific guidance (generated by system):
- stage transition tasks such as `Transition to Finisher Feed`
- driven by growth schedule and/or threshold triggers (e.g., day-age and/or weight criteria)
3. Rule engine behavior:
- use batch feeding strategy to shape daily instructions
- use husbandry growth-stage schedule to determine transition timing
- never ask farmer to manually decide grower-vs-finisher transition logic

## Schema and Enum Delta for Optimization

1. Batch entity add/confirm fields:
- `feedingSystem`
- `feedForm`
- `feedingSchedule` (nullable unless RESTRICTED)
2. Task entity/response add context fields:
- `feedStageRecommendation` (`GROWER`, `FINISHER`, optional when irrelevant)
- `taskOrigin` (`BASE_PLAN`, `OVERLAY_ALERT`, `OVERLAY_MANUAL`)
3. Enum additions/updates:
- `FeedingSystem`: `AD_LIBITUM`, `RESTRICTED`
- `FeedForm`: `COMMERCIAL_PELLETS`, `HOME_MIXED`
- `FeedStage`: `GROWER`, `FINISHER`
- `TaskOrigin`: `BASE_PLAN`, `OVERLAY_ALERT`, `OVERLAY_MANUAL`

## Farmer-Facing Field Statement Rules (Required)

1. Every required field must include helper text:
- what to enter
- why IntelliSwine needs it
- where it is used (tasks/projection/alerts)
2. Use plain farm language first; technical terms as secondary labels.
3. Keep each form section short with immediate value framing.

**Optimization 4: Biosecurity Buffer (Mandatory Farm Setup Pillar)**

1. **Collection point: Farm setup (FarmSetupUpdateRequest)**
   - Add three required boolean toggles:
     - `hasFootbath` (boolean)
     - `hasPerimeterFence` (boolean)
     - `hasVisitorLogbook` (boolean)
   - These are captured **once** during initial farm setup flow (after registration/login, before batch creation)
   - Immutable unless farmer explicitly edits farm profile

2. **UX framing during setup:**
   - Section title: "Biosecurity Infrastructure"
   - Helper text (for entire section): "These practices protect your herd from disease. Check each item you have in place. Missing items? IntelliSwine will add daily checks to your plan to compensate until infrastructure is upgraded."
   - Per-toggle explanations:
     - Footbath: "Disinfectant entry point for vehicles/visitors—reduces disease transmission"
     - Perimeter fence: "Boundary protection—prevents unauthorized access and wild animal contact"
     - Visitor logbook: "Track who enters your farm, when, and their health status"
   - Benefit statement: "Complete biosecurity setup unlocks faster growth projections and baseline maintenance tasks instead of corrective protocols."

3. **Task generation tie-in (at batch creation):**
   - Read farm biosecurity toggles during `TaskGenerationService.generateBaseTasks(batch, farm, rules)`
   - If `hasFootbath = false`: generate daily/weekly sanitization task (e.g., "Daily Entry Point Check & Sanitize")
   - If `hasPerimeterFence = false`: generate weekly inspection task (e.g., "Weekly Perimeter Boundary Inspection")
   - If `hasVisitorLogbook = false`: generate setup task + daily checklist reminder (e.g., "Establish Visitor Logbook Protocol" on Day 1, then daily reminder)
   - If all three are true: generate baseline **maintenance** tasks (e.g., "Weekly Footbath Inspection & Cleaning", "Visitor Logbook Review")
   - All biosecurity-driven tasks are marked `taskOrigin = BASE_PLAN` (not overlay)

4. **Schema and DTO updates:**
   - `Farm` entity add fields:
     - `hasFootbath` (boolean, not null, default false)
     - `hasPerimeterFence` (boolean, not null, default false)
     - `hasVisitorLogbook` (boolean, not null, default false)
   - `FarmSetupUpdateRequest` payload:
     - required: `hasFootbath`, `hasPerimeterFence`, `hasVisitorLogbook` (in addition to housing, water, feeding)
   - `FarmProfileResponse` include: `hasFootbath`, `hasPerimeterFence`, `hasVisitorLogbook`

5. **Task rule engine behavior:**
   - Rule JSON (in task-rules.json) should include conditional branches:
     - `"conditions": { "biosecurityAsset": "footbath_missing" }` → emit sanitization/monitoring task
     - `"conditions": { "biosecurityAsset": "fence_missing" }` → emit perimeter inspection task
     - `"conditions": { "biosecurityAsset": "logbook_missing" }` → emit logbook setup + daily reminder tasks
   - Rule intent: when a biosecurity asset is missing, generate corresponding corrective base tasks for that batch (for example, missing footbath triggers recurring entry-point sanitization tasks).

6. **Data minimization & trust:**
   - Only 3 binary toggles; no complex configuration or free-text fields
   - Respects farmer reality: may not have all infrastructure yet
   - Compensates with workflow: missing infrastructure → daily management tasks instead of warnings
   - Prevents false confidence: system acknowledges every biosecurity gap during every batch lifecycle
   - Infrastructure gap remains visible in task plan; farmer can see problem every day

## Final Acceptance Checks (Reliability Lock)

1. One-active-batch guard: farm cannot create a second active batch until current batch is closed.
2. Default-pen guarantee: each new batch always has exactly one `DEFAULT_PEN` before first log write.
3. Pen-resolution guarantee: weight/feed/mortality logs without `penId` are persisted with resolved `DEFAULT_PEN`.
4. Pen ownership guarantee: reject writes when `penId` does not belong to the same batch/farm/user chain.
5. Density correctness: pen density uses `densityKgPerM2_pen = (headcount_pen * avgWeight_pen) / areaM2_pen`, with `areaM2_pen` derived from `lengthM * widthM`.
6. Projection correctness: Gompertz runs pen-first and batch output is deterministic roll-up of pen projections.
7. Monitoring split: pen-level operational alerts and batch-level business summaries are both available from the same fact base.
8. Transfer correctness: transfer updates source and destination pen headcounts and triggers immediate metric/projection refresh.
9. Mixed-pen safety: Phase 1 blocks mixed-batch pens unless explicit allocation engine is enabled with quality flags.
10. Confidence transparency: all metrics/projections expose data-completeness and reliability reasons when confidence is reduced.


**Optimization 5: Batch Uniformity Lite (Min-Max-Avg from sample)**

1. Weight log captures three farmer-friendly values for sampled pigs:
- `minSampleWeightKg` (lightest in sample)
- `maxSampleWeightKg` (heaviest in sample)
- `averageWeightKg` (average in sample)
2. Uniformity metric uses a simple spread formula:
- `sampleSpreadPercent = ((max - min) / avg) * 100`
3. Uniformity bands:
- `GOOD`: spread < 15%
- `WATCH`: spread >= 15% and <= 25%
- `ALERT`: spread > 25%
4. Confidence gate for alerts:
- always compute and store spread
- trigger `LOW_UNIFORMITY` alert only when confidence is at least `MEDIUM`
- if confidence is `LOW`, show guidance message without hard alert escalation
5. Farmer-facing management guidance for low uniformity:
- "Low Batch Uniformity Detected"
- include actionable next steps: size sorting, feeder space check, water access check, monitor lagging pigs
- keep wording non-diagnostic and consult-veterinarian language when needed

## Final acceptance checks for all optimizations

1. Dual-token session continuity works end-to-end: access expiry triggers silent refresh and user stays signed in.
2. Refresh token rotation and reuse-detection revocation rules are enforced.
3. Lost-device recovery works: logout-all-devices immediately revokes all active sessions.
4. Setup-gate conversion: majority of users proceed from modal to completion.
5. Weight logs with small samples are accepted but visibly marked low-confidence.
6. Batch creation captures feeding strategy once and does not request feed strategy repeatedly.
7. Biosecurity infrastructure toggles collected at farm setup and drive corrective base tasks at every batch creation.
8. Missing biosecurity infrastructure is never silent; it appears as daily/weekly management tasks in the task list.
9. Uniformity spread is computed from min/max/avg for each weight log and consistently mapped to GOOD/WATCH/ALERT bands.
10. Low-uniformity hard alerts are emitted only when data confidence is at least MEDIUM; low-confidence logs return guidance-only messaging.
