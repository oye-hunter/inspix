-- Create a new storage bucket for images
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the bucket if it exists
DO $$
BEGIN
    DROP EXTENSION IF EXISTS "pg_storage";
    CREATE EXTENSION "pg_storage";
EXCEPTION
    WHEN others THEN null;
END $$;

-- Check if the bucket exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM "storage"."buckets" WHERE "name" = 'posts'
    ) THEN
        -- Create a new bucket for posts
        INSERT INTO "storage"."buckets" ("id", "name", "public")
        VALUES ('posts', 'posts', FALSE);
        
        -- Set bucket policy to allow authenticated uploads
        INSERT INTO "storage"."policies" ("bucket_id", "name", "definition")
        VALUES 
        ('posts', 'Allow authenticated uploads', '{"roleDb": "authenticated", "action": "INSERT", "check": {"userId": "auth.uid()"}}'),
        ('posts', 'Allow authenticated updates', '{"roleDb": "authenticated", "action": "UPDATE", "check": {"userId": "auth.uid()"}}'),
        ('posts', 'Allow authenticated deletes', '{"roleDb": "authenticated", "action": "DELETE", "check": {"userId": "auth.uid()"}}'),
        ('posts', 'Allow authenticated select', '{"roleDb": "authenticated", "action": "SELECT"}');
        
        -- No need to create subfolders as they'll be created automatically when uploading files
    END IF;
END $$;

-- This SQL creates a storage bucket with the following structure:
-- posts/
--   └── <user_id>/
--       └── <post_id>.jpg
--
-- The image paths are stored in the posts table as the relative path within the bucket:
-- posts/<user_id>/<post_id>.jpg
-- 
-- Since the bucket is not public, images will only be accessible to authenticated users
-- through the Supabase client after proper authentication
