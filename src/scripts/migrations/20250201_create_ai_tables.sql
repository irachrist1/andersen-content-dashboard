-- Create table for AI usage tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Create index on date for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage(date);

-- Create table for detailed AI usage tracking by operation
CREATE TABLE IF NOT EXISTS ai_usage_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  operation VARCHAR(50) NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, operation)
);

-- Create index on date and operation for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_usage_details_date_op ON ai_usage_details(date, operation);

-- Create table for caching AI responses
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_hash VARCHAR(64) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(prompt_hash)
);

-- Create index on prompt_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_cache_prompt_hash ON ai_cache(prompt_hash);

-- Create index on expiration date for cleanup jobs
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_cache(expires_at);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_ai_usage_updated_at
BEFORE UPDATE ON ai_usage
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_usage_details_updated_at
BEFORE UPDATE ON ai_usage_details
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create rollback script
COMMENT ON TABLE ai_usage IS 'To rollback: DROP TABLE ai_usage CASCADE;';
COMMENT ON TABLE ai_usage_details IS 'To rollback: DROP TABLE ai_usage_details CASCADE;';
COMMENT ON TABLE ai_cache IS 'To rollback: DROP TABLE ai_cache CASCADE;'; 