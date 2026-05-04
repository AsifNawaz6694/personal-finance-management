import { type User } from '@/types';

export function hasPermission(user: User | null | undefined, permission: string): boolean {
    if (!user?.permissions || !Array.isArray(user.permissions)) {
        return false;
    }

    return user.permissions.includes(permission);
}
