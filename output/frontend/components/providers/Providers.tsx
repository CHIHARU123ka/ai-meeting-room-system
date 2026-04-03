```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query/devtools';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { AuthProvider } from './AuthProvider';
import { WebSocketProvider } from './WebSocketProvider';
import { NotificationProvider } from './NotificationProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error: any) => {
              if (error?.status