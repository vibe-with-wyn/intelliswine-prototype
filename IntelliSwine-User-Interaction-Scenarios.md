# IntelliSwine Sample Scenarios: User Interaction and System Processing

## Scenario 1: New Farmer Onboarding and Setup Gate Behavior

### User interaction
1. Farmer registers using basic details.
2. Farmer logs in.
3. Farmer enters dashboard immediately.
4. Farmer taps Create Batch.
5. System asks farmer to complete setup before proceeding.

### System processing
1. Create Users and Farm shell records.
2. Mark setupStatus = PARTIAL.
3. On login, return dashboard access plus setup reminder status.
4. On Create Batch action, enforce setup completion gate.
5. Persist setup fields and set setupStatus = COMPLETE.
6. Re-open batch creation flow.

### Output to farmer
- Fast onboarding with no hard block at login.
- Clear production-readiness prompt at the right moment.

## Scenario 2: Batch Creation and Base Task Generation

### User interaction
1. Farmer enters batchSize, geneticsType, initialWeightKg, feedType, startDate, targetMarketWeightKg.
2. Farmer confirms batch creation.

### System processing
1. Validate setupStatus = COMPLETE.
2. Persist Batch entity.
3. Run TaskGenerationService using farm + batch context.
4. Create immutable base GeneratedTask records.
5. Store TaskGenerationRun audit row.

### Output to farmer
- Batch is active.
- Daily task list is available immediately.

## Scenario 3: Daily Feed Logging

### User interaction
1. Farmer opens feed log screen.
2. Enters logDate and totalFeedKg.
3. Submits daily feed entry.

### System processing
1. Validate ownership and required fields.
2. Reject feedType in payload (batch-level source only).
3. Persist FeedLog.
4. Trigger event-driven metrics/projection snapshot refresh.

### Output to farmer
- Feed log saved.
- Metrics are updated with latest intake context.

## Scenario 4: Weight Logging with Scale Method

### User interaction
1. Farmer selects SCALE.
2. Inputs sampleSize, averageWeightKg, minSampleWeightKg, maxSampleWeightKg.
3. Submits weight log.

### System processing
1. Validate method-specific required fields.
2. Validate min <= avg <= max.
3. Compute sampleSpreadPercent.
4. Compute confidence tier from sample ratio.
5. Persist WeightLog and refresh snapshots.
6. Evaluate uniformity alerts with confidence guard.

### Output to farmer
- Weight log saved.
- Uniformity and confidence indicators shown.

## Scenario 5: Weight Logging with Tape Method (Modal + Auto-Compute)

### User interaction
1. Farmer selects TAPE_ESTIMATE.
2. Modal opens for tape measurements.
3. Farmer enters heart girth and body length for each sampled pig.
4. Farmer submits modal.

### System processing
1. Validate tapeMeasurements payload.
2. Auto-compute sample pig weights from measurements.
3. Derive averageWeightKg, minSampleWeightKg, maxSampleWeightKg.
4. Compute spread and confidence.
5. Persist WeightLog and refresh snapshots.

### Output to farmer
- No manual formula needed.
- Computed values and confidence are shown transparently.

## Scenario 6: Mortality Event and Pig-Days Recalculation

### User interaction
1. Farmer logs a mortality event with date, count, reason.

### System processing
1. Persist MortalityLog (append-only).
2. Update active headcount timeline.
3. Recompute pig-days denominator for ADFI.
4. Recompute density, survivalRate, FCR context, EFI.
5. Recompute projection and projected market date.
6. Save Batch_Analytics_Snapshot.
7. Generate management alert if mortality threshold is breached.
8. Emit estimated wasted-feed impact insight (with confidence tag).

### Output to farmer
- Updated headcount and metrics.
- Transparent impact insight and actionable management alert.

## Scenario 7: Uniformity Deviation Alert with Confidence Guard

### User interaction
1. Farmer submits a weight log with wide spread.

### System processing
1. Calculate sampleSpreadPercent.
2. Classify band:
- GOOD if < 15%
- WATCH if 15-25%
- ALERT if > 25%
3. Check sample confidence:
- if sample ratio < 10%, do not escalate to hard RED alert.
4. Produce recommendations such as size sorting and feeder/water access checks.

### Output to farmer
- Farmer receives practical actions.
- Alert severity reflects confidence, not just raw spread.

## Scenario 8: Metrics and Projection Read

### User interaction
1. Farmer opens metrics screen.
2. Farmer opens projection screen.

### System processing
1. Serve latest snapshot values and freshness context.
2. Metrics response includes:
- adg, fcr, adfi, efi
- currentHeadcount, survivalRate
- stockingDensityKgPerM2
- sampleSpreadPercent, uniformityBand
- dataCompleteness, confidenceLevel, benchmarkContext
3. Projection response includes:
- expectedWeightKg, actualWeightKg, weightDeviationPercent, projectedMarketDate
- confidenceLevel, modelType, modelVersion, reliabilityReasons[]

### Output to farmer
- One clear operational view with confidence and benchmark context.

## Scenario 9: Regional Warm-Start Benchmarking

### User interaction
1. Farmer finishes first batch and views performance summary.
2. Farmer runs second and third batches.

### System processing
1. Batch #1 benchmarked against regional/profile baseline window.
2. Batch #2 benchmarked against Batch #1.
3. Batch #3+ benchmarked against rolling average.

### Output to farmer
- Realistic and motivating progress tracking.
- No unrealistic global score shaming.

## Scenario 10: Overlay Tasks for Mid-Cycle Reality Changes

### User interaction
1. Farmer reports a mid-cycle change (for example, operating condition adjustment).

### System processing
1. Preserve immutable base plan.
2. Generate overlay tasks only for future dates.
3. Record TaskGenerationRun with overlay trigger.

### Output to farmer
- History remains trustworthy.
- New tasks are clear and forward-only.

## Scenario 11: Ownership and Safety

### User interaction
1. User attempts to access another farmer's batch.

### System processing
1. JWT validated.
2. Ownership check fails.
3. API returns forbidden response with stable error code.

### Output to farmer
- Secure isolation of farm data.

## Scenario 12: Non-Diagnostic Wording Enforcement

### User interaction
1. Farmer sees a growth-related alert after negative ADG trend.

### System processing
1. Alert generator uses centralized message templates.
2. Message classified by severity, audience, type, and messageCode.
3. Language remains management-safe and non-diagnostic.

### Output to farmer
- Example: Growth reversal detected. Re-check measurement, feed/water access, and observe batch behavior. Consult a specialist if trend persists.

## Summary of User Experience Intent
- Low-friction onboarding
- Production-gated setup, not login-gated setup
- Fast daily logging
- Transparent confidence and reliability
- Actionable management guidance
- Stable planning behavior through immutable base tasks + overlays
