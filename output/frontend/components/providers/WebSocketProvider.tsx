```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { useNotificationStore } from '@/store/notificationStore';
import { useReservationStore } from '@/store/reservationStore';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();
  const { updateReservation, removeReservation } = useReservationStore();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: {
        token: localStorage.getItem('auth_token'),
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('notification', (notification) => {
      addNot