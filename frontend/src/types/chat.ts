export type ChatRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
