<?php

namespace App\Http\Controllers\Web\Users;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Users\StoreUserRequest;
use App\Http\Requests\Web\Users\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->with('roles')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'roleOptions' => Role::query()->orderBy('name')->pluck('name'),
            'accountStatuses' => collect(AccountStatus::cases())->map(fn (AccountStatus $c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            'roleOptions' => Role::query()->orderBy('name')->pluck('name'),
            'accountStatuses' => collect(AccountStatus::cases())->map(fn (AccountStatus $c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $roles = $data['roles'] ?? [];
        if (! $request->user()->can('pfm.identity.users.assign-roles')) {
            $roles = [];
        }
        unset($data['roles'], $data['force_onboarding'], $data['password_confirmation']);

        $status = $this->normalizeAccountStatus($data['account_status']);
        $data['password'] = Hash::make($data['password']);
        $data['account_status'] = $status;
        $data['onboarding_completed_at'] = $this->resolveOnboardingTimestamp(
            $status,
            $request->boolean('force_onboarding')
        );

        $user = User::query()->create($data);
        if ($roles !== []) {
            $user->syncRoles($roles);
        }

        return redirect()->route('users.index')->with('status', __('User created.'));
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'account_status' => $user->account_status->value,
                'phone' => $user->phone,
                'job_title' => $user->job_title,
                'roles' => $user->getRoleNames()->values()->all(),
                'onboarding_completed_at' => $user->onboarding_completed_at,
            ],
            'roleOptions' => Role::query()->orderBy('name')->pluck('name'),
            'accountStatuses' => collect(AccountStatus::cases())->map(fn (AccountStatus $c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        $roles = $data['roles'] ?? [];
        if (! $request->user()->can('pfm.identity.users.assign-roles')) {
            $roles = null;
        }
        unset($data['roles'], $data['force_onboarding'], $data['password_confirmation']);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $status = $this->normalizeAccountStatus($data['account_status']);
        $data['account_status'] = $status;

        if ($request->boolean('force_onboarding')) {
            $data['onboarding_completed_at'] = null;
        } else {
            unset($data['onboarding_completed_at']);
        }

        $user->update($data);

        if (is_array($roles)) {
            $user->syncRoles($roles);
        }

        return redirect()->route('users.index')->with('status', __('User updated.'));
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);
        $user->delete();

        return redirect()->route('users.index')->with('status', __('User removed.'));
    }

    private function resolveOnboardingTimestamp(AccountStatus $status, bool $forceOnboarding): ?\Illuminate\Support\Carbon
    {
        if ($status !== AccountStatus::Active) {
            return null;
        }

        if ($forceOnboarding) {
            return null;
        }

        return now();
    }

    private function normalizeAccountStatus(mixed $value): AccountStatus
    {
        return $value instanceof AccountStatus
            ? $value
            : AccountStatus::from((string) $value);
    }
}
