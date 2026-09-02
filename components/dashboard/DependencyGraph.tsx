"use client";

import { useEffect, useState } from 'react';
import { Network } from 'lucide-react';

interface DependencyNode {
  id: string;
  name: string;
  fullName: string;
  language: string | null;
  topics: string[];
  description: string | null;
  url: string;
}

interface DependencyEdge {
  source: string;
  target: string;
  strength: number;
  reasons: string[];
}

interface DependencyGraphData {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

/**
 * Cross-repo dependency mapping — infers connections from shared topics and
 * primary language, rendered as a simple force-ish layout using SVG.
 * No chart library: positions are computed from edge strength.
 */
export function DependencyGraph() {
  const [data, setData] = useState<DependencyGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/dependencies')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) {
          if (d?.success) setData(d);
          else setError(d?.error || 'Failed to load dependencies');
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load dependencies');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;
  if (error || !data || data.nodes.length === 0) return null;

  const { nodes, edges } = data;
  const connectedNodeIds = new Set<string>();
  edges.forEach((e) => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });
  const connectedNodes = nodes.filter((n) => connectedNodeIds.has(n.id));

  if (connectedNodes.length < 2) return null;

  // Simple circular layout
  const width = 600;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  const positions = new Map<string, { x: number; y: number }>();
  connectedNodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / connectedNodes.length - Math.PI / 2;
    positions.set(n.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  const maxStrength = Math.max(...edges.map((e) => e.strength), 1);

  return (
    <div className="glass rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/40 transition-colors border-b border-slate-700/30"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Cross-Repo Dependencies</h3>
          <span className="text-slate-500 text-xs ml-2">{expanded ? '▼' : '▶'}</span>
        </div>
        <span className="text-xs text-slate-400">{edges.length} connections</span>
      </button>
      {expanded && (
        <div className="p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {edges.map((e, i) => {
              const a = positions.get(e.source);
              const b = positions.get(e.target);
              if (!a || !b) return null;
              const opacity = 0.3 + (e.strength / maxStrength) * 0.7;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#22d3ee"
                  strokeWidth={1 + (e.strength / maxStrength) * 2}
                  strokeOpacity={opacity}
                />
              );
            })}
            {connectedNodes.map((n) => {
              const pos = positions.get(n.id);
              if (!pos) return null;
              return (
                <g key={n.id}>
                  <circle cx={pos.x} cy={pos.y} r={18} fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#e2e8f0"
                    className="select-none"
                  >
                    {n.name.length > 12 ? n.name.slice(0, 11) + '…' : n.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 space-y-1">
            {edges
              .sort((a, b) => b.strength - a.strength)
              .slice(0, 8)
              .map((e, i) => {
                const source = nodes.find((n) => n.id === e.source);
                const target = nodes.find((n) => n.id === e.target);
                if (!source || !target) return null;
                return (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-300">
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">{source.name}</a>
                      <span className="text-slate-500 mx-1">↔</span>
                      <a href={target.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">{target.name}</a>
                    </span>
                    <span className="text-slate-500" title={e.reasons.join('; ')}>
                      {e.reasons[0]}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}