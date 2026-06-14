'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMyChatsQuery, useGetGroupDetailFullQuery, useDeleteGroupMutation, useDeleteDialogForSelfMutation } from '../../../../../redux/api/chat';
import { setActiveGroup, resetUnreadCount, clearUnreadCountOverrides } from '../../../../../redux/slices/chatSlice';
import { RootState } from '../../../../../redux/store';
import { ChatItem } from '../../../../../redux/api/chat/types';
  import styles from './ChatList.module.scss';

interface ChatListProps {
  onSelectChat: (groupId: number, title: string) => void;
  activeGroupId: number;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, activeGroupId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { unreadCountOverrides } = useSelector((state: RootState) => state.chat);
  const { data: chats = [], isLoading, error } = useGetMyChatsQuery();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [deleteGroup] = useDeleteGroupMutation();
  const [deleteDialogForSelf] = useDeleteDialogForSelfMutation();
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; chatId: number | null; chatTitle: string }>({
    isOpen: false,
    chatId: null,
    chatTitle: ''
  });

  useEffect(() => {
    if (!user.id || !user.username) return;
    
    const userKey = `unreadCountOverrides_user_${user.id}`;
    const savedOverrides = localStorage.getItem(userKey);
    
    if (savedOverrides) {
      try {
        const overrides = JSON.parse(savedOverrides);
        
        Object.entries(overrides).forEach(([groupId, count]) => {
          dispatch(resetUnreadCount(Number(groupId)));
        });
      } catch (error) {
      }
    } else {
    }
  }, [user.id, user.username, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearUnreadCountOverrides());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!user.id || Object.keys(unreadCountOverrides).length === 0) return;
    
    const storageKey = `unreadCountOverrides_user_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(unreadCountOverrides));
  }, [unreadCountOverrides, user.id]);

  const formatChatTitle = (title: string) => {
    if (title.startsWith('course:')) {
      return title.replace('course:', 'группа:');
    }
    return title;
  };

  const UserNameResolver: React.FC<{ chat: ChatItem; children: (name: string) => React.ReactNode }> = ({ chat, children }) => {
    const { data: groupDetail } = useGetGroupDetailFullQuery(chat.group_id, { 
      skip: !chat.is_private 
    });
    
    const getUserName = () => {
      if (chat.title.startsWith('dialog_') && chat.is_private) {
        const parts = chat.title.split('_');
        if (parts.length === 3) {
          const userId1 = parseInt(parts[1]);
          const userId2 = parseInt(parts[2]);
          const currentUserId = user.id;
          const partnerId = userId1 === currentUserId ? userId2 : userId1;
          
          if (groupDetail?.members) {
            const partner = groupDetail.members.find(member => member.user_id === partnerId);
            if (partner?.username) {
              return partner.username;
            }
          }
          
          return `Пользователь ${partnerId}`;
        }
      }
      
      return formatChatTitle(chat.title);
    };
    
    return <>{children(getUserName())}</>;
  };

  const chatsWithOverrides = chats.map(chat => ({
    ...chat,
    unread_count: unreadCountOverrides[chat.group_id] !== undefined 
      ? unreadCountOverrides[chat.group_id] 
      : chat.unread_count
  }));

  const filteredChats = chatsWithOverrides.filter(chat => {
    if (!user.chat_group_id) return true;
    
    
    const isGroupChat = chat.group_id === user.chat_group_id;
    const isPrivateChat = chat.title.startsWith('dialog_');
    
    return isGroupChat || isPrivateChat;
  });

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.last_message && b.last_message) {
      return new Date(b.last_message.created_date).getTime() - new Date(a.last_message.created_date).getTime();
    }
    
    if (a.last_message && !b.last_message) {
      return -1;
    }
    
    if (!a.last_message && b.last_message) {
      return 1;
    }
    
    return b.group_id - a.group_id;
  });

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
    }
  }, [sortedChats]);

  useEffect(() => {
    
    if (sortedChats.length > 0) {
    } else if (!isLoading && !error) {
    }
  }, [sortedChats, filteredChats, chats, isLoading, error, user.chat_group_id, user.course]);

  useEffect(() => {
    const interval = setInterval(() => {
      chats.forEach(chat => {
        const isOwnLastMessage = chat.last_message && chat.last_message.user_id === user.id;
        
        if (isOwnLastMessage && chat.unread_count > 0) {
          dispatch(resetUnreadCount(chat.group_id));
        }
      });
    }, 500); 

    return () => clearInterval(interval);
  }, [chats, user.id, dispatch]);

  useEffect(() => {
    chats.forEach(chat => {
    });
  }, [chats, unreadCountOverrides]);

  const handleSelectChat = (groupId: number, title: string) => {

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      localStorage.setItem('chatListScrollTop', scrollContainer.scrollTop.toString());
    }

    dispatch(setActiveGroup({ groupId, title }));
    onSelectChat(groupId, title);
  };

  const handleDeleteChat = (e: React.MouseEvent, chat: ChatItem) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      chatId: chat.group_id,
      chatTitle: chat.title
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.chatId) return;

    setDeletingChatId(deleteModal.chatId);

    try {
      const chat = sortedChats.find(c => c.group_id === deleteModal.chatId);
      if (!chat) return;

      if (chat.is_private) {
        await deleteDialogForSelf(chat.group_id).unwrap();
      } else {
        await deleteGroup(chat.group_id).unwrap();
      }

      if (activeGroupId === deleteModal.chatId) {
        const remainingChats = sortedChats.filter(c => c.group_id !== deleteModal.chatId);
        if (remainingChats.length > 0) {
          const nextChat = remainingChats[0];
          handleSelectChat(nextChat.group_id, nextChat.title);
        } else {
          dispatch(setActiveGroup({ groupId: 0, title: '' }));
        }
      }

      setDeleteModal({ isOpen: false, chatId: null, chatTitle: '' });
    } catch (error: unknown) {
      console.error('Failed to delete chat:', error);
      const err = error as { status?: number; data?: { detail?: string }; message?: string };
      console.error('Error status:', err?.status);
      console.error('Error data:', err?.data);
      alert(`Не удалось удалить чат: ${err?.data?.detail || err?.message || 'Неизвестная ошибка'}`);
    } finally {
      setDeletingChatId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, chatId: null, chatTitle: '' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      if (diffInMinutes < 1) {
        return 'только что';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} мин назад`;
      } else if (diffInHours < 12) {
        return `${diffInHours} ч назад`;
      } else {
        return date.toLocaleTimeString('ru-RU', { 
          timeZone: 'Asia/Bishkek',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    }
    
    if (diffInDays === 1) {
      return 'вчера';
    }
    
    if (diffInDays < 7) {
      return date.toLocaleDateString('ru-RU', { 
        timeZone: 'Asia/Bishkek',
        weekday: 'short' 
      });
    }
    
    return date.toLocaleDateString('ru-RU', { 
      timeZone: 'Asia/Bishkek',
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className={styles.chatList}>
        <div className={styles.header}>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Загрузка чатов...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chatList}>
       
        <div className={styles.error}>
          <span>Сервер чата временно недоступен</span>
          <p>Попробуйте позже или обратитесь к администратору</p>
          <button onClick={() => window.location.reload()}>
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatList}>
      <div className={styles.chatListHeader}>
        <h2>Чаты</h2>
      </div>

      <div className={styles.chatListContent} ref={scrollContainerRef}>
        {isLoading ? (
          <div className={styles.loading}>Загрузка чатов...</div>
        ) : sortedChats.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p>Чатов еще нет</p>
            <p>Начните диалог, чтобы увидеть его здесь</p>
          </div>
        ) : (
          <div className={styles.chatItems}>
            {sortedChats.map((chat) => {
              const isOwnLastMessage = chat.last_message && chat.last_message.user_id === user.id;
              
              const shouldShowBadge = chat.unread_count !== null && 
                                      chat.unread_count !== undefined && 
                                      typeof chat.unread_count === 'number' && 
                                      chat.unread_count > 0 && 
                                      !isOwnLastMessage;
              
              return (
                <UserNameResolver key={chat.group_id} chat={chat}>
                  {(displayName) => (
                    <div
                      className={`${styles.chatItem} ${activeGroupId === chat.group_id ? styles.active : ''}`}
                      onClick={() => handleSelectChat(chat.group_id, chat.title)}
                    >
                      <div className={styles.chatAvatar}>
                        <div className={styles.avatarPlaceholder}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        {chat.is_private && (
                          <div className={styles.privateIndicator}>🔒</div>
                        )}
                      </div>
                      
                      <div className={styles.chatInfo}>
                        <div className={styles.chatHeader}>
                          <h4 className={styles.chatTitle}>{displayName}</h4>
                          <div className={styles.chatHeaderRight}>
                            {chat.is_private && (
                              <button
                                className={styles.deleteButton}
                                onClick={(e) => handleDeleteChat(e, chat)}
                                disabled={deletingChatId === chat.group_id}
                                title="Удалить чат"
                              >
                                {deletingChatId === chat.group_id ? (
                                  <span className={styles.spinnerSmall}></span>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                )}
                              </button>
                            )}
                            <span className={styles.chatTime}>
                              {chat.last_message ? formatTime(chat.last_message.created_date) : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.chatPreview}>
                          <p className={styles.lastMessage}>
                            {chat.last_message && !chat.last_message.is_deleted ? (
                              <>
                                {chat.last_message.file_url || chat.last_message.attachments?.length ? (
                                  <>
                                    {chat.last_message.file_url?.includes('audio') ? (
                                      <span>🗣️</span>
                                    ) : (
                                      <span>📷</span>
                                    )}
                                    {chat.last_message.text ? chat.last_message.text : 'Фото'}
                                  </>
                                ) : chat.last_message.text || 'Сообщений еще нет'}
                              </>
                            ) : chat.last_message?.is_deleted ? (
                              'Сообщение удалено'
                            ) : (
                              'Сообщений еще нет'
                            )}
                          </p>
                          {shouldShowBadge && (
                            <div className={styles.unreadBadge}>
                              {Number(chat.unread_count) > 99 ? '99+' : chat.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </UserNameResolver>
              );
            })}
          </div>
        )}
      </div>

      {deleteModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Подтверждение удаления</h3>
              <p className={styles.modalMessage}>
                Вы уверены, что хотите удалить этот чат?
              </p>
              <div className={styles.modalButtons}>
                <button
                  className={styles.modalCancel}
                  onClick={cancelDelete}
                  disabled={deletingChatId !== null}
                >
                  Отмена
                </button>
                <button
                  className={styles.modalDelete}
                  onClick={confirmDelete}
                  disabled={deletingChatId !== null}
                >
                  {deletingChatId !== null ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
