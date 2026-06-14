'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useGetMessagesQuery, useGetGroupDetailFullQuery, useEditMessageMutation, useDeleteMessageMutation, useMarkAsReadMutation } from '@/redux/api/chat';
import ImageModal from '@/components/ImageModal/ImageModal';
import VoicePlayer from '@/components/VoicePlayer/VoicePlayer';
import MessageStatus from './MessageStatus';
import styles from './MessageList.module.scss';
import { Message } from '../../../../../redux/api/chat/types';

interface MessageListProps {
  groupId: number;
  onScrollStateChange?: (isAtBottom: boolean) => void;
}

const MessageList: React.FC<MessageListProps> = ({ groupId, onScrollStateChange }) => {
  const dispatch = useDispatch();
  const { messages } = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.user);
  
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; alt: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMarkedMessageIdRef = useRef<number | null>(null); // Отслеживаем последнее отмеченное сообщение

  const {
    data: messagesData,
    isLoading,
    isFetching,
    error,
  } = useGetMessagesQuery(
    { groupId, limit: 50 },
    {
      skip: !groupId,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: groupDetail } = useGetGroupDetailFullQuery(groupId, {
    skip: !groupId,
  });

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (groupDetail?.members) {
      dispatch({
        type: 'chat/setGroupMembers',
        payload: {
          groupId,
          members: groupDetail.members
        }
      });
    }
  }, [groupDetail, groupId, dispatch]);

  useEffect(() => {
   
    
    if (messagesData) {
      dispatch({
        type: 'chat/setMessages',
        payload: {
          groupId,
          messages: messagesData.items,
          hasMore: messagesData.has_more,
        },
      });
    }
  }, [messagesData, groupId, dispatch]);

  const currentMessages = messages[groupId];
  const [isAtBottom, setIsAtBottom] = useState(false);
  const hasInitiallyScrolled = useRef(false);
  const prevMessagesLength = useRef(0);

  console.log('[MessageList] currentMessages for groupId', groupId, ':', currentMessages?.length, 'messages');
  
  // Scroll to bottom on initial load
  useEffect(() => {
    if (currentMessages && currentMessages.length > 0 && !hasInitiallyScrolled.current) {
      // Таймаут чтобы DOM успел обновиться перед скроллом
      setTimeout(() => {
        scrollToBottom();
        hasInitiallyScrolled.current = true;
      }, 100);
    }
  }, [currentMessages]);
  
  // Reset scroll state when chat changes
  useEffect(() => {
    hasInitiallyScrolled.current = false;
    prevMessagesLength.current = 0;
    lastMarkedMessageIdRef.current = null; // Сброс при смене чата
  }, [groupId]);
  
  // Mark messages as read functionality
  const markMessagesAsRead = useCallback(() => {
    if (!currentMessages || !user?.id) return;
    
    // Find the last message that's not from current user
    const lastOtherUserMessage = currentMessages
      .filter(msg => msg.user_id !== user.id)
      .pop();
    
    if (lastOtherUserMessage) {
      // Не вызываем markAsRead если уже отметили это сообщение
      if (lastMarkedMessageIdRef.current === lastOtherUserMessage.id) {
        return;
      }
      
      lastMarkedMessageIdRef.current = lastOtherUserMessage.id;
      markAsRead({ 
        groupId: groupId, 
        messageId: lastOtherUserMessage.id 
      });
    }
  }, [currentMessages, user, groupId, markAsRead]);
  
  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!currentMessages || currentMessages.length === 0) return;
    
    const currentLength = currentMessages.length;
    const previousLength = prevMessagesLength.current;
    
    // Always scroll if user is at bottom
    if (isAtBottom) {
      scrollToBottom();
      // Mark messages as read when user is at bottom
      markMessagesAsRead();
    } 
    // Or if new messages were added (length increased)
    else if (currentLength > previousLength) {
      const lastMessage = currentMessages[currentLength - 1];
      // Always scroll if the last message is from current user (just sent)
      if (lastMessage?.user_id === user?.id) {
        scrollToBottom();
      }
    }
    
    prevMessagesLength.current = currentLength;
  }, [currentMessages, isAtBottom, user?.id, markMessagesAsRead]);

  // Mark messages as read when user is at bottom
  useEffect(() => {
    if (isAtBottom && currentMessages && currentMessages.length > 0) {
      markMessagesAsRead();
    }
  }, [isAtBottom, currentMessages, markMessagesAsRead]);

  // Вызываем callback при изменении состояния скролла
  useEffect(() => {
    if (onScrollStateChange) {
      onScrollStateChange(isAtBottom);
    }
  }, [isAtBottom, onScrollStateChange]);

  // Инициализация состояния скролла при монтировании
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 20;
      const newIsAtBottom = scrollHeight - scrollTop - clientHeight < threshold;
      setIsAtBottom(newIsAtBottom);
    }
  }, [groupId]); // Вызвать при изменении groupId

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const threshold = 20; // Уменьшаю порог до 20px для более точного определения
      const newIsAtBottom = scrollHeight - scrollTop - clientHeight < threshold;
      
      
      if (newIsAtBottom !== isAtBottom) {
        setIsAtBottom(newIsAtBottom);
      }
    }
  }, [isAtBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenuId && !(event.target as Element).closest(`.${styles.messageMenu}`)) {
        setShowMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenuId]);

  const handleEditMessage = async () => {
    if (editingMessageId && editingText.trim()) {
      try {
        await editMessage({ messageId: editingMessageId, text: editingText.trim() }).unwrap();
        setEditingMessageId(null);
        setEditingText('');
      } catch (error) {
      }
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId).unwrap();
      setShowMenuId(null);
    } catch (error) {
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingText(message.text);
    setShowMenuId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const formatTime = (dateString: string) => {
    // Если дата уже содержит 'Z' (UTC), не добавляем еще один
    const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ru-RU', {
      timeZone: 'Asia/Bishkek',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    // Если дата уже содержит 'Z' (UTC), не добавляем еще один
    const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = (messageList: Message[]) => {
    const groups: { [date: string]: Message[] } = {};

    console.log('[MessageList] groupMessagesByDate input:', messageList.length, 'messages');

    messageList.forEach(message => {
      // Корректно парсим дату независимо от формата
      const dateStr = message.created_date.endsWith('Z') ? message.created_date : message.created_date + 'Z';
      const date = new Date(dateStr).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    console.log('[MessageList] groupMessagesByDate output:', Object.keys(groups).length, 'dates');

    return groups;
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.user_id === user?.id;
    const isDeleted = message.is_deleted;
    const isEdited = message.edited_at && !isDeleted;
    const isEditing = editingMessageId === message.id;

    const username =
      groupDetail?.members?.find((m) => m.user_id === message.user_id)?.username ||
      `Пользователь ${message.user_id}`;

    const avatarLetter = username.charAt(0).toUpperCase();

    return (
      <div
        key={`${message.id}-${message.created_date}-${message.user_id}`}
        className={`${styles.message} ${isOwn ? styles.own : styles.other}`}
      >
        {!isOwn && (
          <div className={styles.messageAvatar}>
            <div className={styles.avatarPlaceholder}>
              {avatarLetter || '?'}
            </div>
          </div>
        )}
        
        <div className={styles.messageContent}>
          <div className={styles.messageHeader}>
            <span className={styles.messageAuthor}>
              {username}
            </span>
            <div className={styles.messageTimeWrapper}>
              <span className={styles.messageTime}>
                {formatTime(message.created_date)}
              </span>
              {isOwn && !isDeleted && (
                <div className={styles.messageMenu}>
                  <button
                    className={styles.menuButton}
                    onClick={() => setShowMenuId(showMenuId === message.id ? null : message.id)}
                  >
                    ⋯
                  </button>
                  {showMenuId === message.id && (
                    <div className={styles.menuDropdown}>
                      <button
                        className={styles.menuItem}
                        onClick={() => startEditing(message)}
                      >
                        Изменить
                      </button>
                      <button
                        className={styles.menuItem}
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className={`${styles.messageBubble} ${isDeleted ? styles.deleted : ''}`}>
            {isDeleted ? (
              <span className={styles.deletedText}>Сообщение удалено</span>
            ) : isEditing ? (
              <div className={styles.editContainer}>
                <textarea
                  className={styles.editInput}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') cancelEditing();
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEditMessage();
                    }
                  }}
                  autoFocus
                />
                <div className={styles.editActions}>
                  <button 
                    className={styles.editButton} 
                    onClick={handleEditMessage}
                    style={{
                      background: '#007bff',
                      border: '1px solid #007bff',
                      borderRadius: '10px',
                      color: 'white',
                      padding: '8px 12px'
                    }}
                  >
                    Сохранить
                  </button>
                  <button 
                    className={styles.editButton} 
                    onClick={cancelEditing}
                    style={{
                      background: '#222',
                      border: '1px solid rgb(98, 98, 98)',
                      borderRadius: '10px',
                      color: 'white',
                      padding: '8px 12px'
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.messageText}>{message.text}</p>
                {(message.file_url || message.attachments) && (
                  <div className={styles.messageFile}>
                    {message.file_url && (
                      <>
                        {message.file_type?.startsWith('image/') ? (
                          <Image 
                            src={message.file_url.startsWith('http') 
                              ? message.file_url 
                              : `${process.env.NEXT_PUBLIC_CHAT_API || 'https://chat.apibackendokukg.space'}${message.file_url}`} 
                            alt="Shared image"
                            width={200}
                            height={200}
                            style={{ objectFit: 'cover' }}
                            onClick={() => setModalImage({ 
                              url: message.file_url && message.file_url.startsWith('http') 
                                ? message.file_url 
                                : `${process.env.NEXT_PUBLIC_CHAT_API || 'https://chat.apibackendokukg.space'}${message.file_url || ''}`, 
                              alt: 'Shared image' 
                            })}
                            className={styles.clickableImage}
                          />
                        ) : message.file_type?.startsWith('audio/') ? (
                          <VoicePlayer 
                            audioUrl={message.file_url.startsWith('http') 
                              ? message.file_url 
                              : `${process.env.NEXT_PUBLIC_CHAT_API || 'https://chat.apibackendokukg.space'}${message.file_url}`}
                            className={styles.voicePlayer}
                          />
                        ) : (
                          <a 
                            href={message.file_url.startsWith('http') 
                              ? message.file_url 
                              : `${process.env.NEXT_PUBLIC_CHAT_API || 'https://chat.apibackendokukg.space'}${message.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fileLink}
                          >
                            📎 Открыть файл
                          </a>
                        )}
                      </>
                    )}
                    {message.attachments?.map((attachment) => {
                      const imageUrl = attachment.url || attachment.file_url;
                      const fullImageUrl = imageUrl?.startsWith('http') 
                        ? imageUrl 
                        : `${process.env.NEXT_PUBLIC_CHAT_API || 'https://chat.apibackendokukg.space'}${imageUrl}`;
                      const isImage = attachment.type?.startsWith('image/') || attachment.file_type?.startsWith('image/') || attachment.mime?.startsWith('image/');
                      const isAudio = attachment.type?.startsWith('audio/') || attachment.file_type?.startsWith('audio/') || attachment.mime?.startsWith('audio/');
                      
                      if (isImage) {
                        return (
                          <Image 
                            key={attachment.id}
                            src={fullImageUrl} 
                            alt="Shared image"
                            width={200}
                            height={200}
                            style={{ objectFit: 'cover' }}
                            onClick={() => setModalImage({ url: fullImageUrl, alt: 'Shared image' })}
                            className={styles.clickableImage}
                          />
                        );
                      }
                      
                      if (isAudio) {
                        return (
                          <VoicePlayer 
                            key={attachment.id}
                            audioUrl={fullImageUrl}
                            duration={attachment.duration}
                            className={styles.voicePlayer}
                          />
                        );
                      }
                      
                      return (
                        <a 
                          key={attachment.id}
                          href={fullImageUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.fileLink}
                        >
                          📎 {attachment.file_name || attachment.name || 'Открыть файл'}
                        </a>
                      );
                    })}
                  </div>
                )}
                {isEdited && (
                  <span className={styles.editedIndicator}>изменено</span>
                )}
              </>
            )}
          </div>
          
          {/* Галочки для своих сообщений под всем блоком сообщения */}
          {isOwn && (
            <MessageStatus 
              message={message} 
              isOwn={isOwn} 
              isGroupChat={!groupDetail?.is_private}
            />
          )}
        </div>
      </div>
    );
  };

  const renderDateSeparator = (date: string) => (
    <div key={date} className={styles.dateSeparator}>
      <span className={styles.dateText}>{formatDate(date)}</span>
    </div>
  );

  // Показываем полный экран загрузки только при первой загрузке (isLoading)
  // При refetch (isFetching) не размонтируем сообщения - показываем индикатор поверх
  if (isLoading && !currentMessages?.length) {
    return (
      <div className={styles.messageList}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Загрузка сообщений...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.messageList}>
        <div className={styles.error}>
          <span>Не удалось загрузить сообщения</span>
          <button onClick={() => window.location.reload()}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const groupMessages = messages[groupId] || [];
  console.log('[MessageList] groupMessages:', groupMessages);

  // Сортируем сообщения по created_date (старые сначала, новые в конце)
  const sortedMessages = [...groupMessages].sort((a, b) => {
    return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
  });

  console.log('[MessageList] sortedMessages:', sortedMessages);

  const groupedMessages = groupMessagesByDate(sortedMessages);
  console.log('[MessageList] groupedMessages:', groupedMessages);

 

  return (
    <div className={styles.messageList} ref={containerRef}>
      {/* Индикатор загрузки сверху при refetch */}
      {isFetching && groupMessages.length > 0 && (
        <div className={styles.loading}>
          Обновление...
        </div>
      )}
      
      {/* Показываем empty state только если нет сообщений и нет загрузки */}
      {(!isLoading && !isFetching) && (!groupMessages || groupMessages.length === 0) && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3>Нет сообщений</h3>
          <h3>Начните диалог первым!</h3>
        </div>
      )}
      
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <React.Fragment key={date}>
          {renderDateSeparator(date)}
          {dateMessages.map(renderMessage)}
        </React.Fragment>
      ))}
      
      <div ref={messagesEndRef} />
      
      {modalImage && (
        <ImageModal
          imageUrl={modalImage.url}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default MessageList;
