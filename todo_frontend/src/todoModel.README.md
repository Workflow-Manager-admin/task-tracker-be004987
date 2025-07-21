# Todo Local Data Model & Backend Integration Notes

## Local Data Model

This app uses a local client-side "table" of todo items, with the following fields:

- `id` (string): Unique identifier (UUID or string)
- `text` (string): Task content
- `completed` (boolean): True if task is done
- `dateCreated` (string): ISO timestamp when task was created

Data is persisted to `window.localStorage` (key: `'todos'`). 
All CRUD operations should use the exported functions from `todoModel.js` for consistent access.

## Example Usage

```js
import { createTodo, loadTodosFromLocal, saveTodosToLocal } from './todoModel'

// Create a new todo:
const newTodo = createTodo("Buy groceries");

// Load list of todos:
const todos = loadTodosFromLocal();

// Add, then save:
todos.push(newTodo);
saveTodosToLocal(todos);
```

## API/Backend/Supabase Integration Notes

- When connecting to an API or Supabase later, swap out load/save methods for async fetch/AJAX/API calls.
- **Environment Variables:** Define endpoints/API keys in `.env` as:
  - `REACT_APP_API_URL=https://api.example.com`
  - `REACT_APP_SUPABASE_URL=...`
  - `REACT_APP_SUPABASE_KEY=...`
  - `REACT_APP_USE_REMOTE_BACKEND=true`
- Toggling between local and backend methods can be handled using a config variable.
- Model/schema for backend (Postgres/Supabase) should match:
    - `id` (uuid, primary key)
    - `text` (text)
    - `completed` (boolean)
    - `date_created` (timestamp, default now())

For further integration, isolate backend access (API or Supabase) in a separate utility file (example: `api.js` or `supabase.js`).

