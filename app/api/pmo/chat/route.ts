import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateWithFailover } from '@/lib/ai-failover';
import logger from '@/lib/log';
import type { PmoPortfolio, PmoRepoSummary } from '@/app/api/pmo/overview/route';

export interface PmoChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface PmoChatAction {
    type: 'suggest_roadmap_item' | 'generate_agent_prompt' | 'update_task_status' | 'update_roadmap_status';
    repoName?: string;
    title?: string;
    quarter?: string;
    rationale?: string;
    prompt?: string;
    taskId?: string;
    status?: string;
}

// Strip action markers from any string that will be interpolated into the prompt
// to prevent client-supplied repo names or task titles from injecting fake actions.
function sanitizeForPrompt(s: string): string {
    return s.replace(/\[ROADMAP_SUGGESTION\]|\[AGENT_PROMPT\]|\[\/AGENT_PROMPT\]/g, '');
}

function buildPortfolioContext(repos: PmoRepoSummary[], portfolio: PmoPortfolio): string {
    const lines: string[] = [
        `Portfolio: ${portfolio.repo_count} repos tracked`,
        `Roadmap: ${portfolio.roadmap_planned} planned, ${portfolio.roadmap_in_progress} in progress, ${portfolio.roadmap_in_review} in review, ${portfolio.roadmap_done} done`,
        `Tasks in progress: ${portfolio.tasks_in_progress}`,
        `Items without linked PR: ${portfolio.stale_count}`,
        '',
        'Repositories:',
    ];

    for (const repo of repos) {
        const name = sanitizeForPrompt(repo.full_name ?? '');
        const score = repo.health_score ?? 'unknown';
        const ci = repo.ci_status ?? 'unknown';
        const rm = repo.roadmap;
        const pct = rm.total > 0 ? Math.round((rm.done / rm.total) * 100) : 0;
        lines.push(
            `  ${name}: health=${score}/100 ci=${ci} roadmap=${pct}% done (${rm.planned} planned/${rm.in_progress} in-progress/${rm.done} done) open_prs=${repo.open_prs}`
        );
        if (repo.in_progress_items.length > 0) {
            const titles = repo.in_progress_items
                .map(i => sanitizeForPrompt(i.title ?? ''))
                .join(', ');
            lines.push(`    In progress: ${titles}`);
        }
    }

    return lines.join('\n');
}

function buildSystemPrompt(portfolioContext: string): string {
    return `You are Vigil PMO Assistant, an AI project manager for a portfolio of software repositories tracked by Vigil.

You help engineering managers:
- Identify repos that need attention (low health scores, vulnerabilities, failing CI, no tests)
- Suggest roadmap items to improve specific repos based on their health signals
- Generate structured prompts for coding agents (Claude, GitHub Copilot) to implement improvements
- Answer questions about portfolio status, priorities, and next steps

Current portfolio snapshot:
${portfolioContext}

When suggesting a roadmap item for a specific repo, include a line in EXACTLY this format:
[ROADMAP_SUGGESTION] repoName | Quarter (e.g. Q4 2026) | Title of item | One-sentence rationale

When generating a prompt for a coding agent (Claude or Copilot), wrap it like this:
[AGENT_PROMPT]
...the prompt content the user should paste into Claude or Copilot...
[/AGENT_PROMPT]

Rules:
- Be concise and direct. Prioritize by impact to the portfolio.
- Roadmap suggestions should address real health signal weaknesses (low coverage, vulns, missing CI, etc.)
- Agent prompts should be specific enough to be actionable without additional context.
- If the user asks a general question, answer without emitting action markers.`;
}

function parseActions(text: string): PmoChatAction[] {
    const actions: PmoChatAction[] = [];

    // Parse roadmap suggestions
    const roadmapRe = /\[ROADMAP_SUGGESTION\]\s*([^|]+)\|([^|]+)\|([^|]+)\|(.+)/gm;
    let m: RegExpExecArray | null;
    while ((m = roadmapRe.exec(text)) !== null) {
        actions.push({
            type: 'suggest_roadmap_item',
            repoName: m[1].trim(),
            quarter: m[2].trim(),
            title: m[3].trim(),
            rationale: m[4].trim(),
        });
    }

    // Parse agent prompts
    const agentRe = /\[AGENT_PROMPT\]([\s\S]*?)\[\/AGENT_PROMPT\]/g;
    while ((m = agentRe.exec(text)) !== null) {
        actions.push({
            type: 'generate_agent_prompt',
            prompt: m[1].trim(),
        });
    }

    return actions;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, repos, portfolio, history } = body as {
            message: unknown;
            repos: PmoRepoSummary[];
            portfolio: PmoPortfolio;
            history?: PmoChatMessage[];
        };

        if (typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }
        if (message.length > 2000) {
            return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 });
        }
        const safeMessage = message.trim();
        const safeHistory = Array.isArray(history)
            ? history.slice(-6).filter(
                m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
            )
            : [];

        const portfolioContext = buildPortfolioContext(repos ?? [], portfolio ?? {
            repo_count: 0, roadmap_planned: 0, roadmap_in_progress: 0,
            roadmap_in_review: 0, roadmap_done: 0, tasks_in_progress: 0, stale_count: 0,
        });
        const systemPrompt = buildSystemPrompt(portfolioContext);

        // Build conversation string (simple, no SDK function-calling needed)
        const conversationParts: string[] = [systemPrompt, ''];
        for (const msg of safeHistory) {
            conversationParts.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
        }
        conversationParts.push(`User: ${safeMessage}`);
        conversationParts.push('Assistant:');

        const fullPrompt = conversationParts.join('\n');

        const reply = await generateWithFailover(fullPrompt, { useShortResponse: false });
        const actions = parseActions(reply);

        // Strip action markers from the displayed reply.
        // Also strip a trailing unterminated [AGENT_PROMPT] if the model was cut off.
        const cleanReply = reply
            .replace(/\[ROADMAP_SUGGESTION\][^\n]*/g, '')
            .replace(/\[AGENT_PROMPT\][\s\S]*?\[\/AGENT_PROMPT\]/g, '')
            .replace(/\[\/?\s*AGENT_PROMPT\][\s\S]*$/g, '')
            .trim();

        return NextResponse.json({ reply: cleanReply, actions });
    } catch (error: unknown) {
        logger.error('PMO chat error:', error);
        return NextResponse.json({ error: 'Assistant unavailable' }, { status: 500 });
    }
}
