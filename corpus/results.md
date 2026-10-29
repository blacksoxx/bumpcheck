# Corpus results

Generated 2026-10-29 with `npx tsx corpus/run.ts`.

Columns: what bumpcheck reported, what the pull request actually did, and the tsc oracle
(new type errors after installing the new version, which includes implicit-any cascades that bumpcheck folds into their root cause).

| case | bump | imports | breaks | symbols broken | changed ok | unknown | ms | pull request | tsc oracle |
|---|---|---|---|---|---|---|---|---|---|
| zod-signpost-api | zod 3.23.8 → 4.6.5 | 4 | 79 | 3 | 1 | 0 | 3576 | merged with no code changes; repo has no typecheck in CI | tsc: 84 new errors (cached) |
| zod-netbox-mcp | zod 3.25.76 → 4.6.7 | 1 | 0 | 0 | 1 | 0 | 914 | merged with no code changes | tsc: 0 new errors (cached) |
| zod-game-analytics | zod 3.25.76 → 4.6.7 | 1 | 0 | 0 | 1 | 0 | 5334 | merged with no code changes | tsc: 0 new errors (cached) |
| commander-opentwins | commander 12.1.0 → 14.0.3 | 1 | 0 | 0 | 1 | 0 | 871 | merged with no code changes | tsc: 0 new errors (cached) |
| commander-clean-nestjs-patch | commander 14.0.2 → 14.0.3 | 2 | 0 | 0 | 0 | 0 | 775 | patch bump, merged with no code changes | tsc: 0 new errors (cached) |
| commander-recipes | commander 12.1.0 → 14.0.2 | 1 | 0 | 0 | 1 | 0 | 453 | merged with no code changes | tsc: 0 new errors (cached) |
| uuid-aws-routes | uuid 9.0.1 → 14.0.0 | 0 | 0 | 0 | 0 | 0 | 4631 | merged with no code changes; apps_infra never imports uuid (dead dependency), apps_web does | tsc: 0 new errors (cached) |
| zod-esa-mcp-fixed | zod 3.25.76 → 4.6.7 | 1 | 6 | 0 | 1 | 0 | 2188 | human fixed src/tools/post-actions.ts before merge (zod 4 made targetTeamName required) | tsc: 6 new errors (cached) |
| msw-mergent-fixed | msw 1.3.3 → 2.7.0 | 0 | 0 | 0 | 0 | 0 | 586 | human migrated test/Client.test.ts and test/mocks/server.ts to msw 2 before merge | tsc: 0 new errors (cached) |
| react-query-gather-kids-fixed | @tanstack/react-query 4.42.0 → 5.102.8 | 5 | 20 | 3 | 2 | 0 | 11108 | human migrated 4 src files to the v5 object API before merge | tsc: 28 new errors (cached) |
| react-query-scene-selector-fixed | @tanstack/react-query 4.36.1 → 5.90.14 | 2 | 3 | 1 | 1 | 0 | 2544 | human fixed src/renderer/components/FrameImage.tsx before merge (isLoading to isPending) | tsc: 3 new errors (cached) |

### zod-signpost-api

PR: https://github.com/Signpost-Labs/signpost-api/pull/3

```
zod 3.23.8 -> 4.6.5
You import 4 symbols from zod. 79 breaks in 3 symbols, 1 changed but still typechecks. Behavior not checked.

BREAKS
  z  Property 'errors' does not exist on type 'ZodError<…>'.  TS2339  (55 sites)
    src/controllers/adminActionsController.ts:24:66
    src/controllers/adminActionsController.ts:73:66
    src/controllers/adminAuditController.ts:88:27
    src/controllers/adminAuditController.ts:155:27
    src/controllers/adminControllerUtils.ts:6:25
    … 50 more, see --format json
  Property 'errors' does not exist on type 'ZodError<…>'.  TS2339  (6 sites)
    src/middleware/validate.ts:74:36
    src/middleware/validate.ts:80:24
    src/middleware/validate.ts:136:36
    src/middleware/validate.ts:142:24
    src/middleware/validate.ts:181:24
    … 1 more, see --format json
  z  No overload matches this call. Overload 1 of 2, '(params?: string | $ZodStringParams | undefined): ZodString', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'. Overload 2 of 2, '(params?: string | $ZodStringParams | undefined): $ZodType<…>', gave the following error. Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodStringParams'.  TS2769  (5 sites)
    src/controllers/adminFeesController.ts:212:15
    src/controllers/adminPlayerDeactivationController.ts:39:15
    src/controllers/ipReputationController.ts:7:18
    src/controllers/scoutBookmarksController.ts:33:15
    src/controllers/scoutBookmarksController.ts:41:15
  z  Object literal may only specify known properties, and 'required_error' does not exist in type '$ZodNumberParams'.  TS2353  (4 sites)
    src/controllers/reindexController.ts:32:17
    src/controllers/reindexController.ts:36:17
    src/controllers/replayController.ts:30:17
    src/controllers/replayController.ts:34:17
  ZodError  Property 'errors' does not exist on type 'ZodError<…>'.  TS2339  (3 sites)
    src/controllers/exportController.ts:90:27
    src/controllers/playerAnonymizationController.ts:64:31
    src/middleware/errorHandler.ts:103:18
  z  Expected 2-3 arguments, but got 1.  TS2554  (2 sites)
    src/controllers/playerController.ts:50:26
    src/controllers/playerController.ts:477:26
  z  Argument of type '(v: any) => { message: string; }' is not assignable to parameter of type 'string | { params?: Record<…> | undefined; path?: PropertyKey[] | undefined; abort?: boolean | undefined; when?: ((payload: ParsePayload<…>) => boolean) | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined'.  TS2345
    src/controllers/adminAuditController.ts:113:7
  default  Property 'errors' does not exist on type 'ZodError<…>'.  TS2339
    src/controllers/adminTokenController.ts:16:64
  z  No overload matches this call. Overload 1 of 2, '(def: { gracePeriodSeconds: number; }): ZodDefault<ZodObject<…>>', gave the following error. Argument of type '{…}' is not assignable to parameter of type '{…}'. Property 'gracePeriodSeconds' is missing in type '{…}' but required in type '{…}'. Overload 2 of 2, '(def: () => { gracePeriodSeconds: number; }): ZodDefault<ZodObject<…>>', gave the following error. Argument of type '{…}' is not assignable to parameter of type '() => { gracePeriodSeconds: number; }'. Type '{…}' provides no match for the signature '(): { gracePeriodSeconds: number; }'.  TS2769
    src/controllers/apiKeyController.ts:75:21
  z  Object literal may only specify known properties, and 'required_error' does not exist in type '{…}'.  TS2353
    src/controllers/featureFlagsController.ts:32:24

CHANGED, BREAKS ABOVE
  default  [zod]
    before: namespace with 272 members
    after:  namespace with 1240 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput, …
    src/controllers/adminTokenController.ts:2:8
  z  [zod]
    before: namespace with 271 members
    after:  namespace with 1240 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput, …
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
    before: export declare class ZodError < T = any > extends Error { issues : ZodIssue [ ] ; get errors ( ) : ZodIssue [ ] ; constructor ( issues : ZodIssue [ ] ) ; format…
    after:  ZodError : core . $constructor < ZodError > ⏎ export interface ZodError < T = unknown > extends $ZodError < T > { format ( ) : core . $ZodFormattedError < T > ;…
    src/middleware/errorHandler.ts:2:10

CHANGED, STILL TYPECHECKS
  ZodSchema  [zod]
    before: export declare abstract class ZodType < Output = any , Def extends ZodTypeDef = ZodTypeDef , Input = Output > { readonly _type : Output ; readonly _output : Out…
    after:  export type ZodSchema < Output = unknown , Input = unknown , Internals extends core . $ZodTypeInternals < Output , Input > = core . $ZodTypeInternals < Output ,…
    src/middleware/validate.ts:2:10

NOT ANALYZED
  3 files import "zod" but are outside tsconfig.json, so neither tsc nor bumpcheck checks them
    tests/middleware/errorHandler.express5.test.ts:1:1
    tests/middleware/errorHandler.test.ts:1:1
    tests/middleware/validate.test.ts:1:1

Checked 36 files with TypeScript 5.9.3 in 3576 ms.
```

### zod-netbox-mcp

PR: https://github.com/SimonPrinz/netbox-mcp/pull/3

```
zod 3.25.76 -> 4.6.7
You import 1 symbol from zod. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  z  [zod]
    before: namespace with 272 members
    after:  namespace with 1241 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput, …
    src/tools.ts:6:10

Checked 1 file with TypeScript 5.9.3 in 914 ms.
```

### zod-game-analytics

```
zod 3.25.76 -> 4.6.7
You import 1 symbol from zod. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  z  [zod]
    before: namespace with 272 members
    after:  namespace with 1241 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput, …
    src/http/validation.ts:1:10

Checked 1 file with TypeScript 5.9.3 in 5334 ms.
```

### commander-opentwins

PR: https://github.com/Open-Twin/opentwins/pull/12

```
commander 12.1.0 -> 14.0.3
You import 1 symbol from commander. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  Command  [commander]
    before: …ment < T > ( flags : string , description : string , fn : ( value : string , previous : T ) => T , defaultValue ? : T , ) : this ; argument ( name : string , de…
    after:  …ment < T > ( flags : string , description : string , parseArg : ( value : string , previous : T ) => T , defaultValue ? : T , ) : this ; argument ( name : strin…
    src/cli/program.ts:1:10

Checked 1 file with TypeScript 5.9.3 in 871 ms.
```

### commander-clean-nestjs-patch

PR: https://github.com/jheisonnovak/clean-nestjs-cli/pull/110

```
commander 14.0.2 -> 14.0.3
You import 2 symbols from commander. None changed. Behavior not checked.

UNCHANGED (2)
  Command, program

Checked 4 files with TypeScript 5.9.3 in 775 ms.
```

### commander-recipes

PR: https://github.com/npalm/recipes/pull/12

```
commander 12.1.0 -> 14.0.2
You import 1 symbol from commander. 1 changed but still typechecks. Behavior not checked.

CHANGED, STILL TYPECHECKS
  Command  [commander]
    before: …ment < T > ( flags : string , description : string , fn : ( value : string , previous : T ) => T , defaultValue ? : T , ) : this ; argument ( name : string , de…
    after:  …ment < T > ( flags : string , description : string , parseArg : ( value : string , previous : T ) => T , defaultValue ? : T , ) : this ; argument ( name : strin…
    src/commands/create.ts:8:10
    src/commands/import.ts:7:10
    src/commands/validate.ts:8:10
    src/commands/config.ts:7:10
    src/index.ts:9:10

Checked 5 files with TypeScript 5.9.3 in 453 ms.
```

### uuid-aws-routes

PR: https://github.com/aws-samples/delivery-routes-optimization-for-logistics/pull/9

```
uuid 9.0.1 -> 14.0.0
Nothing in this repo imports uuid.

Checked 0 files with TypeScript 5.9.3 in 4631 ms.
```

### zod-esa-mcp-fixed

PR: https://github.com/esaio/esa-mcp-server/pull/473

```
zod 3.25.76 -> 4.6.7
You import 1 symbol from zod. 6 breaks, 1 changed but still typechecks. Behavior not checked.

BREAKS
  Argument of type '{…}' is not assignable to parameter of type '{…}'. Property 'targetTeamName' is missing in type '{…}' but required in type '{…}'.  TS2345  (6 sites)
    src/tools/__tests__/post-actions.test.ts:285:37
    src/tools/__tests__/post-actions.test.ts:367:52
    src/tools/__tests__/post-actions.test.ts:385:52
    src/tools/__tests__/post-actions.test.ts:398:52
    src/tools/__tests__/post-actions.test.ts:411:52
    … 1 more, see --format json

CHANGED, STILL TYPECHECKS
  z  [zod]
    before: namespace with 272 members
    after:  namespace with 1241 members; removed: AnyZodObject, AnyZodTuple, ArrayCardinality, ArrayKeys, AssertArray, AsyncParseReturnType, CatchallInput, CatchallOutput, …
    src/prompts/summarize-post.ts:1:10
    src/prompts/index.ts:2:15
    src/schemas/team-name-schema.ts:1:10
    src/tools/teams.ts:1:10
    src/tools/attachments.ts:2:10
    src/tools/backlinks.ts:1:10
    src/tools/categories.ts:1:10
    src/tools/comments.ts:1:10
    src/tools/posts.ts:1:10
    src/tools/search.ts:1:10
    src/tools/helps.ts:1:15
    src/tools/post-actions.ts:1:10
    src/tools/index.ts:2:15

Checked 13 files with TypeScript 5.9.3 in 2188 ms.
```

### msw-mergent-fixed

PR: https://github.com/mergentlabs/mergent-js/pull/515

```
msw 1.3.3 -> 2.7.0
Nothing in this repo imports msw.

NOT ANALYZED
  1 file imports "msw" but is outside tsconfig.json, so neither tsc nor bumpcheck checks it
    test/mocks/server.ts:1:1

Checked 0 files with TypeScript 5.9.3 in 586 ms.
```

### react-query-gather-kids-fixed

PR: https://github.com/tzlukoma/gather-kids/pull/283

```
@tanstack/react-query 4.42.0 -> 5.102.8
You import 5 symbols from @tanstack/react-query. 20 breaks in 3 symbols, 2 changed but still typecheck. Behavior not checked.

BREAKS
  useQuery  No overload matches this call. Overload 1 of 3, '(options: DefinedInitialDataOptions<…>, queryClient?: QueryClient | undefined): DefinedUseQueryResult<…>', gave the following error. Object literal may only specify known properties, and 'cacheTime' does not exist in type 'DefinedInitialDataOptions<…>'. Overload 2 of 3, '(options: UndefinedInitialDataOptions<…>, queryClient?: QueryClient | undefined): UseQueryResult<…>', gave the following error. Object literal may only specify known properties, and 'cacheTime' does not exist in type 'UndefinedInitialDataOptions<…>'. Overload 3 of 3, '(options: UseQueryOptions<…>, queryClient?: QueryClient | undefined): UseQueryResult<…>', gave the following error. Object literal may only specify known properties, and 'cacheTime' does not exist in type 'UseQueryOptions<…>'.  TS2769  (6 sites)
    src/lib/hooks/useBibleBee.ts:444:9
    src/lib/hooks/useBibleBee.ts:463:9
    src/lib/hooks/useBibleBee.ts:491:9
    src/lib/hooks/useBibleBee.ts:514:9
    src/lib/hooks/useBibleBee.ts:536:9
    … 1 more, see --format json
  Type 'string[]' has no properties in common with type 'QueryFilters<…>'.  TS2559  (3 sites)
    src/lib/hooks/useBibleBee.ts:122:36
    src/lib/hooks/useBibleBee.ts:377:36
    src/lib/hooks/useBibleBee.ts:417:36
  useMutation  Type '({ bibleBeeCycleId }: { bibleBeeCycleId: string; }) => Promise<…>' is not assignable to type 'MutationFunction<…>'. Types of parameters '__0' and 'variables' are incompatible. Type '{ bibleBeeCycleId?: string | undefined; } | undefined' is not assignable to type '{…}'. Type 'undefined' is not assignable to type '{…}'.  TS2322
    src/hooks/data/bibleBee.ts:496:5
  useMutation  Type '({ bibleBeeCycleId }: { bibleBeeCycleId: string; }) => Promise<…>' is not assignable to type '(variables: { bibleBeeCycleId?: string | undefined; } | undefined, context: MutationFunctionContext) => any'. Types of parameters '__0' and 'variables' are incompatible. Type '{ bibleBeeCycleId?: string | undefined; } | undefined' is not assignable to type '{…}'. Type 'undefined' is not assignable to type '{…}'.  TS2322
    src/hooks/data/bibleBee.ts:498:5
  useQuery  No overload matches this call. Overload 1 of 3, '(options: DefinedInitialDataOptions<…>, queryClient?: QueryClient | undefined): DefinedUseQueryResult<…>', gave the following error. Argument of type 'string[]' is not assignable to parameter of type 'DefinedInitialDataOptions<…>'. Property 'queryKey' is missing in type 'string[]' but required in type 'Omit<…>'. Overload 2 of 3, '(options: UndefinedInitialDataOptions<…>, queryClient?: QueryClient | undefined): UseQueryResult<…>', gave the following error. Argument of type 'string[]' is not assignable to parameter of type 'UndefinedInitialDataOptions<…>'. Property 'queryKey' is missing in type 'string[]' but required in type 'UseQueryOptions<…>'. Overload 3 of 3, '(options: UseQueryOptions<…>, queryClient?: QueryClient | undefined): UseQueryResult<…>', gave the following error. Argument of type 'string[]' is not assignable to parameter of type 'UseQueryOptions<…>'. Property 'queryKey' is missing in type 'string[]' but required in type 'UseQueryOptions<…>'.  TS2769
    src/lib/hooks/useBibleBee.ts:104:28
  useMutation  Type '(payload: unknown) => Promise<…>' has no properties in common with type 'UseMutationOptions<…>'.  TS2559
    src/lib/hooks/useBibleBee.ts:119:34
  Type 'string[]' has no properties in common with type 'InvalidateQueryFilters<…>'.  TS2559
    src/lib/hooks/useBibleBee.ts:137:34
  useQuery  Expected 1-2 arguments, but got 3.  TS2554
    src/lib/hooks/useBibleBee.ts:362:8
  useMutation  Type '({ id, complete }: { id: string; complete: boolean; }) => Promise<…>' has no properties in common with type 'UseMutationOptions<…>'.  TS2559
    src/lib/hooks/useBibleBee.ts:374:24
  useMutation  Type '({ bibleBeeCycleId }: { bibleBeeCycleId: string; }) => Promise<…>' has no properties in common with type 'UseMutationOptions<…>'.  TS2559
    src/lib/hooks/useBibleBee.ts:415:24
  useMutation  Type 'string[]' has no properties in common with type 'InvalidateQueryFilters<…>'.  TS2559
    src/lib/hooks/useBibleBee.ts:429:47
  useMutation  Type '({ childId, photoDataUrl }: { childId: string; photoDataUrl: string; }) => Promise<…>' has no properties in common with type 'UseMutationOptions<…>'.  TS2559
    src/lib/hooks/useBibleBee.ts:588:9
  QueryClient  Object literal may only specify known properties, and 'cacheTime' does not exist in type 'OmitKeyof<…>'.  TS2353
    src/lib/queryClient.tsx:19:4

CHANGED, BREAKS ABOVE
  QueryClient  [@tanstack/react-query]
    before: export declare class QueryClient { private queryCache ; private mutationCache ; private logger ; private defaultOptions ; private queryDefaults ; private mutati…
    after:  declare class QueryClient { #private ; constructor ( config ? : QueryClientConfig ) ; mount ( ) : void ; unmount ( ) : void ; isFetching < TQueryFilters extends…
    __tests__/app/dashboard/registrations-page.test.tsx:3:10
    __tests__/hooks/users-mutations.test.tsx:6:10
    __tests__/ui/branding-page.test.tsx:8:10
    __tests__/ui/create-user-dialog.test.tsx:7:10
    __tests__/ui/set-password-dialog.test.tsx:7:10
    __tests__/ui/users-management-page.test.tsx:7:10
    src/lib/queryClient.tsx:3:10
  useMutation  [@tanstack/react-query]
    before: export declare function useMutation < TData = unknown , TError = unknown , TVariables = void , TContext = unknown > ( mutationFn : MutationFunction < TData , TV…
    after:  declare function useMutation < TData = unknown , TError = DefaultError , TVariables = void , TOnMutateResult = unknown > ( options : UseMutationOptions < TData …
    src/hooks/data/attendance.ts:3:20
    src/hooks/data/bibleBee.ts:3:20
    src/hooks/data/branding.ts:3:20
    src/hooks/data/children.ts:3:20
    src/hooks/data/enrollments.ts:3:10
    src/hooks/data/guardians.ts:3:10
    src/hooks/data/households.ts:3:20
    src/hooks/data/ministries.ts:3:20
    src/lib/hooks/useData.ts:1:36
    src/hooks/data/users.ts:3:20
    src/lib/hooks/useBibleBee.ts:2:36
  useQuery  [@tanstack/react-query]
    before: export declare function useQuery < TQueryFnData = unknown , TError = unknown , TData = TQueryFnData , TQueryKey extends QueryKey = QueryKey > ( options : OmitKe…
    after:  declare function useQuery < TQueryFnData = unknown , TError = DefaultError , TData = TQueryFnData , TQueryKey extends QueryKey = QueryKey > ( options : DefinedI…
    src/hooks/data/attendance.ts:3:10
    src/hooks/data/bibleBee.ts:3:10
    src/hooks/data/branding.ts:3:10
    src/hooks/data/children.ts:3:10
    src/hooks/data/dashboard.ts:3:10
    src/hooks/data/emergency-contacts.ts:3:10
    src/hooks/data/households.ts:3:10
    src/hooks/data/ministries.ts:3:10
    src/hooks/data/registration.ts:3:10
    src/hooks/data/leaders.ts:3:10
    src/lib/hooks/useData.ts:1:10
    src/hooks/data/users.ts:3:10
    src/lib/hooks/useBibleBee.ts:2:10
    src/app/register/page.tsx:7:10

CHANGED, STILL TYPECHECKS
  QueryClientProvider  [@tanstack/react-query]
    before: QueryClientProvider : ( { client , children , context , contextSharing , } : QueryClientProviderProps ) => React . JSX . Element
    after:  QueryClientProvider : ( { client , children } : QueryClientProviderProps ) => React . JSX . Element
    __tests__/app/dashboard/registrations-page.test.tsx:3:23
    __tests__/hooks/users-mutations.test.tsx:6:23
    __tests__/ui/branding-page.test.tsx:8:23
    __tests__/ui/create-user-dialog.test.tsx:7:23
    __tests__/ui/set-password-dialog.test.tsx:7:23
    __tests__/ui/users-management-page.test.tsx:7:23
    src/lib/queryClient.tsx:3:23
  useQueryClient  [@tanstack/react-query]
    before: useQueryClient : ( { context } ? : ContextOptions ) => QueryClient
    after:  useQueryClient : ( queryClient ? : QueryClient ) => QueryClient
    src/hooks/data/attendance.ts:3:33
    src/hooks/data/bibleBee.ts:3:33
    src/hooks/data/branding.ts:3:33
    src/hooks/data/children.ts:3:33
    src/hooks/data/enrollments.ts:3:23
    src/hooks/data/guardians.ts:3:23
    src/hooks/data/households.ts:3:33
    src/hooks/data/ministries.ts:3:33
    src/lib/hooks/useData.ts:1:20
    src/hooks/data/users.ts:3:33
    src/lib/hooks/useBibleBee.ts:2:20
    src/components/gatherKids/bible-bee-progress-card.tsx:10:10
    src/app/(admin)/ministries/page.tsx:50:10
    src/app/(admin)/rosters/page.tsx:91:10

Checked 26 files with TypeScript 5.9.3 in 11108 ms.
```

### react-query-scene-selector-fixed

PR: https://github.com/dmingn/scene-selector/pull/185

```
@tanstack/react-query 4.36.1 -> 5.90.14
You import 2 symbols from @tanstack/react-query. 3 breaks in 1 symbol, 1 changed but still typechecks. Behavior not checked.

BREAKS
  QueryClient  Object literal may only specify known properties, and 'cacheTime' does not exist in type 'OmitKeyof<…>'.  TS2353
    src/renderer/components/context-providers/TrpcContextsProvider.tsx:13:13
  No overload matches this call. Overload 1 of 2, '(input: void | { videoPath?: string; }, opts: DefinedUseTRPCQueryOptions<"getVideoInfo", void | { videoPath?: string; }, { fps?: number; frameCount?: number; }, { fps?: number; frameCount?: number; }, TRPCClientErrorLike<BuildProcedure<…>>, { ...; }>): DefinedUseTRPCQueryResult<…>', gave the following error. Argument of type '{…}' is not assignable to parameter of type 'DefinedUseTRPCQueryOptions<"getVideoInfo", void | { videoPath?: string; }, { fps?: number; frameCount?: number; }, { fps?: number; frameCount?: number; }, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 m...'. Type '{…}' is missing the following properties from type 'DefinedUseTRPCQueryOptions<"getVideoInfo", void | { videoPath?: string; }, { fps?: number; frameCount?: number; }, { fps?: number; frameCount?: number; }, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 m...': initialData, queryKey Overload 2 of 2, '(input: void | { videoPath?: string; }, opts?: UseTRPCQueryOptions<"getVideoInfo", void | { videoPath?: string; }, { fps?: number; frameCount?: number; }, { fps?: number; frameCount?: number; }, TRPCClientErrorLike<BuildProcedure<…>>, { ...; }>): UseTRPCQueryResult<…>', gave the following error. Argument of type '{…}' is not assignable to parameter of type 'UseTRPCQueryOptions<"getVideoInfo", void | { videoPath?: string; }, { fps?: number; frameCount?: number; }, { fps?: number; frameCount?: number; }, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 more ......'. Property 'queryKey' is missing in type '{…}' but required in type 'UseTRPCQueryOptions<"getVideoInfo", void | { videoPath?: string; }, { fps?: number; frameCount?: number; }, { fps?: number; frameCount?: number; }, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 more ......'.  TS2769
    src/renderer/components/context-providers/VideoInfoContextsProvider.tsx:24:5
  No overload matches this call. Overload 1 of 2, '(input: void | { videoPath?: string; fps?: number; frameNumber?: number; }, opts: DefinedUseTRPCQueryOptions<…>): DefinedUseTRPCQueryResult<…>', gave the following error. Argument of type '{…}' is not assignable to parameter of type 'DefinedUseTRPCQueryOptions<"getFrameImageBase64", void | { videoPath?: string; fps?: number; frameNumber?: number; }, string, string, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 more ...; _output_out:...'. Type '{…}' is missing the following properties from type 'DefinedUseTRPCQueryOptions<"getFrameImageBase64", void | { videoPath?: string; fps?: number; frameNumber?: number; }, string, string, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 more ...; _output_out:...': initialData, queryKey Overload 2 of 2, '(input: void | { videoPath?: string; fps?: number; frameNumber?: number; }, opts?: UseTRPCQueryOptions<…>): UseTRPCQueryResult<…>', gave the following error. Argument of type '{…}' is not assignable to parameter of type 'UseTRPCQueryOptions<"getFrameImageBase64", void | { videoPath?: string; fps?: number; frameNumber?: number; }, string, string, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 more ...; _output_out: unique...'. Property 'queryKey' is missing in type '{…}' but required in type 'UseTRPCQueryOptions<"getFrameImageBase64", void | { videoPath?: string; fps?: number; frameNumber?: number; }, string, string, TRPCClientErrorLike<BuildProcedure<"query", { _config: RootConfig<…>; ... 5 more ...; _output_out: unique...'.  TS2769
    src/renderer/components/FrameImage.tsx:21:65

CHANGED, BREAKS ABOVE
  QueryClient  [@tanstack/react-query]
    before: export declare class QueryClient { private queryCache ; private mutationCache ; private logger ; private defaultOptions ; private queryDefaults ; private mutati…
    after:  declare class QueryClient { #private ; constructor ( config ? : QueryClientConfig ) ; mount ( ) : void ; unmount ( ) : void ; isFetching < TQueryFilters extends…
    src/renderer/components/context-providers/TrpcContextsProvider.tsx:1:10

CHANGED, STILL TYPECHECKS
  QueryClientProvider  [@tanstack/react-query]
    before: QueryClientProvider : ( { client , children , context , contextSharing , } : QueryClientProviderProps ) => JSX . Element
    after:  QueryClientProvider : ( { client , children , } : QueryClientProviderProps ) => React . JSX . Element
    src/renderer/components/context-providers/TrpcContextsProvider.tsx:1:23

Checked 1 file with TypeScript 5.9.3 in 2544 ms.
```
