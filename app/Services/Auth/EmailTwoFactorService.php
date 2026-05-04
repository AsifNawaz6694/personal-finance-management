<?php

namespace App\Services\Auth;

use App\Mail\AuthLoginTwoFactorMail;
use App\Mail\AuthTwoFactorSetupMail;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class EmailTwoFactorService
{
    private const LOGIN_TTL_MINUTES = 10;

    private const SETUP_TTL_MINUTES = 15;

    public function sendLoginChallenge(User $user): void
    {
        $code = $this->randomDigits();
        $this->putHashed($this->loginKey($user->id), $code, self::LOGIN_TTL_MINUTES);
        Mail::to($user)->send(new AuthLoginTwoFactorMail($code, $user));
    }

    public function verifyLoginChallenge(User $user, string $code): void
    {
        $this->assertCodeMatches($this->loginKey($user->id), $code);
    }

    public function sendSetupChallenge(User $user): void
    {
        $code = $this->randomDigits();
        $this->putHashed($this->setupKey($user->id), $code, self::SETUP_TTL_MINUTES);
        Mail::to($user)->send(new AuthTwoFactorSetupMail($code, $user));
    }

    public function verifySetupChallenge(User $user, string $code): void
    {
        $this->assertCodeMatches($this->setupKey($user->id), $code);
    }

    private function loginKey(int $userId): string
    {
        return 'auth:2fa-login:'.$userId;
    }

    private function setupKey(int $userId): string
    {
        return 'auth:2fa-setup:'.$userId;
    }

    private function putHashed(string $key, string $code, int $minutes): void
    {
        Cache::put($key, $this->hash($code), now()->addMinutes($minutes));
    }

    private function assertCodeMatches(string $key, string $code): void
    {
        $stored = Cache::pull($key);
        if ($stored === null || ! hash_equals((string) $stored, $this->hash($code))) {
            throw ValidationException::withMessages([
                'code' => __('The verification code is invalid or has expired.'),
            ]);
        }
    }

    private function hash(string $code): string
    {
        return hash('sha256', $code.config('app.key'));
    }

    private function randomDigits(): string
    {
        return (string) random_int(100000, 999999);
    }
}
