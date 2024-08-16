import { type Database } from "@/types/supabase/database";

export function RealtimeMessages({
  serverMessages,
}: {
  serverMessages: Array<Database["public"]["Tables"]["chat_messages"]["Row"]>;
}) {
  console.log("serverMessages :>> ", serverMessages);

  return null;
}
