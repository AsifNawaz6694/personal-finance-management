<?php

namespace Database\Seeders;

use App\Support\PermissionCatalog;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (PermissionCatalog::all() as $row) {
            Permission::query()->firstOrCreate(
                ['name' => $row['name'], 'guard_name' => 'web'],
            );
        }

        $super = Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $financeLead = Role::query()->firstOrCreate(['name' => 'finance-lead', 'guard_name' => 'web']);
        $member = Role::query()->firstOrCreate(['name' => 'member', 'guard_name' => 'web']);

        $super->syncPermissions(Permission::query()->pluck('name')->all());

        $financeLead->syncPermissions([
            'pfm.core.access',
            'pfm.workspace.dashboard',
            'pfm.finance.transactions.view',
            'pfm.finance.transactions.manage',
            'pfm.finance.reports.export',
            'pfm.security.roles.view',
            'pfm.security.activity.view',
            'pfm.identity.users.invite',
        ]);

        $member->syncPermissions([
            'pfm.core.access',
            'pfm.workspace.dashboard',
            'pfm.self.onboarding',
            'pfm.finance.transactions.view',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
