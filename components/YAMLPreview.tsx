"use client";

/**
 * YAML syntax highlighting component.
 * Provides basic color coding for YAML files.
 */
export function YAMLPreview({ content }: { content: string }) {
  const renderYAML = (text: string): string => {
    const lines = text.split('\n');
    
    return lines.map(line => {
      // Comments
      if (line.trim().startsWith('#')) {
        return `<span class="text-slate-500">${escapeHtml(line)}</span>`;
      }
      
      // Key-value pairs
      const keyValueMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (keyValueMatch) {
        const [, indent, key, value] = keyValueMatch;
        let coloredValue = escapeHtml(value);
        
        // Strings in quotes
        coloredValue = coloredValue.replace(/(["'])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>');
        
        // Numbers
        coloredValue = coloredValue.replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>');
        
        // Booleans
        coloredValue = coloredValue.replace(/\b(true|false|yes|no|on|off)\b/gi, '<span class="text-purple-400">$1</span>');
        
        // Null
        coloredValue = coloredValue.replace(/\b(null|~)\b/gi, '<span class="text-slate-500">$1</span>');
        
        return `${escapeHtml(indent)}<span class="text-yellow-400">${escapeHtml(key)}</span>: ${coloredValue}`;
      }
      
      // List items
      if (line.trim().startsWith('-')) {
        const match = line.match(/^(\s*)(- )(.*)$/);
        if (match) {
          const [, indent, dash, rest] = match;
          let coloredRest = escapeHtml(rest);
          
          // Strings in quotes
          coloredRest = coloredRest.replace(/(["'])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>');
          
          // Numbers
          coloredRest = coloredRest.replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>');
          
          return `${escapeHtml(indent)}<span class="text-slate-400">${escapeHtml(dash)}</span>${coloredRest}`;
        }
      }
      
      return escapeHtml(line);
    }).join('\n');
  };
  
  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  return (
    <pre className="text-xs font-mono leading-relaxed">
      <code dangerouslySetInnerHTML={{ __html: renderYAML(content) }} />
    </pre>
  );
}
