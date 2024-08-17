-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seed Users table
INSERT INTO users (id, name, avatar, status, last_seen, created_at)
VALUES
    (uuid_generate_v4(), 'Alice Johnson', 'https://example.com/avatars/alice.jpg', 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Bob Smith', 'https://example.com/avatars/bob.jpg', 'offline', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Charlie Brown', 'https://example.com/avatars/charlie.jpg', 'away', CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP);

-- Seed Conversations table
INSERT INTO conversations (id, name, avatar, last_message_timestamp, created_at, updated_at)
VALUES
    (uuid_generate_v4(), 'Work Group', 'https://example.com/avatars/work_group.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Family Chat', 'https://example.com/avatars/family_chat.jpg', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Conversation Participants table
INSERT INTO conversation_participants (conversation_id, user_id, last_read_timestamp)
VALUES
    ((SELECT id FROM conversations WHERE name = 'Work Group'), (SELECT id FROM users WHERE name = 'Alice Johnson'), CURRENT_TIMESTAMP),
    ((SELECT id FROM conversations WHERE name = 'Work Group'), (SELECT id FROM users WHERE name = 'Bob Smith'), CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    ((SELECT id FROM conversations WHERE name = 'Family Chat'), (SELECT id FROM users WHERE name = 'Alice Johnson'), CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ((SELECT id FROM conversations WHERE name = 'Family Chat'), (SELECT id FROM users WHERE name = 'Charlie Brown'), CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- Seed Messages table
INSERT INTO messages (id, conversation_id, sender_id, parent_message_id, type, status, timestamp, version, created_at, updated_at)
VALUES
    (uuid_generate_v4(), (SELECT id FROM conversations WHERE name = 'Work Group'), (SELECT id FROM users WHERE name = 'Alice Johnson'), NULL, 'text', 'sent', CURRENT_TIMESTAMP - INTERVAL '2 hours', 1, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    (uuid_generate_v4(), (SELECT id FROM conversations WHERE name = 'Work Group'), (SELECT id FROM users WHERE name = 'Bob Smith'), NULL, 'image', 'delivered', CURRENT_TIMESTAMP - INTERVAL '1 hour', 1, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    (uuid_generate_v4(), (SELECT id FROM conversations WHERE name = 'Family Chat'), (SELECT id FROM users WHERE name = 'Charlie Brown'), NULL, 'text', 'read', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 1, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    (uuid_generate_v4(), (SELECT id FROM conversations WHERE name = 'Work Group'), (SELECT id FROM users WHERE name = 'Alice Johnson'), NULL, 'file', 'sent', CURRENT_TIMESTAMP - INTERVAL '15 minutes', 1, CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
    (uuid_generate_v4(), (SELECT id FROM conversations WHERE name = 'Work Group'), (SELECT id FROM users WHERE name = 'Alice Johnson'), NULL, 'text', 'sending', CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Text Messages table
INSERT INTO text_messages (message_id, content)
VALUES
    ((SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Work Group') AND type = 'text' AND status = 'sent'), 'Hey team, let''s discuss the project timeline.'),
    ((SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Family Chat') AND type = 'text'), 'Who''s up for a weekend barbecue?'),
    ((SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Work Group') AND type = 'text' AND status = 'sending'), 'Draft: Here are my thoughts on the project...');

-- Seed Media Messages table
INSERT INTO media_messages (message_id, url, thumbnail_url, file_name, file_size, mime_type, duration, width, height)
VALUES
    ((SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Work Group') AND type = 'image'),
     'https://example.com/images/project_chart.jpg',
     'https://example.com/thumbnails/project_chart_thumb.jpg',
     'project_chart.jpg',
     1024000,
     'image/jpeg',
     NULL,
     1920,
     1080);

-- Seed File Messages table
INSERT INTO file_messages (message_id, url, file_name, file_size, mime_type)
VALUES
    ((SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Work Group') AND type = 'file'),
     'https://example.com/files/report.pdf',
     'quarterly_report.pdf',
     2048000,
     'application/pdf');

-- Seed Reactions table
INSERT INTO reactions (id, message_id, user_id, reaction, timestamp)
VALUES
    (uuid_generate_v4(), (SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Work Group') AND type = 'text' AND status = 'sent'), (SELECT id FROM users WHERE name = 'Bob Smith'), '👍', CURRENT_TIMESTAMP - INTERVAL '1 hour 55 minutes'),
    (uuid_generate_v4(), (SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Family Chat') AND type = 'text'), (SELECT id FROM users WHERE name = 'Alice Johnson'), '❤️', CURRENT_TIMESTAMP - INTERVAL '25 minutes');

-- Seed Draft Messages table
INSERT INTO draft_messages (conversation_id, user_id, message_id, type, timestamp, version, created_at, updated_at)
VALUES
    ((SELECT id FROM conversations WHERE name = 'Work Group'), 
     (SELECT id FROM users WHERE name = 'Alice Johnson'), 
     (SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Work Group') AND type = 'text' AND status = 'sending'), 
     'text', 
     CURRENT_TIMESTAMP, 
     1, 
     CURRENT_TIMESTAMP, 
     CURRENT_TIMESTAMP);

-- Seed Send Message Requests table
INSERT INTO send_message_requests (id, message_id, status, fail_count, last_sent_at, created_at, updated_at)
VALUES
    (uuid_generate_v4(), (SELECT id FROM messages WHERE conversation_id = (SELECT id FROM conversations WHERE name = 'Work Group') AND type = 'image'), 'success', 0, CURRENT_TIMESTAMP - INTERVAL '59 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '59 minutes');