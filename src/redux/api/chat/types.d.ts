
export interface Group {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  create_date: string;
  is_private: boolean;
}

export interface GroupMember {
  user_id: number;
  role: 'owner' | 'admin' | 'member' | 'unknown' | 'mentor' | 'student';
  username: string;
}

export interface Message {
  id: number;
  group_id: number;
  user_id: number;
  text: string;
  created_date: string;
  is_deleted: boolean;
  edited_at: string | null;
  file_url?: string;
  file_type?: string;
  attachments?: Attachment[];
  delivered?: boolean;
  read_by?: number[];
  is_read?: boolean; // Added from backend
}

export interface Attachment {
  id: number;
  file_url: string;
  file_type: string;
  file_name?: string;
  file_size?: number;
  url?: string;
  type?: string;
  mime?: string;
  name?: string;
  duration?: number; 
}

export interface GroupDetail {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  create_date: string;
  is_private: boolean;
  count: number;
  members: GroupMember[];
  group_message: Message[];
}

export interface MessagesResponse {
  group_id: number;
  items: Message[];
  has_more: boolean;
  before_id: number;
}

export interface ChatItem {
  group_id: number;
  title: string;
  is_private: boolean;
  members_count: number;
  last_message: Message | null;
  unread_count: number;
  course: number | null; 
}

export interface CreateGroupRequest {
  title: string;
}

export interface AddMembersRequest {
  user_ids: number[];
}

export interface EditMessageRequest {
  text: string;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_joined' | 'user_left' | 'message_edited' | 'message_deleted';
  data: unknown;
  group_id: number;
  user_id: number;
  timestamp: string;
}

export interface TypingData {
  user_id: number;
  username: string;
  is_typing: boolean;
}

export interface MessageData {
  id: number;
  group_id: number;
  user_id: number;
  text: string;
  created_date: string;
  file_url?: string;
  file_type?: string;
}

export interface DialogResponse {
  dialog_id: number;
  created: boolean;
  title?: string;
  message?: string;
}
