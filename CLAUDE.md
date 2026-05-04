# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Laravel 12 + Inertia 2 + React 19 + TypeScript, served as a single-page-style monolith. Tailwind v4 (Vite plugin), shadcn/ui components, Ziggy for typed route helpers, Sanctum for API tokens, Spatie laravel-permission for RBAC, Spatie laravel-activitylog for auditing. Tests are Pest (not bare PHPUnit), default DB is SQLite (`database/database.sqlite`; phpunit uses `:memory:`).

## Commands

```bash
# All-in-one dev (server + queue listener + Vite via concurrently)
composer dev

# Frontend only
npm run dev                 # vite
npm run build               # production build
npm run build:ssr           # client + SSR bundle (entry: resources/js/ssr.jsx)
npm run lint                # eslint --fix
npm run format              # prettier --write resources/

# Backend
php artisan serve
php artisan queue:listen --tries=1
php artisan migrate --graceful
php artisan db:seed --class=RolePermissionSeeder   # required for RBAC
php artisan db:seed --class=AdminAccountSeeder

# Tests (Pest)
./vendor/bin/pest                                  # full suite
./vendor/bin/pest --filter=DashboardTest           # one file/test
./vendor/bin/pest tests/Feature/Auth               # one directory
./vendor/bin/pest --parallel                       # paratest
./vendor/bin/pint                                  # PHP formatter
```

`Tests\TestCase` is auto-bound to everything under `tests/Feature` and includes `RefreshDatabase` (see `tests/Pest.php`). Unit tests do not refresh the DB.

## Architecture

### Inertia bridge
- Server entry: `HandleInertiaRequests` (`app/Http/Middleware/HandleInertiaRequests.php`) shares `auth.user` with `roles` and a flattened `permissions` array on every request. Anything the frontend needs globally goes here.
- Client entry: `resources/js/app.tsx` resolves pages via `import.meta.glob('./pages/**/*.tsx')`. Page filename = Inertia component name (e.g. `Inertia::render('budgets/dashboard')` → `resources/js/pages/budgets/dashboard.tsx`).
- TS path alias `@/*` → `resources/js/*`. shadcn aliases live in `components.json`.

### Routing layout
`routes/web.php` is a manifest that requires feature files from `routes/web/` (`dashboard.php`, `users.php`, `budgets.php`, `activity.php`, `roles.php`, `invitations.php`, `invitations-public.php`, `onboarding.php`, `activation.php`, `public.php`). Auth + settings live in `routes/auth.php` and `routes/settings.php`. Add new feature areas as a new file under `routes/web/` and `require` it from `web.php` — don't dump routes into `web.php` directly.

Authenticated app routes are gated by the chain `['auth', 'account.active', 'profile.onboarded']`. The aliases are defined in `bootstrap/app.php`:
- `account.active` → `EnsureAccountIsActive` (rejects suspended/pending accounts; `AccountStatus` enum)
- `profile.onboarded` → `RedirectIfProfileIncomplete` (forces onboarding flow when `users.onboarding_completed_at` is null)
- `pending-2fa` → `EnsurePendingTwoFactorLogin`
- `role`, `permission`, `role_or_permission` → Spatie

Controllers are namespaced by domain under `App\Http\Controllers\Web\{Area}` (Auth, Budgets, Users, Roles, Activity, Invitations, Onboarding, Activation, Settings, Dashboard). `App\Http\Controllers\Web\Budgets` is a single feature folder containing the budget/category/transaction/share/debt/recurring/tag/export/analytics controllers.

### RBAC
`app/Support/PermissionCatalog.php` is the **single source of truth** for permission names. Permissions are namespaced `pfm.<domain>.<resource>.<action>` (e.g. `pfm.finance.transactions.manage`, `pfm.identity.users.assign-roles`). To add a permission:
1. Add the row to `PermissionCatalog::all()`.
2. Re-run `RolePermissionSeeder` (it's idempotent — `firstOrCreate` per row, `forgetCachedPermissions` before/after).
3. Wire it into the `finance-lead` / `member` `syncPermissions()` lists if appropriate (`super-admin` always gets all).

Three seeded roles: `super-admin`, `finance-lead`, `member` (all guard `web`). Frontend permission checks use `hasPermission(user, 'pfm.x.y')` from `resources/js/lib/can.ts`, reading the `permissions` array shared by `HandleInertiaRequests`.

### Activity logging (audit trail)
Two layers, both writing to the Spatie `activity_log` table:
- **Automatic HTTP audit**: `LogAuthenticatedMutations` middleware (`terminate()` hook) logs every successful non-GET request from an authenticated user under log name `http`. The `EXCLUDED_ROUTE_NAMES` const + name-prefix checks (`invitation.`, `broadcasting.`, `users.`, `api-tokens.`) suppress noisy or sensitive routes — extend that list rather than adding ad-hoc checks elsewhere.
- **Explicit domain events**: `App\Support\ActivityLogger::log($description, $subject, $properties, $causer, $logName)` is the helper everything else should use. It auto-attaches the current user, IP, and user agent. `AppServiceProvider` already wires it to `Login` / `Logout` / `Failed` auth events under log name `auth`.

When adding a new domain action that should be audited, prefer `ActivityLogger::log()` with a descriptive `$logName` over calling `activity()` directly so the IP/UA properties stay consistent.

### Models / domain
Finance domain root is `App\Models\Budget` with `categories`, `transactions`, `shares`, `sharedWith` (HasManyThrough via `BudgetShare`). Sibling models: `BudgetCategory`, `BudgetTransaction`, `BudgetShare`, `RecurringTransaction`, `Debt`/`DebtRepayment`, `TransactionTag`, `FinancialAnalytics`, `SpendingPattern`, `Notification`. `User` uses `HasApiTokens` (Sanctum), `HasRoles` (Spatie), `MustVerifyEmail`, casts `account_status` → `AccountStatus` enum, exposes `mustCompleteOnboarding()`.

Currency formatting on `Budget` is hard-coded to PKR (`₨`) / SAR (`﷼`) — if you add a currency, update `formatCurrency()` in `app/Models/Budget.php`.

### Frontend layout
- Pages: `resources/js/pages/<area>/<page>.tsx`
- Layouts: `resources/js/layouts/{app,auth,settings}/...` plus `app-layout.tsx`, `auth-layout.tsx`, `full-page-layout.tsx`
- Shared types in `resources/js/types/index.ts` (`SharedData`, `User`, `Paginated<T>`, `NavItem`, etc.) — keep `User`/`SharedData` in sync with `HandleInertiaRequests::share()`
- shadcn primitives in `resources/js/components/ui`, app-specific composites in `resources/js/components`

## Conventions worth preserving

- **Don't add routes directly to `routes/web.php`** — split by concern under `routes/web/` and `require` it.
- **Don't hand-write permission strings in seeders or policies** — add to `PermissionCatalog` and seed.
- **For audited mutations, use `ActivityLogger::log()`** rather than `activity()` directly.
- **Page component path = Inertia name** — renaming `resources/js/pages/...` requires updating every `Inertia::render()` call that targets it.
- Pest test files use the closure form (`it('...', function () { ... })`); Feature tests get `RefreshDatabase` for free, Unit tests do not.
