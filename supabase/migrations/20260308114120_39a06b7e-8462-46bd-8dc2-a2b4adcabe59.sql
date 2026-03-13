
-- 1. Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);

-- Storage policies for gallery bucket
CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-images');

-- 2. Add driver role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';
