export interface SystemMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}
