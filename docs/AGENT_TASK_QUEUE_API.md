# Agent Task Queue API

Defines the contract for agent task submission and queueing.

## Endpoint

- **POST /api/agent/tasks**
  - Submit a new agent task to the queue.

### Request Body

```
{
  "type": "string",           // Task type identifier (required)
  "payload": { ... },           // Task-specific payload (required, object)
  "priority": "normal",        // Priority: low | normal | high (optional, default: normal)
  "meta": { ... }               // Optional metadata (object)
}
```

### Response
- **202 Accepted**
  - `{ task, status: 'accepted', queuedAt }`
- **400 Bad Request**
  - `{ error, details }`

### Notes
- Authentication and queue logic are TODOs for future implementation.
- This contract is subject to extension as agent orchestration matures.
