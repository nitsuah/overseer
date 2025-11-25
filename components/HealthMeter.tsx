import React from 'react';

interface HealthMeterProps {
    score: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function HealthMeter({ score, size = 'md', showLabel = true }: HealthMeterProps) {
    // Clamp score between 0-100
    const clampedScore = Math.max(0, Math.min(100, score));

    // Determine color based on score
    const getColor = () => {
        if (clampedScore >= 90) return { stroke: '#10b981', bg: '#10b98120' }; // green
        if (clampedScore >= 75) return { stroke: '#3b82f6', bg: '#3b82f620' }; // blue
        if (clampedScore >= 60) return { stroke: '#f59e0b', bg: '#f59e0b20' }; // amber
        return { stroke: '#ef4444', bg: '#ef444420' }; // red
    };

    const colors = getColor();

    // Calculate circle properties
    const sizes = {
        sm: { radius: 16, strokeWidth: 3, fontSize: 'text-xs' },
        md: { radius: 20, strokeWidth: 4, fontSize: 'text-sm' },
        lg: { radius: 28, strokeWidth: 5, fontSize: 'text-base' },
    };

    const { radius, strokeWidth, fontSize } = sizes[size];
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedScore / 100) * circumference;

    return (
        <div className="flex items-center gap-2">
            <svg
                width={radius * 2 + strokeWidth * 2}
                height={radius * 2 + strokeWidth * 2}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                    fill="none"
                    stroke={colors.bg}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showLabel && (
                <span className={`font-semibold ${fontSize}`} style={{ color: colors.stroke }}>
                    {Math.round(clampedScore)}%
                </span>
            )}
        </div>
    );
}
