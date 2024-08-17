-- Enable row level security for messages table
ALTER TABLE "messages"
ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to messages table
CREATE POLICY "Allow anonymous access to messages"
ON messages
FOR SELECT
TO anon
USING (true);

-- Enable row level security for text_messages table
ALTER TABLE "text_messages"
ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to text_messages table
CREATE POLICY "Allow anonymous access to text_messages"
ON text_messages
FOR SELECT
TO anon
USING (true);
