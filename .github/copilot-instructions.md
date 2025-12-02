# GitHub Copilot Instructions

This file provides custom instructions to GitHub Copilot when working in this repository.

## Project Context

**Project Name:** Overseer
**Description:** Meta-Repository Intelligence Layer
**Tech Stack:** TypeScript, React (TODO: More specific libraries and frameworks)

## Code Style & Conventions

### General Guidelines

- Follow existing code patterns and file structure.
- Maintain consistent naming conventions (e.g., camelCase for variables, PascalCase for components).
- Write self-documenting code. Use comments sparingly, focusing on explaining "why" over "what."
- Prefer functional programming paradigms where appropriate.

### Language-Specific Guidelines

- **TypeScript**:
    - Use strict mode (`strict: true` in `tsconfig.json`).
    - Prefer `const` over `let` when the variable will not be reassigned.
    - Utilize type inference effectively, but be explicit when necessary for clarity.
    - Use interfaces to define object shapes.
    - Avoid `any` type - prefer specific types or generics.
- **React**:
    - Use functional components with hooks.
    - Separate UI components from data fetching logic.
    - Favor controlled components.
    - Use descriptive prop names.

### File Organization

- Keep files focused on a single responsibility.
- Use `index.ts` files for barrel exports to simplify imports.
- Place types in dedicated `types/` directory or co-located with the related implementation file (e.g., `component.types.ts`).
- Group related functionality in feature-specific directories (e.g., `src/components/dashboard`).

### Commit Conventions

- Use conventional commits (e.g., `feat: add new feature`, `fix: correct a bug`, `chore: update dependencies`).
- Keep commit messages concise and informative.
- Reference relevant issues in commit messages (e.g., `Fixes #123`).

## Architecture Patterns

### Component Structure

- Follow atomic design principles (atoms, molecules, organisms).
- Keep components small, composable, and reusable.
- Extract shared logic into custom hooks.
- Use composition over inheritance or prop drilling.

### Data Flow

- Favor server-side data fetching where appropriate (e.g., using Next.js server components).
- Implement proper error boundaries to catch and handle errors gracefully.
- Handle loading states consistently using a loading indicator.
- Consider optimistic updates for improved user experience.

### API Design

- RESTful endpoints with consistent naming conventions.
- Validate all inputs at the API boundary.
- Return appropriate HTTP status codes (e.g., 200, 201, 400, 404, 500).
- Include informative error messages and context in API responses.

## Testing Strategy

- Write unit tests for individual functions and components.
- Write integration tests for API endpoints and complex interactions.
- Write end-to-end (E2E) tests for critical user flows.
- Aim for high test coverage (e.g., >80%).
- Use mocking to isolate units under test and avoid external dependencies.

## Security Considerations

- Never commit secrets, API keys, or credentials to the repository.
- Validate and sanitize all user inputs to prevent injection attacks.
- Use environment variables for configuration and sensitive data.
- Implement proper authentication and authorization mechanisms.
- Follow OWASP security best practices.

## Performance Guidelines

- Optimize database queries by using indexes and avoiding N+1 queries.
- Implement caching strategies to reduce server load and improve response times.
- Use code splitting and lazy loading to reduce initial bundle size.
- Optimize images and assets for faster loading.
- Monitor bundle size and runtime performance using performance monitoring tools.

## Documentation Requirements

- Update `README.md` when adding new features or changing setup instructions.
- Document complex algorithms or business logic with clear explanations.
- Keep API documentation in sync with implementation using tools like Swagger or OpenAPI.
- Update `CHANGELOG.md` for notable changes in each release.

## Common Pitfalls to Avoid

- **TypeScript**:
    - Don't use `any` type without a very good reason.
    - Don't bypass TypeScript errors with `@ts-ignore` without understanding the underlying issue and documenting why it's necessary.
- **General**:
    - Don't commit `console.log` statements.
    - Don't hardcode configuration values.
    - Don't skip error handling.
    - Don't mix `async/await` with promise chains unnecessarily.
    - Avoid deeply nested conditional statements.
    - Don't introduce unnecessary complexity.

## Preferred Libraries & Tools

- TODO: List preferred libraries for common tasks (e.g., state management, HTTP requests, UI framework) and explain the reasoning behind their selection.

## Examples

### Good:

```typescript
// Component using functional component and hooks
const MyComponent: React.FC<{ name: string }> = ({ name }) => {
  const [count, setCount] = useState(0);

  return (
    <div>
      Hello, {name}! Count: {count}
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

### Bad:

```typescript
// Component using class component (avoid)
class MyComponent extends React.Component<{ name: string }> {
  constructor(props: { name: string }) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return (
      <div>
        Hello, {this.props.name}! Count: {this.state.count}
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>Increment</button>
      </div>
    );
  }
}
```

### Good:

```typescript
// Explicit type definition for clarity
interface User {
  id: string;
  name: string;
  email: string;
}
```

### Bad:

```typescript
// Avoid using 'any'
const user: any = { id: "123", name: "John Doe", email: "john@example.com" };
```

## Additional Context

- TODO: Any project-specific quirks or special considerations.
- TODO: Links to relevant documentation or ADRs.
- TODO: Team conventions or preferences.

---

**Note:** These instructions help GitHub Copilot provide more relevant and consistent suggestions. Update this file as project conventions evolve.