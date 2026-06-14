'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../redux/store';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useGetGroupDetailFullQuery, useGetOrCreateDialogMutation, useGetMessagesQuery, useMarkAsReadMutation, useTestMeQuery, useGetMyChatsQuery } from '../../../../../redux/api/chat';
import { GroupMember } from '../../../../../redux/api/chat/types';
import { useWebSocket } from '../../../../../hooks/useWebSocket';
import { useDispatch } from 'react-redux';
import { resetUnreadCount, clearMessages } from '../../../../../redux/slices/chatSlice';
import styles from './ChatWindow.module.scss';

interface ChatWindowProps {
  groupId: number;
  title: string;
  onBack?: () => void;
  onSelectChat?: (groupId: number, title: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ groupId, title, onBack, onSelectChat }) => {
  const { typingUsers, wsConnected } = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [showMembers, setShowMembers] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true); // По умолчанию считаем что внизу
  const [showScrollButton, setShowScrollButton] = useState(false); // Для управления анимацией
  const [createDialog] = useGetOrCreateDialogMutation();
  const { refetch: refetchChats } = useGetMyChatsQuery();

  // Callback для обновления состояния скролла
  const handleScrollStateChange = (atBottom: boolean) => {
    
    setIsAtBottom(atBottom);
    
    if (!atBottom) {
      // Показываем кнопку с небольшой задержкой
      setTimeout(() => setShowScrollButton(true), 100);
    } else {
      // Скрываем кнопку немедленно
      setShowScrollButton(false);
    }
  };

  const { data: messagesData } = useGetMessagesQuery(
    { groupId, limit: 50 },
    { skip: !groupId }
  );


  const { sendMessage } = useWebSocket(groupId);
  
  const getChatPartnerName = () => {
    const isPrivateChat = title.startsWith('dialog_') || groupDetail?.is_private;
    
    if (isPrivateChat && groupDetail?.members) {
      const parts = title.split('_');
      if (parts.length === 3) {
        const userId1 = parseInt(parts[1]);
        const userId2 = parseInt(parts[2]);
        const currentUserId = user.id;
        
        const partnerId = userId1 === currentUserId ? userId2 : userId1;
        
        const partner = groupDetail.members.find(member => member.user_id === partnerId);
        if (partner?.username) {
          return partner.username;
        }
      }
    }
    
    return formatChatTitle(title);
  };

  const getChatPartnerRole = () => {
    const isPrivateChat = title.startsWith('dialog_') || groupDetail?.is_private;
    
    if (isPrivateChat && groupDetail?.members) {
      const parts = title.split('_');
      if (parts.length === 3) {
        const userId1 = parseInt(parts[1]);
        const userId2 = parseInt(parts[2]);
        const currentUserId = user.id;
        
        const partnerId = userId1 === currentUserId ? userId2 : userId1;
        
        const partner = groupDetail.members.find(member => member.user_id === partnerId);
        if (partner?.role) {
          return getDisplayRole(partner.role);
        }
      }
    }
    
    return null;
  };

  const handleMemberClick = async (member: GroupMember) => {
    if (member.user_id === user.id) {
      return;
    }

    // Проверяем, что ID пользователя не null
    if (!user.id) {
      return;
    }

    console.log('[ChatWindow] Creating dialog with user:', member.user_id, member.username);

    try {
      const result = await createDialog(member.user_id).unwrap();

      console.log('[ChatWindow] Dialog creation result:', result);

      // Бэкенд возвращает { dialog_id: number, title: string, created: boolean }
      if (result?.dialog_id && onSelectChat) {
        // Перезагружаем список чатов чтобы новый чат появился сразу
        refetchChats();

        setShowMembers(false); // Закрываем панель участников
        onSelectChat(result.dialog_id, result.title || 'Dialog');
      } else {
        console.error('[ChatWindow] Invalid dialog result:', result);
      }
    } catch (error) {
      console.error('[ChatWindow] Failed to create dialog:', error);
    }
  };

  const getMemberRole = (member: GroupMember) => {
    if (member.role === 'mentor') {
      return 'Ментор';
    }
    return 'Студент';
  };

  const getDisplayRole = (role: string) => {
    if (role === 'mentor') {
      return 'Ментор';
    }
    return 'Студент';
  };
  const formatChatTitle = (title: string) => {
    if (title.startsWith('course:')) {
      return title.replace('course:', 'группа:');
    }
    return title;
  };
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const { data: groupDetail } = useGetGroupDetailFullQuery(groupId, {
    skip: !groupId,
  });

  useEffect(() => {
    dispatch(resetUnreadCount(groupId));
    // Не очищаем сообщения при смене чата - они должны сохраняться
    // для мгновенного отображения при повторном входе
  }, [groupId, dispatch]);

  const getTypingText = () => {
    const currentTypingUsers = typingUsers[groupId] || [];
    if (currentTypingUsers.length === 0) return '';
    
    if (currentTypingUsers.length === 1) {
      return `${currentTypingUsers[0].username} печатает...`;
    }
    
    if (currentTypingUsers.length === 2) {
      return `${currentTypingUsers[0].username} и ${currentTypingUsers[1].username} печатают...`;
    }
    
    return `${currentTypingUsers.length} человек печатают...`;
  };

  return (
    <div className={styles.chatWindow} ref={chatWindowRef}>
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backButton} onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          
          <div className={styles.chatInfo}>
            <h3 className={styles.chatTitle}>{getChatPartnerName()}</h3>
            <div className={styles.userInfoRow}>
              {getChatPartnerRole() && (
                <span className={styles.chatPartnerRole}>
                  {getChatPartnerRole()}
                </span>
              )}
             
            </div>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          {!title.startsWith('dialog_') && !groupDetail?.is_private && (
            <button 
              className={styles.headerButton}
              onClick={() => setShowMembers(!showMembers)}
              title="Участники"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={styles.chatBody}>
        <MessageList groupId={groupId} onScrollStateChange={handleScrollStateChange} />
        
        {typingUsers[groupId] && typingUsers[groupId].length > 0 && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className={styles.typingText}>{getTypingText()}</span>
          </div>
        )}
      </div>

      <div className={styles.chatFooter}>
        {/* Кнопка прокрутки вниз появляется только когда пользователь не в самом низу */}
        {showScrollButton && (
          <button 
            className={`${styles.scrollToBottomButton} ${styles.visible}`}
            onClick={() => {
              const container = document.querySelector('[class*="messageList"]') as HTMLElement;
              if (container) {
                container.scrollTop = container.scrollHeight;
              }
            }}
            title="Прокрутить вниз"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </button>
        )}
        <MessageInput groupId={groupId} sendMessage={sendMessage} />
      </div>

      {showMembers && (
        <div className={styles.membersSidebar}>
          <div className={styles.membersHeader}>
            <h4>Участники</h4>
            <button 
              className={styles.closeButton}
              onClick={() => setShowMembers(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className={styles.membersList}>
            {groupDetail?.members?.map((m) => (
              <div 
                key={m.user_id} 
                className={`${styles.member} ${m.user_id !== user.id ? styles.clickable : ''}`}
                onClick={() => m.user_id !== user.id && handleMemberClick(m)}
                title={m.user_id !== user.id ? "Начать личный чат" : "Это вы"}
              >
                <div className={styles.memberAvatar}>
                  <div className={styles.avatarPlaceholder}>
                    {(m.username || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{m.username}</span>
                  <span className={styles.memberRole}>
                    {getMemberRole(m)}
                  </span>
                </div>
                {m.user_id !== user.id && (
                  <div className={styles.privateChatIndicator}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
  
export default ChatWindow;