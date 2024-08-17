-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'audio', 'video');
CREATE TYPE user_presence_status AS ENUM ('online', 'offline', 'away');
CREATE TYPE send_message_request_status AS ENUM ('pending', 'in_flight', 'fail', 'success');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    status user_presence_status NOT NULL,
    last_seen TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    avatar VARCHAR(255),
    last_message_timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Conversation participants table
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    last_read_timestamp TIMESTAMP NOT NULL,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    parent_message_id UUID,
    type message_type NOT NULL,
    status message_status NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    version INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (parent_message_id) REFERENCES messages(id)
);

-- Text messages table
CREATE TABLE text_messages (
    message_id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Media messages table
CREATE TABLE media_messages (
    message_id UUID PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    duration INT,
    width INT,
    height INT,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- File messages table
CREATE TABLE file_messages (
    message_id UUID PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reaction VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Draft messages table
CREATE TABLE draft_messages (
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    message_id UUID NOT NULL,
    type message_type NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    version INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Send message requests table
CREATE TABLE send_message_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL,
    status send_message_request_status NOT NULL,
    fail_count INT NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Create indexes
CREATE INDEX idx_users_last_seen ON users(last_seen);
CREATE INDEX idx_conversations_last_message_timestamp ON conversations(last_message_timestamp);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_parent_message_id ON messages(parent_message_id);
CREATE INDEX idx_reactions_message_id ON reactions(message_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_draft_messages_updated_at ON draft_messages(updated_at);
CREATE INDEX idx_send_message_requests_status ON send_message_requests(status);
CREATE INDEX idx_send_message_requests_message_id ON send_message_requests(message_id);
CREATE INDEX idx_send_message_requests_last_sent_at ON send_message_requests(last_sent_at);