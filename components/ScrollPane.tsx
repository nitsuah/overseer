"use client";

import React from 'react';

interface ScrollPaneProps {
  className?: string;
  children: React.ReactNode;
}

// A consistent inner scroller that takes remaining height and scrolls vertically.
export function ScrollPane({ className = "", children }: ScrollPaneProps) {
  return (
    <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${className}`}>{children}</div>
  );
}
