<?php

namespace App\Http\Controllers\Web\Settings;

use App\Http\Controllers\Controller;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    public function edit(Request $request): Response
    {
        $plainToken = $request->session()->pull('sanctum_new_token');

        return Inertia::render('settings/api-tokens', [
            'tokens' => $request->user()->tokens()->get()->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'last_used_at' => $t->last_used_at,
                'created_at' => $t->created_at,
            ]),
            'plainToken' => $plainToken,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $token = $request->user()->createToken($data['name']);

        ActivityLogger::log(
            'API access token created',
            $request->user(),
            ['token_name' => $data['name']],
            $request->user(),
            'security',
        );

        return redirect()->route('api-tokens.edit')->with('sanctum_new_token', $token->plainTextToken);
    }

    public function destroy(Request $request, int $token): RedirectResponse
    {
        $deleted = $request->user()->tokens()->where('id', $token)->delete();

        if ($deleted) {
            ActivityLogger::log(
                'API access token revoked',
                $request->user(),
                ['token_id' => $token],
                $request->user(),
                'security',
            );
        }

        return redirect()->route('api-tokens.edit');
    }
}
