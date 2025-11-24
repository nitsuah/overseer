import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Activity column cell to insert after Health column
const activityCell = `                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className={\`flex items-center gap-1 \${getCommitFreshnessColor(repo.last_commit_date)}\`} title={repo.last_commit_date || 'No commits'}>
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(repo.last_commit_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            {(repo.open_prs !== undefined && repo.open_prs > 0) && (
                              <span className="flex items-center gap-1" title={\`\${repo.open_prs} open PRs\`}>
                                <GitPullRequest className="h-3 w-3" />
                                {repo.open_prs}
                              </span>
                            )}
                            {(repo.open_issues_count !== undefined && repo.open_issues_count > 0) && (
                              <span className="flex items-center gap-1" title={\`\${repo.open_issues_count} open issues\`}>
                                <AlertCircle className="h-3 w-3" />
                                {repo.open_issues_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>`;

// Find and replace after Health column
const healthPattern = /(\s+<\/div>\r?\n\s+<\/td>\r?\n)(\s+<td className="px-6 py-4">\r?\n\s+{details \?)/;
content = content.replace(healthPattern, `$1${activityCell}\n$2`);

// Last Sync column cell to insert before Actions
const syncCell = `                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-xs text-slate-400">
                          {formatTimeAgo(repo.last_synced)}
                        </div>
                      </td>
`;

// Find and replace before Actions column
const actionsPattern = /(<\/div>\r?\n\s+<\/td>\r?\n)(\s+<td className="px-6 py-4">\r?\n\s+<button\r?\n\s+onClick=\{.*handleRemoveRepo)/;
content = content.replace(actionsPattern, `$1${syncCell}$2`);

// Update colSpan from 8 to 10
content = content.replace(/<td colSpan=\{8\}/g, '<td colSpan={10}');

fs.writeFileSync(filePath, content);
console.log('✅ Dashboard updated successfully!');
