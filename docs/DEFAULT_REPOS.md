# Default Repositories Setup

This project includes three default repositories that are always synced and displayed on the dashboard:

1. **nitsuah/overseer** - This repository (the Overseer dashboard itself)
2. **Nitsuah-Labs/nitsuah-io** - The Nitsuah.io website
3. **nitsuah/pverseer** - The pverseer project

## How It Works

### Automatic Syncing
When you run the "Sync Repos" button or the sync function runs:
1. It syncs all your personal GitHub repos (if authenticated)
2. It syncs any custom repos you've added
3. **It always syncs the three default repos** listed above

This ensures these repos are always visible, even for visitors who aren't logged in.

### Manual Seeding
To manually seed just the default repos (useful for initial setup):

```bash
# Call the seed endpoint
curl -X POST http://localhost:3000/api/seed-defaults
```

Or visit the dashboard and click "Sync Repos" - it will include the default repos automatically.

## Configuration

The default repos are defined in `lib/default-repos.ts`. To add or remove default repos, edit that file:

```typescript
export const DEFAULT_REPOS = [
    {
        owner: 'nitsuah',
        name: 'overseer',
        fullName: 'nitsuah/overseer'
    },
    // Add more repos here...
];
```

## Benefits

- **Demo Content**: Visitors can see the dashboard in action without logging in
- **Portfolio**: Showcase your key projects
- **Always Up-to-Date**: Default repos sync automatically with every sync operation
