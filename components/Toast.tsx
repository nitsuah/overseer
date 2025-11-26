import React, { useEffect } from 'react';

// Simple Toast component for non-disruptive notifications
export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow-lg z-50">
            {message}
        </div>
    );
};
