"use server";

import type { MessageContent, MessageType, User } from "@/client/db/schema";

import { UserPresenceStatus } from "@/client/db/schema";
import { createServerClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

function generateMessageData(
  sender: User,
  recipient: User,
  conversationId: string,
  content: MessageContent,
  type: MessageType = "text",
) {
  const now = new Date();

  return {
    id: uuidv4(),
    conversation_id: conversationId,
    sender_id: sender.id,
    recipient_id: recipient.id,
    type: type,
    content: content,
    status: "sent",
    timestamp: now.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

// Example usage:
const sender: User = {
  id: "user1",
  name: "Alice",
  avatar: "",
  status: UserPresenceStatus.Online,
  lastSeen: Date.now(),
};
const recipient: User = {
  id: "user2",
  name: "Bob",
  avatar: "",
  status: UserPresenceStatus.Away,
  lastSeen: Date.now(),
};
const conversationId = "db29e538-a930-4094-961e-c3e1e1c21001";

// Text message
const textMessage = generateMessageData(sender, recipient, conversationId, {
  text: "Hello, how are you?",
});

// SERVER ACTIONS
export async function sendMessage() {
  const supabase = createServerClient();

  const {} = await supabase.from("chat_messages").insert(textMessage);
}
