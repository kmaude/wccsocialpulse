-- Allow authenticated users to insert competitor profiles
CREATE POLICY "Authenticated users can insert competitors"
ON public.competitor_profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update competitor profiles (for upsert)
CREATE POLICY "Authenticated users can update competitors"
ON public.competitor_profiles
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);