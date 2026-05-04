import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Onboarding', href: '/onboarding' }];

interface Props {
    job_title: string | null;
    phone: string | null;
}

interface OnboardingFormData {
    job_title: string;
    phone: string;
    [key: string]: string;
}

export default function OnboardingEdit({ job_title, phone }: Props) {
    const { data, setData, post, processing, errors } = useForm<OnboardingFormData>({
        job_title: job_title ?? '',
        phone: phone ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.update'));
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Complete Your Profile">
            <Head title="Welcome — complete your profile" />
            <div className="w-full max-w-none space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s personalize your workspace</h1>
                    <p className="text-muted-foreground mt-2 text-sm text-pretty">
                        A few optional details help administrators recognize you. You can change these later in settings.
                    </p>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="job_title">Job title</Label>
                        <Input
                            id="job_title"
                            value={data.job_title}
                            onChange={(e) => setData('job_title', e.target.value)}
                            placeholder="e.g. Finance analyst"
                            autoComplete="organization-title"
                        />
                        <InputError message={errors.job_title} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Optional"
                            autoComplete="tel"
                        />
                        <InputError message={errors.phone} />
                    </div>
                    <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                        {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                        Continue to dashboard
                    </Button>
                </form>
            </div>
        </FullPageLayout>
    );
}
