//
// todoModel.js
//
// PUBLIC_INTERFACE
/**
 * Represents a Todo item.
 * @typedef {Object} Todo
 * @property {string} id - Unique ID for each todo item.
 * @property {string} text - The text/description of the todo.
 * @property {boolean} completed - Completion status.
 * @property {string} dateCreated - ISO string timestamp for when the todo was created.
 */

/**
 * LOCAL STORAGE KEY for all todos.
 */
export const TODOS_LOCAL_STORAGE_KEY = 'todos';

/**
 * Generate a new Todo item.
 * @param {string} text
 * @returns {Todo}
 */
// PUBLIC_INTERFACE
export function createTodo(text) {
  return {
    id: generateId(),
    text,
    completed: false,
    dateCreated: new Date().toISOString(),
  };
}

/**
 * Save todos array to localStorage.
 * @param {Todo[]} todos
 */
export function saveTodosToLocal(todos) {
  window.localStorage.setItem(TODOS_LOCAL_STORAGE_KEY, JSON.stringify(todos));
}

/**
 * Load todos array from localStorage.
 * @returns {Todo[]}
 */
export function loadTodosFromLocal() {
  const data = window.localStorage.getItem(TODOS_LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Clear all todos from localStorage.
 */
export function clearTodosLocal() {
  window.localStorage.removeItem(TODOS_LOCAL_STORAGE_KEY);
}

/**
 * Generate a unique ID (can be swapped out for database-assigned IDs if/when backend is used).
 */
function generateId() {
  // Use crypto if available, fallback to random
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return (
    'todo_' +
    Math.random().toString(36).substr(2, 9) +
    '_' +
    Date.now().toString(36)
  );
}

/**
 * NOTES FOR FUTURE BACKEND INTEGRATION (API/Supabase):
 *
 * - The above functions are pure client-side. When integrating with a backend, replace the CRUD
 *   methods (createTodo, save/loadTodosToLocal, etc.) with API calls.
 * - Use environment variables (process.env.REACT_APP_API_URL, etc.) for base URLs and API keys.
 * - Supabase schema example (Postgres):
 *   Table: todos
 *   Columns:
 *   - id: uuid, primary key, default uuid_generate_v4()
 *   - text: text
 *   - completed: boolean
 *   - date_created: timestamp (default now())
 * - Toggle between local and remote storage using a config/environment switch (e.g. REACT_APP_USE_REMOTE_BACKEND=true).
 * - For Supabase: see their JS client for integration (`supabase-js`).
 * - Define any API endpoints in a separate `api.js` or similar module, handling fetch/axios etc.
 *
 * For now, always use localStorage for data persistence.
 */

