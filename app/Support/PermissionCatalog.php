<?php

namespace App\Support;

/**
 * Single source of truth for RBAC names (seeded into Spatie permissions).
 * Grouped by domain so UIs and policies stay aligned.
 */
final class PermissionCatalog
{
    /**
     * @return list<array{name: string, group: string, description: string}>
     */
    public static function all(): array
    {
        return [
            ['name' => 'pfm.core.access', 'group' => 'Core', 'description' => 'Sign in and use the authenticated application shell'],

            ['name' => 'pfm.workspace.dashboard', 'group' => 'Workspace', 'description' => 'View the main dashboard'],

            ['name' => 'pfm.finance.transactions.view', 'group' => 'Finance', 'description' => 'View transactions'],
            ['name' => 'pfm.finance.transactions.manage', 'group' => 'Finance', 'description' => 'Create, update, and delete transactions'],
            ['name' => 'pfm.finance.reports.export', 'group' => 'Finance', 'description' => 'Export financial reports'],

            ['name' => 'pfm.identity.users.view', 'group' => 'User management', 'description' => 'List and inspect users'],
            ['name' => 'pfm.identity.users.create', 'group' => 'User management', 'description' => 'Invite or create users'],
            ['name' => 'pfm.identity.users.update', 'group' => 'User management', 'description' => 'Edit user profiles and metadata'],
            ['name' => 'pfm.identity.users.delete', 'group' => 'User management', 'description' => 'Remove users from the organization'],
            ['name' => 'pfm.identity.users.assign-roles', 'group' => 'User management', 'description' => 'Assign and revoke Spatie roles'],
            ['name' => 'pfm.identity.users.manage-status', 'group' => 'User management', 'description' => 'Activate, suspend, or pending-lock accounts'],

            ['name' => 'pfm.security.roles.view', 'group' => 'Security', 'description' => 'View role names and permission coverage'],
            ['name' => 'pfm.security.roles.sync', 'group' => 'Security', 'description' => 'Sync role permission sets (advanced)'],
            ['name' => 'pfm.security.activity.view', 'group' => 'Security', 'description' => 'View organization-wide activity & audit stream'],
            ['name' => 'pfm.security.api-tokens.manage', 'group' => 'Security', 'description' => 'Create and revoke personal API tokens'],

            ['name' => 'pfm.identity.users.invite', 'group' => 'User management', 'description' => 'Send email invitations for pending accounts'],

            ['name' => 'pfm.self.onboarding', 'group' => 'Self service', 'description' => 'Complete personal onboarding steps'],
        ];
    }

    /**
     * @return array<string, list<string>>
     */
    public static function groupedNames(): array
    {
        $out = [];
        foreach (self::all() as $row) {
            $out[$row['group']][] = $row['name'];
        }

        return $out;
    }
}
