# GitHub Copilot Instructions

This file provides custom instructions to GitHub Copilot when working in this repository.

## Project Context

**Project Name:** Overseer
**Description:** Meta-Repository Intelligence Layer
**Tech Stack:** TypeScript, React (TODO: Specify framework if applicable, e.g., Next.js), GraphQL (TODO: Confirm if GraphQL is used)

## Code Style & Conventions

### General Guidelines

- Follow existing code patterns and file structure.
- Maintain consistent naming conventions across the codebase.
- Write self-documenting code with clear variable and function names.
- Add comments only when the code's intent is not immediately clear.
- Use consistent indentation (2 spaces).
- Keep lines under 120 characters.

### Language-Specific Guidelines

- **TypeScript**:
    - Use strict mode (`strict: true` in `tsconfig.json`).
    - Prefer interfaces over types for object shapes where appropriate.
    - Use explicit types whenever possible.
    - Enforce immutability where appropriate (e.g., using `readonly` properties).
- **React**:
    - Use functional components with hooks.
    - Favor composition over inheritance.
    - Separate concerns into smaller, reusable components.
- **GraphQL (if applicable):**
    - Follow the GraphQL schema definition.
    - Handle errors gracefully.
    - Avoid over-fetching data.

### File Organization

- Keep files focused on a single responsibility.
- Use index files for barrel exports where appropriate.
- Place types in dedicated `types/` directory or co-located with implementation.
- Group related functionality in feature-specific directories.  Example: `src/components/RepoDetails/RepoDetails.tsx`, `src/components/RepoDetails/RepoDetails.test.tsx`, `src/components/RepoDetails/RepoDetails.types.ts`

## Architecture Patterns

### Component Structure

- Follow atomic design principles (atoms, molecules, organisms) where appropriate.
- Keep components small and composable.
- Extract shared logic into custom hooks.
- Use composition over prop drilling.

### Data Flow

- Use server components for data fetching when possible (if using Next.js or similar).
- Implement proper error boundaries.
- Handle loading states consistently.
- Use optimistic updates for better UX where appropriate.

### API Design (if applicable)

- RESTful or GraphQL endpoints with consistent naming.
- Validate all inputs at the API boundary.
- Return appropriate HTTP status codes.
- Include proper error messages and context.

## Testing Strategy

- Write unit tests for utility functions and helpers.
- Write integration tests for API endpoints/GraphQL resolvers (if applicable).
- Write E2E tests for critical user flows.
- Aim for >80% code coverage.
- Use Jest for unit and integration testing. (TODO: Confirm testing framework)

## Security Considerations

- Never commit secrets, API keys, or credentials.
- Validate and sanitize all user inputs.
- Use environment variables for configuration.
- Implement proper authentication and authorization (TODO: Specify auth mechanism).
- Follow OWASP security best practices.

## Performance Guidelines

- Optimize database queries (use indexes, avoid N+1 queries) (TODO: Specify database if applicable).
- Implement proper caching strategies.
- Use code splitting and lazy loading.
- Optimize images and assets.
- Monitor bundle size and runtime performance.

## Documentation Requirements

- Update README.md when adding new features or changing setup.
- Document complex algorithms or business logic.
- Keep API documentation in sync with implementation (if applicable).
- Update CHANGELOG.md for notable changes.

## Commit Conventions

- Use Conventional Commits format: `type(scope): description`
    - `feat`: A new feature
    - `fix`: A bug fix
    - `chore`: Routine tasks, build process, or auxiliary tools changes
    - `docs`: Documentation only changes
    - `style`: Code style changes (formatting, missing semicolons, etc.)
    - `refactor`: Code changes that neither adds a feature nor fixes a bug
    - `perf`: Code changes that improve performance
    - `test`: Adding missing tests or correcting existing tests
    - `build`: Changes that affect the build system or external dependencies
    - `ci`: Changes to CI configuration files and scripts
- Example: `feat(repo-details): Add repository description to details view`

## Common Pitfalls to Avoid

- Don't use `any` type in TypeScript.  Use more specific types.
- Don't bypass TypeScript errors with `@ts-ignore`. Investigate and fix the underlying issue.
- Don't commit `console.log` statements. Use a proper logging mechanism if needed.
- Don't hardcode configuration values. Use environment variables.
- Don't skip error handling.
- Don't mix async/await with promise chains unnecessarily.  Prefer one or the other.

## Preferred Libraries & Tools

- React (with hooks)
- TypeScript
- Jest (TODO: Confirm testing framework)
- ESLint, Prettier (for linting and formatting)
- (TODO: Add other preferred libraries/tools and reasoning)

## Additional Context

- (TODO: Any project-specific quirks or special considerations)
- (TODO: Links to relevant documentation or ADRs)
- (TODO: Team conventions or preferences)

## Examples

### Good

```typescript
// types/repo.ts
export interface Repo {
  id: string;
  name: string;
  description: string;
}

// src/components/RepoDetails.tsx
interface RepoDetailsProps {
  repo: Repo;
}

const RepoDetails: React.FC<RepoDetailsProps> = ({ repo }) => {
  return (
    <div>
      <h2>{repo.name}</h2>
      <p>{repo.description}</p>
    </div>
  );
};

export default RepoDetails;
```

### Bad

```typescript
// src/components/RepoDetails.tsx
const RepoDetails = (props: any) => { // Avoid 'any' type
  return (
    <div>
      <h2>{props.repo.name}</h2>
      <p>{props.repo.description}</p>
      <button onClick={() => { console.log("clicked"); }}>Click me</button> // Avoid console.log
    </div>
  );
};

export default RepoDetails;
```

---

**Note:** These instructions help GitHub Copilot provide more relevant and consistent suggestions. Update this file as project conventions evolve.