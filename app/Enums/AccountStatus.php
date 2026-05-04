<?php

namespace App\Enums;

enum AccountStatus: string
{
    case Active = 'active';
    case PendingActivation = 'pending_activation';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::PendingActivation => 'Pending activation',
            self::Suspended => 'Suspended',
        };
    }
}
