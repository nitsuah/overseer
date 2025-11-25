'use client';

import { HealthMeter } from '@/components/HealthMeter';

export default function TestHealthPage() {
    const scores = [100, 95, 80, 75, 65, 60, 50, 25, 0];
    const sizes = ['sm', 'md', 'lg'] as const;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
            <h1 className="text-3xl font-bold mb-8">Health Meter Validation</h1>

            <div className="space-y-12">
                {sizes.map(size => (
                    <div key={size} className="space-y-4">
                        <h2 className="text-xl font-semibold capitalize">{size} Size</h2>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-8">
                            {scores.map(score => (
                                <div key={score} className="flex flex-col items-center gap-2 p-4 glass rounded-lg border border-slate-700">
                                    <HealthMeter score={score} size={size} />
                                    <span className="text-xs text-slate-400">Score: {score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
