```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Todo, TodoFilter, TodoStats, TodoFormData } from '@/types'
import { generateId } from '@/lib/utils'

interface TodoState {
  todos: Todo[]
  filter: TodoFilter
  stats: TodoStats
  selectedTodoId?: string
  
  // Actions
  addTodo: (data: TodoFormData) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  bulkDelete: (ids: string[]) => void
  bulkComplete: (ids: string[]) => void
  clearCompleted: () => void
  reorderTodos: (sourceIndex: number, destinationIndex: number) => void
  
  // Filter actions
  setFilter: (filter: Partial<TodoFilter>) => void
  resetFilter: () => void
  
  // Selection actions