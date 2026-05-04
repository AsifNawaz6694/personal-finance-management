<?php

namespace App\Http\Controllers\Web\Invitations;

use App\Http\Controllers\Controller;
use App\Mail\UserInvitationMail;
use App\Models\User;
use App\Models\UserInvitation;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserInvitationController extends Controller
{
    public function create(Request $request): Response
    {
        if (! $request->user()->can('pfm.identity.users.invite')) {
            abort(403);
        }

        return Inertia::render('users/invite', [
            'roleOptions' => Role::query()->orderBy('name')->pluck('name'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->can('pfm.identity.users.invite')) {
            abort(403);
        }

        $roles = Role::query()->pluck('name')->all();

        $data = $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', Rule::exists('roles', 'name')],
        ]);

        $pending = UserInvitation::query()
            ->where('email', $data['email'])
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->exists();

        if ($pending) {
            return back()->withErrors(['email' => __('An invitation is already pending for this email.')]);
        }

        $plainToken = Str::random(48);
        $invitation = UserInvitation::query()->create([
            'email' => $data['email'],
            'token_hash' => UserInvitation::hashToken($plainToken),
            'invited_by' => $request->user()->id,
            'roles' => $data['roles'] ?? [],
            'expires_at' => now()->addDays(7),
        ]);

        $invitation->load('inviter');
        $acceptUrl = url(route('invitation.show', ['token' => $plainToken], absolute: false));

        Mail::to($data['email'])->send(new UserInvitationMail($invitation, $acceptUrl));

        ActivityLogger::log(
            'User invitation emailed',
            $invitation,
            ['email' => $data['email'], 'roles' => $data['roles'] ?? []],
            $request->user(),
            'invitation',
        );

        return redirect()->route('users.index')->with('status', __('Invitation sent to :email.', ['email' => $data['email']]));
    }
}
