
-- RLS policies for equipment-images bucket
CREATE POLICY "Authenticated users can view equipment images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'equipment-images');

CREATE POLICY "Admins and technicians can upload equipment images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'equipment-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'technician'::app_role))
);

CREATE POLICY "Admins and technicians can update equipment images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'equipment-images'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'technician'::app_role))
);

CREATE POLICY "Admins can delete equipment images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'equipment-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
