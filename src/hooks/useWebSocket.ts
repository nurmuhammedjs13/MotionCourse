import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  handleWebSocketMessage,
  setWsConnected,
  setWsConnectionState,
  resetUnreadCount,
  addMessage,
} from '@/redux/slices/chatSlice';
import { wsManager } from '@/services/websocket';
import { chatApi } from '@/redux/api/chat';
import { Message } from '@/redux/api/chat/types';

type SendTypingFn = (isTyping: boolean) => void;

export const useWebSocket = (groupId: number) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const isConnecting = useRef(false);
  const connectedOnce = useRef(false);
  const lastGroupId = useRef<number | null>(null);
  const messageIdCounter = useRef(0);
  
  useEffect(() => {
    // Если groupId не изменился, не переподключаемся
    if (lastGroupId.current === groupId && isConnecting.current) {
      return;
    }
    
    // Если groupId изменился, сбрасываем флаг подключения
    if (lastGroupId.current !== groupId) {
      isConnecting.current = false;
      lastGroupId.current = groupId;
    }
    
    if (isConnecting.current) {
      return;
    }

    let cancelled = false;
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1] || '';

    isConnecting.current = true;
    dispatch(setWsConnectionState('connecting'));
    
    wsManager.connect(groupId, token)
      .then(() => {
        if (cancelled) {
          return;
        }
      })
      .then(() => {
        if (!cancelled) {
          connectedOnce.current = true;
          
          // Отправляем set_active_chat сразу после подключения
          wsManager.sendMessage({ action: 'set_active_chat', group_id: groupId });
          
          dispatch(setWsConnected(true));
          dispatch(setWsConnectionState('connected'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch(setWsConnected(false));
          dispatch(setWsConnectionState('disconnected'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          isConnecting.current = false;
        }
      });
    
    wsManager.setMessageHandler((data) => {
      console.log('[WebSocket] Received raw data:', data);

      if (data && typeof data === 'object' && 'type' in data) {
        const messageData = data as { type: string; status?: string };
        if (messageData.type === 'connection_status' && messageData.status === 'connected_via_http') {
          dispatch(setWsConnected(true));
          dispatch(setWsConnectionState('connected'));
          return;
        }
      }

      // Проверяем на message_status для перезагрузки сообщений
      if (data && typeof data === 'object' && 'event' in data) {
        const eventData = data as { event: string; message_id?: number; status?: string };
        console.log('[WebSocket] Received event:', eventData.event, eventData);

        if (eventData.event === 'message_status' && eventData.status === 'sent' && eventData.message_id) {
          console.log('[WebSocket] Message sent, refetching messages');
          // Перезагружаем сообщения чтобы получить реальное сообщение от сервера
          setTimeout(() => {
            dispatch(chatApi.endpoints.getMessages.initiate({ groupId, limit: 50 }, { forceRefetch: true }));
          }, 500);
        }
      }

      dispatch(handleWebSocketMessage(data));
    });
    
    return () => {
      cancelled = true;

      if (connectedOnce.current) {
        // Send clear_active_chat before disconnecting
        if (wsManager.isConnected()) {
          wsManager.sendMessage({ action: 'clear_active_chat' });
        }
        wsManager.disconnect();
      }

      isConnecting.current = false;
      dispatch(setWsConnected(false));
      dispatch(setWsConnectionState('disconnected'));
    };
  }, [groupId, dispatch]);

  const sendMessage = useCallback(async (text: string, fileUrl?: string, fileType?: string) => {
    try {
      // Не отправляем пустые сообщения без файлов
      if (!text.trim() && !fileUrl) {
        console.log('[WebSocket] Skipping empty message');
        return;
      }

      const payload: Record<string, unknown> = {
        group_id: groupId,
        text,
      };

      if (fileUrl) payload.file_url = fileUrl;
      if (fileType) payload.file_type = fileType;

      console.log('[WebSocket] Sending message:', { text, fileUrl, fileType, groupId });

      // Создаем оптимистичное сообщение с временным ID
      const tempId = --messageIdCounter.current;
      const optimisticMessage: Message = {
        id: tempId,
        text,
        user_id: user.id || 0,
        group_id: groupId,
        created_date: new Date().toISOString(),
        file_url: fileUrl,
        file_type: fileType,
        is_deleted: false,
        edited_at: null,
        delivered: false,
      };

      console.log('[WebSocket] Adding optimistic message:', optimisticMessage);

      // Добавляем оптимистичное сообщение в Redux state
      dispatch(addMessage({ groupId, message: optimisticMessage }));

      // Отправляем через WebSocket
      wsManager.sendMessage(payload);
      dispatch(resetUnreadCount(groupId));

      // Не перезагружаем через HTTP API, так как бэкенд изменил логику WebSocket
      // Оптимистичное сообщение должно быть заменено реальным через WebSocket
      // Если WebSocket не работает, сообщение останется оптимистичным
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
    }
  }, [groupId, dispatch, user]);

  const sendTyping: SendTypingFn = useCallback(() => {
    return;
  }, []);

  return {
    sendMessage,
    sendTyping,
    isConnected: wsManager.isConnected()
  };
};
