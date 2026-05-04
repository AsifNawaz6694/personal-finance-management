<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAccountSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
                'account_status' => AccountStatus::Active,
                'onboarding_completed_at' => now(),
                'two_factor_enabled' => false,
            ],
        );

        $admin->syncRoles(['super-admin']);
    }
}
