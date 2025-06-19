-- ========== POSTS TABLE ==========
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_path text NOT NULL, -- e.g. '<user_id>/<post_id>.jpg'
  caption text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow all users to view posts
CREATE POLICY "Allow all users to view posts"
  ON public.posts FOR SELECT
  USING (true);

-- Allow users to insert their own posts
CREATE POLICY "Allow users to insert their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);


-- ========== LIKES TABLE ==========
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_like_per_user UNIQUE (post_id, user_id)
);

-- Enable RLS on likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Allow all users to view likes
CREATE POLICY "Allow all users to view likes"
  ON public.likes FOR SELECT
  USING (true);

-- Allow users to like a post (insert)
CREATE POLICY "Allow users to like posts"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to unlike (delete own like)
CREATE POLICY "Allow users to delete their own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);


-- ========== COMMENTS TABLE ==========
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow all users to view comments
CREATE POLICY "Allow all users to view comments"
  ON public.comments FOR SELECT
  USING (true);

-- Allow users to insert their own comments
CREATE POLICY "Allow users to comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Allow users to update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Allow users to delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);
