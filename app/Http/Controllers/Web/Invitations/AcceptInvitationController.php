<?php

namespace App\Http\Controllers\Web\Invitations;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserInvitation;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AcceptInvitationController extends Controller
{
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = UserInvitation::query()
            ->where('token_hash', UserInvitation::hashToken($token))
            ->first();

        if ($invitation === null || ! $invitation->isPending()) {
            return redirect()->route('login')->with('status', __('This invitation is invalid or has expired.'));
        }

        return Inertia::render('auth/accept-invitation', [
            'email' => $invitation->email,
            'token' => $token,
        ]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        $invitation = UserInvitation::query()
            ->where('token_hash', UserInvitation::hashToken($token))
            ->first();

        if ($invitation === null || ! $invitation->isPending()) {
            return redirect()->route('login')->with('status', __('This invitation is invalid or has expired.'));
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $invitation->email,
            'password' => Hash::make($data['password']),
            'account_status' => AccountStatus::PendingActivation,
            'onboarding_completed_at' => null,
            'email_verified_at' => now(),
        ]);

        $roles = $invitation->roles ?? [];
        if ($roles !== []) {
            $user->syncRoles($roles);
        }

        $invitation->update(['accepted_at' => now()]);

        ActivityLogger::log(
            'Invitation accepted; account pending activation',
            $user,
            ['invited_by' => $invitation->invited_by, 'roles' => $roles],
            $user,
            'invitation',
        );

        Auth::login($user);

        return redirect()->route('onboarding.edit')->with(
            'status',
            __('Welcome — complete your profile while an administrator activates your account.'),
        );
    }
}
