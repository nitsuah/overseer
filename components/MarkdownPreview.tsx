"use client";

/**
 * Lightweight markdown preview component.
 * Renders basic markdown formatting without external dependencies.
 */
export function MarkdownPreview({ content }: { content: string }) {
  // Simple markdown-to-HTML conversion
  const renderMarkdown = (text: string): string => {
    let html = text;

    // Remove HTML comments (including multi-line)
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Escape HTML to prevent XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers (process from h3 to h1 to avoid conflicts)
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold mt-3 mb-2 text-slate-100">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-100">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-100">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-slate-100">$1</h1>');

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-slate-600 pl-4 my-3 text-slate-300 italic">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="border-t border-slate-600 my-4" />');
    html = html.replace(/^\*\*\*$/gim, '<hr class="border-t border-slate-600 my-4" />');

    // Code blocks (must be before inline code)
    html = html.replace(/```([\w]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-slate-800 border border-slate-700 p-3 rounded my-3 overflow-x-auto"><code class="text-xs text-slate-200 font-mono">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-300">$1</code>');

    // Bold (must be before italic to handle ** before *)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-semibold text-slate-100">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic text-slate-200">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />');

    // Tables (GitHub-flavored markdown)
    html = html.replace(/\n(\|.+\|)\n\|[\s\-:|]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
      const headerCells = header.split('|').filter((c: string) => c.trim()).map((c: string) => 
        `<th class="border border-slate-600 px-3 py-2 bg-slate-700 font-semibold text-left">${c.trim()}</th>`
      ).join('');
      
      const bodyRows = body.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => 
          `<td class="border border-slate-600 px-3 py-2">${c.trim()}</td>`
        ).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      
      return `<table class="my-4 w-full border-collapse"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    });

    // Task lists
    html = html.replace(/^- \[ \] (.+)$/gim, '<li class="ml-4 flex items-start gap-2"><input type="checkbox" disabled class="mt-1" /> <span>$1</span></li>');
    html = html.replace(/^- \[x\] (.+)$/gim, '<li class="ml-4 flex items-start gap-2"><input type="checkbox" disabled checked class="mt-1" /> <span class="line-through text-slate-400">$1</span></li>');

    // Unordered lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6 list-disc text-slate-300">$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-6 list-disc text-slate-300">$1</li>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6 list-decimal text-slate-300">$1</li>');

    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/(<li class="ml-6 list-disc[^>]*>.*?<\/li>\s*)+/g, '<ul class="my-2">$&</ul>');
    html = html.replace(/(<li class="ml-6 list-decimal[^>]*>.*?<\/li>\s*)+/g, '<ol class="my-2">$&</ol>');
    html = html.replace(/(<li class="ml-4 flex[^>]*>.*?<\/li>\s*)+/g, '<ul class="my-2">$&</ul>');

    // Paragraphs: split on double line breaks
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      // Don't wrap if already has block-level tags
      if (p.match(/^<(h\d|pre|blockquote|ul|ol|hr)/)) {
        return p;
      }
      // Replace single line breaks with <br/>
      const content = p.replace(/\n/g, '<br/>');
      return `<p class="my-2 text-slate-300">${content}</p>`;
    }).join('\n');

    return html;
  };

  return (
    <div
      className="text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
