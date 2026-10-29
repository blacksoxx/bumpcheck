# Corpus results

Generated 2026-10-29 with `npx tsx corpus/run.ts`.

Columns: what bumpcheck reported, what the pull request actually did, and the tsc oracle
(new type errors after installing the new version, which includes implicit-any cascades that bumpcheck folds into their root cause).

| case | bump | imports | breaks | symbols broken | changed ok | unknown | ms | pull request | tsc oracle |
|---|---|---|---|---|---|---|---|---|---|
| zod-signpost-api | zod 3.23.8 → 4.6.5 | 4 | 79 | 3 | 1 | 0 | 3602 | merged with no code changes; repo has no typecheck in CI | tsc: 84 new errors (cached) |
| zod-netbox-mcp | zod 3.25.76 → 4.6.7 | 1 | 0 | 0 | 1 | 0 | 977 | merged with no code changes | tsc: 0 new errors (cached) |
| zod-game-analytics | zod 3.25.76 → 4.6.7 | 1 | 0 | 0 | 1 | 0 | 5103 | merged with no code changes | tsc: 0 new errors (cached) |
| commander-opentwins | commander 12.1.0 → 14.0.3 | 1 | 0 | 0 | 1 | 0 | 813 | merged with no code changes | tsc: 0 new errors (cached) |
| commander-clean-nestjs-patch | commander 14.0.2 → 14.0.3 | 2 | 0 | 0 | 0 | 0 | 907 | patch bump, merged with no code changes | tsc: 0 new errors (cached) |
| commander-recipes | commander 12.1.0 → 14.0.2 | 1 | 0 | 0 | 1 | 0 | 451 | merged with no code changes | tsc: 0 new errors (cached) |
| uuid-aws-routes | uuid 9.0.1 → 14.0.0 | 0 | 0 | 0 | 0 | 0 | 3941 | merged with no code changes; apps_infra never imports uuid (dead dependency), apps_web does | tsc: 0 new errors (cached) |

### zod-signpost-api

PR: https://github.com/Signpost-Labs/signpost-api/pull/3

```
zod 3.23.8 -> 4.6.5
You import 4 symbols from zod. 79 breaks in 3 symbols, 1 changed but still typechecks. Behavior not checked.

BREAKS
  z  Property 'errors' does not exist on type 'ZodError<{ actionId: string; newFeeBps: number; }>'.
    src/controllers/adminActionsController.ts:24:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ actionId: string; wallets: string[]; }>'.
    src/controllers/adminActionsController.ts:73:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ limit: number; offset: number; startDate?: string | undefined; endDate?: string | undefined; action?: string | undefined; }>'.
    src/controllers/adminAuditController.ts:88:27  (TS2339)
  z  Argument of type '(v: any) => { message: string; }' is not assignable to parameter of type 'string | { params?: Record<string, any> | undefined; path?: PropertyKey[] | undefined; abort?: boolean | undefined; when?: ((payload: ParsePayload<unknown>) => boolean) | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined'.
    src/controllers/adminAuditController.ts:113:7  (TS2345)
  z  Property 'errors' does not exist on type 'ZodError<{ page: number; pageSize: number; eventType?: string | undefined; from?: string | undefined; to?: string | undefined; }>'.
    src/controllers/adminAuditController.ts:155:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<unknown>'.
    src/controllers/adminControllerUtils.ts:6:25  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ recipient: string; }>'.
    src/controllers/adminFeesController.ts:104:71  (TS2339)
  z  No overload matches this call. Overload 1 of 2, '(params?: string | $ZodStringParams | undefined): ZodString', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'. Overload 2 of 2, '(params?: string | $ZodStringParams | undefined): $ZodType<string, string, $ZodTypeInternals<string, string>>', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'.
    src/controllers/adminFeesController.ts:212:15  (TS2769)
  z  Property 'errors' does not exist on type 'ZodError<{ treasuryAddress: string; amountStroops: string; }>'.
    src/controllers/adminFeesController.ts:267:33  (TS2339)
  z  No overload matches this call. Overload 1 of 2, '(params?: string | $ZodStringParams | undefined): ZodString', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'. Overload 2 of 2, '(params?: string | $ZodStringParams | undefined): $ZodType<string, string, $ZodTypeInternals<string, string>>', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'.
    src/controllers/adminPlayerDeactivationController.ts:39:15  (TS2769)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/adminPlayerDeactivationController.ts:57:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ reason: string; }>'.
    src/controllers/adminPlayerDeactivationController.ts:69:31  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/adminPlayerDeactivationController.ts:180:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ wallet: string; position: string; region: string; metadata: Record<string | number | symbol, unknown>; } | { wallet: string; position: string; region: string; metadataUri: string; }>'.
    src/controllers/adminPlayerImportController.ts:113:58  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ players: unknown[]; }>'.
    src/controllers/adminPlayerImportController.ts:311:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ window?: "7d" | "30d" | "90d" | undefined; breakdown?: "region" | undefined; }>'.
    src/controllers/adminStatsController.ts:25:27  (TS2339)
  default  Property 'errors' does not exist on type 'ZodError<{ jti?: string | undefined; token?: string | undefined; }>'.
    src/controllers/adminTokenController.ts:16:64  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ limit: number; offset: number; windowMs?: number | undefined; }>'.
    src/controllers/adminWebhookController.ts:26:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ limit: number; offset: number; windowMs?: number | undefined; }>'.
    src/controllers/adminWebhookController.ts:51:29  (TS2339)
  z  No overload matches this call. Overload 1 of 2, '(def: { gracePeriodSeconds: number; }): ZodDefault<ZodObject<{ gracePeriodSeconds: ZodDefault<ZodNumber>; }, $strict>>', gave the following error. Argument of type '{}' is not assignable to parameter of type '{ gracePeriodSeconds: number; }'. Property 'gracePeriodSeconds' is missing in type '{}' but required in type '{ gracePeriodSeconds: number; }'. Overload 2 of 2, '(def: () => { gracePeriodSeconds: number; }): ZodDefault<ZodObject<{ gracePeriodSeconds: ZodDefault<ZodNumber>; }, $strict>>', gave the following error. Argument of type '{}' is not assignable to parameter of type '() => { gracePeriodSeconds: number; }'. Type '{}' provides no match for the signature '(): { gracePeriodSeconds: number; }'.
    src/controllers/apiKeyController.ts:75:21  (TS2769)
  z  Property 'errors' does not exist on type 'ZodError<{ label: string; scopes?: string[] | undefined; expiresInDays?: number | undefined; }>'.
    src/controllers/apiKeyController.ts:95:64  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ gracePeriodSeconds: number; }>'.
    src/controllers/apiKeyController.ts:244:64  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ account: string; }>'.
    src/controllers/authController.ts:75:28  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ account: string; }>'.
    src/controllers/authController.ts:77:64  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ transaction: string; role?: "player" | "scout" | "validator" | "admin" | undefined; }>'.
    src/controllers/authController.ts:94:30  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ transaction: string; role?: "player" | "scout" | "validator" | "admin" | undefined; }>'.
    src/controllers/authController.ts:96:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ refreshToken: string; }>'.
    src/controllers/authController.ts:185:29  (TS2339)
  ZodError  Property 'errors' does not exist on type 'ZodError<{ startDate?: Date | undefined; endDate?: Date | undefined; eventType?: string | undefined; }>'.
    src/controllers/exportController.ts:90:27  (TS2339)
  z  Object literal may only specify known properties, and 'required_error' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidType<unknown>> | undefined; message?: string | undefined; }'.
    src/controllers/featureFlagsController.ts:32:24  (TS2353)
  z  Property 'errors' does not exist on type 'ZodError<{ name: string; enabled: boolean; }>'.
    src/controllers/featureFlagsController.ts:89:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ enabled: boolean; }>'.
    src/controllers/featureFlagsController.ts:139:27  (TS2339)
  z  No overload matches this call. Overload 1 of 2, '(params?: string | $ZodStringParams | undefined): ZodString', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'. Overload 2 of 2, '(params?: string | $ZodStringParams | undefined): $ZodType<string, string, $ZodTypeInternals<string, string>>', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'.
    src/controllers/ipReputationController.ts:7:18  (TS2769)
  z  Property 'errors' does not exist on type 'ZodError<{ ip: string; score: number; }>'.
    src/controllers/ipReputationController.ts:27:27  (TS2339)
  ZodError  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerAnonymizationController.ts:64:31  (TS2339)
  z  Expected 2-3 arguments, but got 1.
    src/controllers/playerController.ts:50:26  (TS2554)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerController.ts:234:66  (TS2339)
  z  Expected 2-3 arguments, but got 1.
    src/controllers/playerController.ts:477:26  (TS2554)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerController.ts:574:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ sortBy: "submittedAt" | "approvedAt"; order: "asc" | "desc"; limit: number; sort?: "asc" | "desc" | undefined; status?: "pending" | "approved" | "rejected" | undefined; }>'.
    src/controllers/playerController.ts:609:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerController.ts:755:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerController.ts:777:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerController.ts:806:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerHistoryController.ts:106:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerHistoryController.ts:159:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<number>'.
    src/controllers/playerHistoryController.ts:169:34  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<string>'.
    src/controllers/playerHistoryController.ts:232:29  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<number>'.
    src/controllers/playerHistoryController.ts:242:34  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ amount: number; buyerWallet?: string | undefined; }>'.
    src/controllers/playerTokenController.ts:109:27  (TS2339)
  z  Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodNumberParams'.
    src/controllers/reindexController.ts:32:17  (TS2353)
  z  Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodNumberParams'.
    src/controllers/reindexController.ts:36:17  (TS2353)
  z  Property 'errors' does not exist on type 'ZodError<{ fromLedger: number; toLedger: number; }>'.
    src/controllers/reindexController.ts:80:39  (TS2339)
  z  Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodNumberParams'.
    src/controllers/replayController.ts:30:17  (TS2353)
  z  Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodNumberParams'.
    src/controllers/replayController.ts:34:17  (TS2353)
  z  Property 'errors' does not exist on type 'ZodError<{ fromLedger: number; toLedger: number; }>'.
    src/controllers/replayController.ts:78:39  (TS2339)
  z  No overload matches this call. Overload 1 of 2, '(params?: string | $ZodStringParams | undefined): ZodString', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'. Overload 2 of 2, '(params?: string | $ZodStringParams | undefined): $ZodType<string, string, $ZodTypeInternals<string, string>>', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'.
    src/controllers/scoutBookmarksController.ts:33:15  (TS2769)
  z  No overload matches this call. Overload 1 of 2, '(params?: string | $ZodStringParams | undefined): ZodString', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'. Overload 2 of 2, '(params?: string | $ZodStringParams | undefined): $ZodType<string, string, $ZodTypeInternals<string, string>>', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'.
    src/controllers/scoutBookmarksController.ts:41:15  (TS2769)
  z  Property 'errors' does not exist on type 'ZodError<{ tier: "basic" | "premium"; duration: number; }>'.
    src/controllers/scoutController.ts:240:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ tier: "basic" | "premium"; duration: number; }>'.
    src/controllers/scoutController.ts:302:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ playerId: string; detailsUri: string; }>'.
    src/controllers/scoutController.ts:538:66  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ page: number; pageSize: number; format: "json" | "csv"; from?: string | undefined; to?: string | undefined; type?: "contact_unlock" | "subscription" | undefined; }>'.
    src/controllers/scoutController.ts:669:64  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ note: string; }>'.
    src/controllers/scoutNotesController.ts:41:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ content: string; }>'.
    src/controllers/scoutNotesController.ts:161:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ content: string; }>'.
    src/controllers/scoutNotesController.ts:253:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ cursor?: string | undefined; pageSize?: number | undefined; }>'.
    src/controllers/scoutRecommendationsController.ts:396:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ name: string; filters: { region?: string | undefined; position?: string | undefined; minTier?: number | undefined; }; }>'.
    src/controllers/scoutSavedSearchesController.ts:93:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ name?: string | undefined; filters?: { region?: string | undefined; position?: string | undefined; minTier?: number | undefined; } | undefined; }>'.
    src/controllers/scoutSavedSearchesController.ts:229:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ reason?: string | undefined; }>'.
    src/controllers/trialOfferController.ts:206:68  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ page: number; pageSize: number; }>'.
    src/controllers/webhookAdminController.ts:34:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ id: number; }>'.
    src/controllers/webhookAdminController.ts:82:35  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ id: number; }>'.
    src/controllers/webhookAdminController.ts:150:33  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ olderThanDays: number; }>'.
    src/controllers/webhookAdminController.ts:181:27  (TS2339)
  z  Property 'errors' does not exist on type 'ZodError<{ url: string; eventTypes?: ("player_registered" | "profile_updated" | "milestone_submitted" | "milestone_approved" | "milestone_rejected" | "scout_subscribed" | "contact_unlocked" | ... 7 more ... | "player_reactivated")[] | undefined; }>'.
    src/controllers/webhookSubscriptionController.ts:107:27  (TS2339)
  ZodError  Property 'errors' does not exist on type 'ZodError<unknown>'.
    src/middleware/errorHandler.ts:103:18  (TS2339)
  Property 'errors' does not exist on type 'ZodError<T>'.
    src/middleware/validate.ts:74:36  (TS2339)
  Property 'errors' does not exist on type 'ZodError<T>'.
    src/middleware/validate.ts:80:24  (TS2339)
  Property 'errors' does not exist on type 'ZodError<T>'.
    src/middleware/validate.ts:136:36  (TS2339)
  Property 'errors' does not exist on type 'ZodError<T>'.
    src/middleware/validate.ts:142:24  (TS2339)
  Property 'errors' does not exist on type 'ZodError<T>'.
    src/middleware/validate.ts:181:24  (TS2339)
  Property 'errors' does not exist on type 'ZodError<T>'.
    src/middleware/validate.ts:186:29  (TS2339)

CHANGED, BREAKS ABOVE
  default  [zod]
    before: namespace with 272 members
    after:  namespace with 1240 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput,…
    src/controllers/adminTokenController.ts:2:8
  z  [zod]
    before: namespace with 271 members
    after:  namespace with 1240 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput,…
    src/controllers/authController.ts:2:10
    src/utils/playerIdValidator.ts:1:10
    src/controllers/playerController.ts:5:10
    src/controllers/playerHistoryController.ts:4:10
    src/controllers/trialOfferController.ts:2:10
    src/controllers/playerTokenController.ts:11:10
    src/validators/emptyBody.ts:1:10
    src/controllers/scoutController.ts:2:10
    src/controllers/scoutRecommendationsController.ts:28:10
    src/controllers/scoutNotesController.ts:2:10
    src/controllers/apiKeyController.ts:17:10
    src/controllers/scoutBookmarksController.ts:9:10
    src/controllers/scoutSavedSearchesController.ts:15:10
    src/controllers/webhookSubscriptionController.ts:15:10
    src/controllers/validatorController.ts:3:10
    src/controllers/adminStatsController.ts:2:10
    src/controllers/adminAuditController.ts:2:10
    src/controllers/adminControllerUtils.ts:2:10
    src/controllers/adminEventsController.ts:2:10
    src/controllers/adminFeesController.ts:2:10
    src/controllers/adminIndexerController.ts:2:10
    src/controllers/adminActionsController.ts:2:10
    src/controllers/adminWebhookController.ts:2:10
    src/controllers/adminValidatorImportController.ts:2:10
    src/controllers/adminPlayerImportController.ts:2:10
    src/controllers/adminPlayerDeactivationController.ts:19:10
    src/controllers/featureFlagsController.ts:13:10
    src/controllers/webhookAdminController.ts:2:10
    src/controllers/ipReputationController.ts:2:10
    src/controllers/reindexController.ts:10:10
    src/controllers/replayController.ts:9:10
    src/validators/admin.ts:1:10
    src/controllers/dataExportController.ts:18:10
  ZodError  [zod]
    before: export declare class ZodError < T = any > extends Error { issues : ZodIssue [ ] ; get errors ( ) : ZodIssue [ ] ; constructor ( issues : ZodIssue [ ] ) ; forma…
    after:  ZodError : core . $constructor < ZodError > ⏎ export interface ZodError < T = unknown > extends $ZodError < T > { format ( ) : core . $ZodFormattedError < T > …
    src/middleware/errorHandler.ts:2:10

CHANGED, STILL TYPECHECKS
  ZodSchema  [zod]
    before: export declare abstract class ZodType < Output = any , Def extends ZodTypeDef = ZodTypeDef , Input = Output > { readonly _type : Output ; readonly _output : Ou…
    after:  export type ZodSchema < Output = unknown , Input = unknown , Internals extends core . $ZodTypeInternals < Output , Input > = core . $ZodTypeInternals < Output …
    src/middleware/validate.ts:2:10

Checked 36 files with TypeScript 5.9.3 in 3602 ms.
```

### zod-netbox-mcp

PR: https://github.com/SimonPrinz/netbox-mcp/pull/3

```
zod 3.25.76 -> 4.6.7
You import 1 symbol from zod. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  z  [zod]
    before: namespace with 272 members
    after:  namespace with 1241 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput,…
    src/tools.ts:6:10

Checked 1 file with TypeScript 5.9.3 in 977 ms.
```

### zod-game-analytics

```
zod 3.25.76 -> 4.6.7
You import 1 symbol from zod. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  z  [zod]
    before: namespace with 272 members
    after:  namespace with 1241 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput,…
    src/http/validation.ts:1:10

Checked 1 file with TypeScript 5.9.3 in 5103 ms.
```

### commander-opentwins

PR: https://github.com/Open-Twin/opentwins/pull/12

```
commander 12.1.0 -> 14.0.3
You import 1 symbol from commander. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  Command  [commander]
    before: export class Command { args : string [ ] ; processedArgs : any [ ] ; readonly commands : readonly Command [ ] ; readonly options : readonly Option [ ] ; readon…
    after:  export class Command { args : string [ ] ; processedArgs : any [ ] ; readonly commands : readonly Command [ ] ; readonly options : readonly Option [ ] ; readon…
    src/cli/program.ts:1:10

Checked 1 file with TypeScript 5.9.3 in 813 ms.
```

### commander-clean-nestjs-patch

PR: https://github.com/jheisonnovak/clean-nestjs-cli/pull/110

```
commander 14.0.2 -> 14.0.3
You import 2 symbols from commander. None changed. Behavior not checked.

UNCHANGED (2)
  Command, program

Checked 4 files with TypeScript 5.9.3 in 907 ms.
```

### commander-recipes

PR: https://github.com/npalm/recipes/pull/12

```
commander 12.1.0 -> 14.0.2
You import 1 symbol from commander. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  Command  [commander]
    before: export class Command { args : string [ ] ; processedArgs : any [ ] ; readonly commands : readonly Command [ ] ; readonly options : readonly Option [ ] ; readon…
    after:  export class Command { args : string [ ] ; processedArgs : any [ ] ; readonly commands : readonly Command [ ] ; readonly options : readonly Option [ ] ; readon…
    src/commands/create.ts:8:10
    src/commands/import.ts:7:10
    src/commands/validate.ts:8:10
    src/commands/config.ts:7:10
    src/index.ts:9:10

Checked 5 files with TypeScript 5.9.3 in 451 ms.
```

### uuid-aws-routes

PR: https://github.com/aws-samples/delivery-routes-optimization-for-logistics/pull/9

```
uuid 9.0.1 -> 14.0.0
Nothing in this repo imports uuid.

Checked 0 files with TypeScript 5.9.3 in 3941 ms.
```
