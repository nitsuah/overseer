// Upsert repo
const { data: repoData, error: repoError } = await supabase
    .from('repos')
    .upsert(
        {
            name: repo.name,
            full_name: repo.fullName,
            description: repo.description,
            language: repo.language,
            stars: repo.stars,
            forks: repo.forks,
            open_issues: repo.openIssues,
            url: repo.url,
            homepage: repo.homepage,
            topics: repo.topics,
            last_synced: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'name' }
    )
    .select()
    .single();

if (repoError) {
    console.error(`Error upserting repo ${repo.name}:`, repoError);
    continue;
}

const repoId = repoData.id;

// Fetch branches count
const branches = await github.getBranches(repo.name);
await supabase
    .from('repos')
    .update({ branches_count: branches.length })
    .eq('id', repoId);

// Parse ROADMAP.md
const roadmapContent = await github.getFileContent(repo.name, 'ROADMAP.md');
if (roadmapContent) {
    const roadmapData = parseRoadmap(roadmapContent);

    // Delete existing roadmap items
    await supabase.from('roadmap_items').delete().eq('repo_id', repoId);

    // Insert new roadmap items
    for (const item of roadmapData.items) {
        await supabase.from('roadmap_items').insert({
            repo_id: repoId,
            title: item.title,
            quarter: item.quarter,
            status: item.status,
            priority: roadmapData.frontmatter.priority || null,
        });
    }

    // Update doc status
    await supabase.from('doc_status').upsert(
        {
            repo_id: repoId,
            doc_type: 'roadmap',
            exists: true,
            last_checked: new Date().toISOString(),
        },
        { onConflict: 'repo_id,doc_type' }
    );
}

// Parse TASKS.md
const tasksContent = await github.getFileContent(repo.name, 'TASKS.md');
if (tasksContent) {
    const tasksData = parseTasks(tasksContent);

    // Delete existing tasks
    await supabase.from('tasks').delete().eq('repo_id', repoId);

    // Insert new tasks
    for (const task of tasksData.tasks) {
        await supabase.from('tasks').insert({
            repo_id: repoId,
            task_id: task.id,
            title: task.title,
            status: task.status,
            section: task.section,
        });
    }

    // Update doc status
    await supabase.from('doc_status').upsert(
        {
            repo_id: repoId,
            doc_type: 'tasks',
            exists: true,
            last_checked: new Date().toISOString(),
        },
        { onConflict: 'repo_id,doc_type' }
    );
}

// Parse METRICS.md
const metricsContent = await github.getFileContent(repo.name, 'METRICS.md');
if (metricsContent) {
    const metricsData = parseMetrics(metricsContent);

    // Insert metrics (keep historical data)
    for (const metric of metricsData.metrics) {
        await supabase.from('metrics').insert({
            repo_id: repoId,
            metric_name: metric.name,
            value: metric.value,
            unit: metric.unit,
            timestamp: new Date().toISOString(),
        });
    }

    // Update doc status
    await supabase.from('doc_status').upsert(
        {
            repo_id: repoId,
            doc_type: 'metrics',
            exists: true,
            last_checked: new Date().toISOString(),
        },
        { onConflict: 'repo_id,doc_type' }
    );
}

// Check for other docs
const docTypes = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
for (const docFile of docTypes) {
    const content = await github.getFileContent(repo.name, docFile);
    const docType = docFile.replace('.md', '').toLowerCase() as 'readme' | 'changelog' | 'contributing';

    await supabase.from('doc_status').upsert(
        {
            repo_id: repoId,
            doc_type: docType,
            exists: content !== null,
            last_checked: new Date().toISOString(),
        },
        { onConflict: 'repo_id,doc_type' }
    );
}
        }

return {
    statusCode: 200,
    body: JSON.stringify({ success: true, count: repos.length }),
};
    } catch (error: any) {
    console.error('Sync error:', error);
    return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
    };
}
};
