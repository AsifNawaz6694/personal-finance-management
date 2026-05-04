import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Hourglass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Activation', href: '/activation/pending' }];

export default function ActivationPending() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending activation" />
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto flex max-w-lg flex-col items-center px-4 py-12 text-center"
            >
                <div className="bg-primary/12 text-primary mb-4 flex size-16 items-center justify-center rounded-3xl shadow-[var(--shadow-soft)]">
                    <Hourglass className="size-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Awaiting administrator activation</h1>
                <p className="text-muted-foreground mt-3 text-sm text-pretty">
                    Your profile is ready, but an administrator still needs to mark your account as <strong>active</strong> before you can use the full workspace.
                    You&apos;ll receive access to dashboards, settings, and integrations once that happens.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <Button variant="outline" className="rounded-xl" type="button" onClick={() => router.post(route('logout'))}>
                        Sign out
                    </Button>
                </div>
            </motion.div>
        </AppLayout>
    );
}
