import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatItem, Message, GroupMember, WebSocketMessage } from '../api/chat/types';

export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSING: 'closing',
  CLOSED: 'closed',
  UNKNOWN: 'unknown'
} as const;

type ConnectionState = typeof CONNECTION_STATES[keyof typeof CONNECTION_STATES];
export const WS_EVENTS = {
  CONNECTED: 'connected',
  MESSAGE: 'message',
  READ_RECEIPT: 'read_receipt',
  ERROR: 'error',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
  TYPING: 'typing',
  ACTIVE_CHAT_SET: 'active_chat_set',
  ACTIVE_CHAT_CLEARED: 'active_chat_cleared'
} as const;

export interface TypingUser {
  user_id: number;
  username: string;
  is_typing: boolean;
  timeout?: NodeJS.Timeout;
}

export interface ChatState {
  activeGroupId: number | null;
  activeGroupTitle: string;
  
  messages: Record<number, Message[]>;
  loadingMessages: Record<number, boolean>;
  hasMoreMessages: Record<number, boolean>;
  
  chats: ChatItem[];
  chatsLoading: boolean;
  
  unreadCountOverrides: Record<number, number>;
  
  groupMembers: Record<number, GroupMember[]>;
  
  typingUsers: Record<number, TypingUser[]>;
  
  wsConnected: boolean;
  wsConnectionState: ConnectionState;
  
  messageInput: string;
  isTyping: boolean;
  uploadingFile: boolean;
}

type SetActiveGroupPayload = { groupId: number; title: string };
type SetMessagesPayload = { groupId: number; messages: Message[]; hasMore: boolean };
type AddMessagesPayload = { groupId: number; messages: Message[] };
type AddMessagePayload = { groupId: number; message: Message };
type UpdateMessagePayload = { groupId: number; messageId: number; text: string; editedAt: string };
type DeleteMessagePayload = { groupId: number; messageId: number };
type SetLoadingMessagesPayload = { groupId: number; loading: boolean };
type SetGroupMembersPayload = { groupId: number; members: GroupMember[] };
type SetTypingUserPayload = { groupId: number; user: TypingUser };
type RemoveTypingUserPayload = { groupId: number; userId: number };
type AddReadReceiptPayload = { groupId: number; messageId: number; readerId: number };

const initialState: ChatState = {
  activeGroupId: null,
  activeGroupTitle: '',
  messages: {},
  loadingMessages: {},
  hasMoreMessages: {},
  chats: [],
  chatsLoading: false,
  unreadCountOverrides: {},
  groupMembers: {},
  typingUsers: {},
  wsConnected: false,
  wsConnectionState: CONNECTION_STATES.DISCONNECTED,
  messageInput: '',
  isTyping: false,
  uploadingFile: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveGroup: (state, action: PayloadAction<SetActiveGroupPayload>) => {
      const { groupId, title } = action.payload;
      state.activeGroupId = groupId;
      state.activeGroupTitle = title;
    },
    
    clearActiveGroup: (state) => {
      state.activeGroupId = null;
      state.activeGroupTitle = '';
    },
    
    setMessages: (state, action: PayloadAction<SetMessagesPayload>) => {
      const { groupId, messages, hasMore } = action.payload;
      
      // Сохраняем существующие сообщения для сохранения статуса прочитанных
      const existingMessages = state.messages[groupId] || [];
      
      // Создаем Map существующих сообщений для быстрого доступа
      const existingMessageMap = new Map(existingMessages.map(msg => [msg.id, msg]));
      
      // Обновляем сообщения, сохраняя read_by и is_read статусы
      const updatedMessages = messages.map(newMessage => {
        const existingMessage = existingMessageMap.get(newMessage.id);
        if (existingMessage) {
          // Сохраняем read_by массив и is_read статус из существующего сообщения
          return {
            ...newMessage,
            read_by: existingMessage.read_by || newMessage.read_by,
            is_read: existingMessage.is_read !== undefined ? existingMessage.is_read : newMessage.is_read,
          };
        }
        return newMessage;
      });
      
      state.messages[groupId] = updatedMessages;
      state.hasMoreMessages[groupId] = hasMore;
      state.loadingMessages[groupId] = false;
    },

    clearMessages: (state, action: PayloadAction<number>) => {
      const groupId = action.payload;
      state.messages[groupId] = [];
      state.hasMoreMessages[groupId] = false;
      state.loadingMessages[groupId] = false;
    },
    
    addMessages: (state, action: PayloadAction<AddMessagesPayload>) => {
      const { groupId, messages } = action.payload;
      if (!state.messages[groupId]) {
        state.messages[groupId] = [];
      }
      state.messages[groupId].unshift(...messages);
    },
    
    addMessage: (state, action: PayloadAction<AddMessagePayload>) => {
      const { groupId, message } = action.payload;
      console.log('[chatSlice] addMessage called:', { groupId, messageId: message.id, text: message.text });

      if (!state.messages[groupId]) {
        state.messages[groupId] = [];
        console.log('[chatSlice] Created new messages array for groupId:', groupId);
      }

      const existingMessageIndex = state.messages[groupId].findIndex(
        msg => msg.id === message.id
      );

      if (existingMessageIndex === -1) {
        state.messages[groupId].push(message);
        console.log('[chatSlice] Added new message. Total messages:', state.messages[groupId].length);
      } else {
        state.messages[groupId][existingMessageIndex] = message;
        console.log('[chatSlice] Updated existing message at index:', existingMessageIndex);
      }

      const chatIndex = state.chats.findIndex(chat => chat.group_id === groupId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].last_message = message;

        if (message.user_id && state.chats[chatIndex].unread_count > 0) {
        }
      }

      console.log('[chatSlice] Messages for groupId', groupId, ':', state.messages[groupId]);
    },

    addIncomingMessage: (state, action: PayloadAction<{ groupId: number; message: Message; currentUserId: number }>) => {
      const { groupId, message, currentUserId } = action.payload;
      if (!state.messages[groupId]) {
        state.messages[groupId] = [];
      }
      
      const existingMessageIndex = state.messages[groupId].findIndex(
        msg => msg.id === message.id
      );
      
      if (existingMessageIndex === -1) {
        state.messages[groupId].push(message);
      } else {
        state.messages[groupId][existingMessageIndex] = message;
      }
      
      const chatIndex = state.chats.findIndex(chat => chat.group_id === groupId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].last_message = message;
        
        if (message.user_id !== currentUserId) {
          state.chats[chatIndex].unread_count = (state.chats[chatIndex].unread_count || 0) + 1;
        } else {
        }
      }
    },
    
    updateMessage: (state, action: PayloadAction<UpdateMessagePayload>) => {
      const { groupId, messageId, text, editedAt } = action.payload;
      const message = state.messages[groupId]?.find(m => m.id === messageId);
      if (message) {
        message.text = text;
        message.edited_at = editedAt;
      }
    },
    
    deleteMessage: (state, action: PayloadAction<DeleteMessagePayload>) => {
      const { groupId, messageId } = action.payload;
      const message = state.messages[groupId]?.find(m => m.id === messageId);
      if (message) {
        message.is_deleted = true;
        message.text = 'Message deleted';
      }
    },
    
    setLoadingMessages: (state, action: PayloadAction<SetLoadingMessagesPayload>) => {
      state.loadingMessages[action.payload.groupId] = action.payload.loading;
    },
    
    setChats: (state, action: PayloadAction<ChatItem[]>) => {
      state.chats = action.payload;
      state.chatsLoading = false;
    },
    
    setChatsLoading: (state, action: PayloadAction<boolean>) => {
      state.chatsLoading = action.payload;
    },
    
    
    setGroupMembers: (state, action: PayloadAction<SetGroupMembersPayload>) => {
      state.groupMembers[action.payload.groupId] = action.payload.members;
    },
    
    setTypingUser: (state, action: PayloadAction<SetTypingUserPayload>) => {
      const { groupId, user } = action.payload;
      if (!state.typingUsers[groupId]) {
        state.typingUsers[groupId] = [];
      }
      
      state.typingUsers[groupId] = state.typingUsers[groupId].filter(
        u => u.user_id !== user.user_id
      );
      
      if (user.is_typing) {
        state.typingUsers[groupId].push(user);
        
        if (user.timeout) {
          clearTimeout(user.timeout);
        }
        user.timeout = setTimeout(() => {
        }, 3000);
      }
    },
    
    removeTypingUser: (state, action: PayloadAction<RemoveTypingUserPayload>) => {
      const { groupId, userId } = action.payload;
      if (state.typingUsers[groupId]) {
        state.typingUsers[groupId] = state.typingUsers[groupId].filter(
          u => u.user_id !== userId
        );
      }
    },
    
    updateMessageReadStatus: (state, action: PayloadAction<AddReadReceiptPayload>) => {
      const { groupId, messageId, readerId } = action.payload;
      
      // Find and update the message in the messages array
      const message = state.messages[groupId]?.find(m => m.id === messageId);
      if (message) {
        if (!message.read_by) {
          message.read_by = [];
        }
        if (!message.read_by.includes(readerId)) {
          message.read_by.push(readerId);
        }
      }
    },
    
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
    },
    
    setWsConnectionState: (state, action: PayloadAction<ConnectionState>) => {
      state.wsConnectionState = action.payload;
    },
    
    setMessageInput: (state, action: PayloadAction<string>) => {
      state.messageInput = action.payload;
    },
    
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    
    setUploadingFile: (state, action: PayloadAction<boolean>) => {
      state.uploadingFile = action.payload;
    },
    
    handleWebSocketMessage: (state, action: PayloadAction<unknown>) => {
      const payload = action.payload;

      if (payload && typeof payload === 'object' && 'event' in payload) {
        const backendPayload = payload as { event: string; [key: string]: unknown };

        switch (backendPayload.event) {
          case WS_EVENTS.CONNECTED:
            state.wsConnected = true;
            state.wsConnectionState = CONNECTION_STATES.CONNECTED;
            break;

          case WS_EVENTS.MESSAGE: {
            const msg = (backendPayload as { message?: Message }).message;
            console.log('[chatSlice] Received MESSAGE event:', msg);

            if (!msg || typeof msg.group_id !== 'number') {
              console.log('[chatSlice] MESSAGE event: invalid message data');
              break;
            }

            const groupId = msg.group_id;
            if (!state.messages[groupId]) {
              state.messages[groupId] = [];
            }

            // Mark message as delivered when received
            msg.delivered = true;

            const existingMessageIndex = state.messages[groupId].findIndex(
              m => m.id === msg.id
            );

            console.log('[chatSlice] MESSAGE event: existingMessageIndex =', existingMessageIndex, 'msg.id =', msg.id);

            if (existingMessageIndex === -1) {
              state.messages[groupId].push(msg);
              console.log('[chatSlice] MESSAGE event: added new message');
            } else {
              state.messages[groupId][existingMessageIndex] = msg;
              console.log('[chatSlice] MESSAGE event: replaced existing message (optimistic -> real)');
            }

            const chatIndex = state.chats.findIndex(chat => chat.group_id === groupId);
            if (chatIndex !== -1) {
              state.chats[chatIndex].last_message = msg;

              // Increment unread count if message is not from current user
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              if (msg.user_id !== currentUser.id) {
                state.chats[chatIndex].unread_count += 1;
              }
            }
            break;
          }

          case 'message_status': {
            // Обрабатываем статус сообщения от бэкенда
            const messageData = backendPayload as unknown as { message_id: number; status: string };
            console.log('[chatSlice] Received message_status:', messageData);

            if (messageData.status === 'sent' && messageData.message_id) {
              // Сообщение отправлено успешно, нужно загрузить его через API
              // Это будет обработано в компоненте через refetch
              console.log('[chatSlice] Message sent, ID:', messageData.message_id);
            }
            break;
          }

          case WS_EVENTS.READ_RECEIPT: {
            const receipt = backendPayload as unknown as { group_id: number; reader_id: number; last_read_message_id: number };
            
            // Mark all messages up to last_read_message_id as read by reader_id
            if (!state.messages[receipt.group_id]) {
              break;
            }
            
            state.messages[receipt.group_id].forEach(message => {
              if (message.id <= receipt.last_read_message_id) {
                // Update read_by array for compatibility
                if (!message.read_by) {
                  message.read_by = [];
                }
                if (!message.read_by.includes(receipt.reader_id)) {
                  message.read_by.push(receipt.reader_id);
                }
                
                // Update is_read field for real-time UI updates
                if (message.user_id !== receipt.reader_id) {
                  message.is_read = true;
                }
              }
            });
            
            // Update unread count in chat list if this is the current user reading
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (receipt.reader_id === currentUser.id) {
              const chatIndex = state.chats.findIndex(chat => chat.group_id === receipt.group_id);
              if (chatIndex !== -1) {
                state.chats[chatIndex].unread_count = 0;
              }
            }
            
            break;
          }

          case WS_EVENTS.ERROR:
            state.wsConnected = false;
            state.wsConnectionState = CONNECTION_STATES.DISCONNECTED;
            break;

          case WS_EVENTS.ACTIVE_CHAT_SET:
            // This event confirms that the chat was set as active on the backend
            // The read receipt will be handled separately via READ_RECEIPT event
            break;

          case WS_EVENTS.ACTIVE_CHAT_CLEARED:
            // This event is sent when user leaves chat
            // No specific action needed - backend handles clearing active chat
            break;
        }

        return;
      }

      const message = payload as WebSocketMessage;
      switch (message.type) {
        case WS_EVENTS.MESSAGE:
          if (message.data && message.group_id) {
            if (!state.messages[message.group_id]) {
              state.messages[message.group_id] = [];
            }
            
            const msg = message.data as Message;
            
            // Mark message as delivered when received
            msg.delivered = true;
            
            const existingMessageIndex = state.messages[message.group_id].findIndex(
              m => m.id === msg.id
            );
            
            if (existingMessageIndex === -1) {
              state.messages[message.group_id].push(msg);
            } else {
              state.messages[message.group_id][existingMessageIndex] = msg;
            }

            const chatIndex = state.chats.findIndex(chat => chat.group_id === message.group_id);
            if (chatIndex !== -1) {
              state.chats[chatIndex].last_message = msg;
            }
          }
          break;

        case WS_EVENTS.MESSAGE_EDITED:
          if (message.data && message.group_id) {
            const editedMessage = message.data as Message;
            const msg = state.messages[message.group_id]?.find(m => m.id === editedMessage.id);
            if (msg) {
              msg.text = editedMessage.text;
              msg.edited_at = editedMessage.edited_at;
            }
          }
          break;

        case WS_EVENTS.MESSAGE_DELETED:
          if (message.data && message.group_id) {
            const deletedMessage = message.data as Message;
            const msg = state.messages[message.group_id]?.find(m => m.id === deletedMessage.id);
            if (msg) {
              msg.is_deleted = true;
              msg.text = 'Message deleted';
            }
          }
          break;

        case WS_EVENTS.TYPING:
          if (message.data && message.group_id) {
            const typingData = message.data as TypingUser;
            if (!state.typingUsers[message.group_id]) {
              state.typingUsers[message.group_id] = [];
            }

            state.typingUsers[message.group_id] = state.typingUsers[message.group_id].filter(
              u => u.user_id !== typingData.user_id
            );

            if (typingData.is_typing) {
              state.typingUsers[message.group_id].push(typingData);
            }
          }
          break;
      }
    },

    resetUnreadCount: (state, action: PayloadAction<number>) => {
      const groupId = action.payload;
      
      delete state.unreadCountOverrides[groupId];
      
      const chatIndex = state.chats.findIndex(chat => chat.group_id === groupId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unread_count = 0;
      }
      
    },

    clearUnreadCountOverrides: (state) => {
      state.unreadCountOverrides = {};
    },
  },
});

export const {
  setActiveGroup,
  clearActiveGroup,
  setMessages,
  clearMessages,
  addMessages,
  addMessage,
  addIncomingMessage,
  updateMessage,
  deleteMessage,
  setLoadingMessages,
  setChats,
  setChatsLoading,
  setGroupMembers,
  setTypingUser,
  removeTypingUser,
  updateMessageReadStatus,
  setWsConnected,
  setWsConnectionState,
  setMessageInput,
  setIsTyping,
  setUploadingFile,
  handleWebSocketMessage,
  resetUnreadCount,
  clearUnreadCountOverrides,
} = chatSlice.actions;

export default chatSlice.reducer;
