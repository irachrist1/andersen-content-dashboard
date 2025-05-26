-- Drop all AI-related tables
DROP TABLE IF EXISTS ai_cache CASCADE;
DROP TABLE IF EXISTS ai_usage_details CASCADE;
DROP TABLE IF EXISTS ai_usage CASCADE;

-- Note: The update_updated_at_column function is used by other tables,
-- so we do not drop it in this rollback script. 