CREATE OR REPLACE FUNCTION public.shares_conversation(_other_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.vendor_profiles v ON v.id = c.vendor_id
    WHERE (c.couple_id = auth.uid() AND v.user_id = _other_id)
       OR (v.user_id = auth.uid() AND c.couple_id = _other_id)
  )
$$;

REVOKE ALL ON FUNCTION public.shares_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.shares_conversation(uuid) TO authenticated;

CREATE POLICY "conversation participant profile read"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.shares_conversation(id));