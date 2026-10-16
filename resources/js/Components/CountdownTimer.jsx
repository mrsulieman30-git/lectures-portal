import React, { useState, useEffect } from 'react';
import { Clock, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function CountdownTimer({ deadline, allowLate = false, className = '' }) {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(deadline) - +new Date();
        if (difference <= 0) {
            return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
        }

        return {
            total: difference,
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            isPast: false,
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline]);

    if (timeLeft.isPast) {
        if (allowLate) {
            return (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('lateSubmissionAccepted', 'Late Submissions Open')}</span>
                </span>
            );
        }

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span>{t('submissionLocked', 'Submission Locked')}</span>
            </span>
        );
    }

    const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // less than 24 hours

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                isUrgent
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            } ${className}`}
            title={`Deadline: ${new Date(deadline).toLocaleString()}`}
        >
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500' : 'text-indigo-500'}`} />
            <span>
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
        </span>
    );
}
