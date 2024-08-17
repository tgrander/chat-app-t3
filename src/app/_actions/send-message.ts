"use server";

import { MessageStatus, MessageType } from "@/client/db/schema";

import type { Database } from "@/types/supabase/database";
import { createServerClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

const conversationId = "ab3f183f-f08e-43e4-969d-628b7a29917e";
const aliceUserId = "0310b220-d681-49ae-b55f-4ead3a79521e"
const bobUserId = "3f2e40ea-d7e8-4711-bb5d-fbc763c71c02"

// Server Action: Send Message
export async function sendMessage() {
    "use server"
    
    const supabase = createServerClient();

    const senderId = fiftyFiftyChoice(aliceUserId, bobUserId)

    const {message, content} = generateTextMessageData(senderId, conversationId, {text: getRandomListItem(randomChatMessages)})

    try {
        const { error: insertMessageError} = await supabase.from("messages").insert(message)
        const { error: insertTextMessageError} = await supabase.from("text_messages").insert(content)

        if (insertMessageError || insertTextMessageError) {
            [insertMessageError, insertTextMessageError].forEach((error) => {
              if (error) console.error(error)
            })
        }
    } catch (error) {
        throw new Error(`There was a problem inserting new message to the DB: ${error}`)
    }
}

/**
 * HELPER FUNCTIONS
 */
function generateTextMessageData(
  senderId: string,
  conversationId: string,
  {text}: {text: string},
) {
  const now = new Date();

  const messageId = uuidv4()

  const message: Database["public"]["Tables"]["messages"]["Insert"] = {
    id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    type: MessageType.Text,
    status: MessageStatus.Sent,
    timestamp: now.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    version: 1,
  };

  const content: Database["public"]["Tables"]["text_messages"]["Insert"] = {
    content: text,
    message_id: messageId
  }

  return {
    message,
    content
  }
}

function fiftyFiftyChoice<T>(option1: T, option2: T): T {
    return Math.random() < 0.5 ? option1 : option2;
}

function getRandomListItem<T>(list: T[]): T {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex] as T;
}

const randomChatMessages = [
    "Hey, are we still on for lunch tomorrow?",
    "Just finished that book you recommended. It was amazing!",
    "Can you send me the link to that funny cat video again?",
    "Don't forget to bring your jacket, it's supposed to be cold today.",
    "I'm running late for the meeting. Can you cover for me?",
    "Happy birthday! 🎉🎂 Hope you have a fantastic day!",
    "Did you see the game last night? What a comeback!",
    "I'm at the store. Do we need milk?",
    "Thanks for your help with the project. Couldn't have done it without you!",
    "Movie night at my place this Saturday. You in?",
    "I can't believe what just happened on my favorite show. No spoilers, but wow!",
    "Hey, can I borrow your notes from yesterday's class?",
    "Just adopted a puppy! 🐶 Want to come over and meet him?",
    "Reminder: We have a team building event next Friday.",
    "I found this great new coffee shop. We should check it out sometime!",
    "Can you proofread this email for me before I send it to the boss?",
    "I'm feeling under the weather today. Might have to call in sick.",
    "Just booked my vacation tickets. So excited for next month!",
    "Have you tried that new restaurant downtown? Heard it's amazing.",
    "Don't forget to wish Mom a happy anniversary today!"
  ];
