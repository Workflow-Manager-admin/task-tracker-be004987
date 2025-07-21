/**
 * supabaseTodos.js
 *
 * Utility for CRUD operations on 'todos' table in Supabase.
 * Fields: id (uuid), text (string), completed (boolean), created_at (timestamp)
 * 
 * The exposed functions are:
 *  - fetchTodos
 *  - addTodo
 *  - updateTodo
 *  - deleteTodo
 *  - toggleTodoCompleted
 */

import { supabase } from './supabaseClient';

// PUBLIC_INTERFACE
/**
 * Fetch the list of todos for the current user/session.
 * @returns {Promise<{id: string, text: string, completed: boolean, created_at: string}[]>}
 */
export async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(todo => ({
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    dateCreated: todo.created_at,
  }));
}

// PUBLIC_INTERFACE
/**
 * Add a new todo entry to Supabase.
 * @param {string} text
 * @returns {Promise<Object>} The new todo item from backend
 */
export async function addTodo(text) {
  const { data, error } = await supabase
    .from('todos')
    .insert([
      { text, completed: false }
    ])
    .select()
    .limit(1)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    text: data.text,
    completed: data.completed,
    dateCreated: data.created_at,
  };
}

// PUBLIC_INTERFACE
/**
 * Update a todo's text.
 * @param {string} id
 * @param {string} newText
 * @returns {Promise<Object>}
 */
export async function updateTodo(id, newText) {
  const { data, error } = await supabase
    .from('todos')
    .update({ text: newText })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    text: data.text,
    completed: data.completed,
    dateCreated: data.created_at,
  };
}

// PUBLIC_INTERFACE
/**
 * Delete a todo by id.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteTodo(id) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// PUBLIC_INTERFACE
/**
 * Toggle the 'completed' state of a todo by id.
 * @param {string} id
 * @param {boolean} completed
 * @returns {Promise<Object>} Updated todo item
 */
export async function toggleTodoCompleted(id, completed) {
  const { data, error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    text: data.text,
    completed: data.completed,
    dateCreated: data.created_at,
  };
}
