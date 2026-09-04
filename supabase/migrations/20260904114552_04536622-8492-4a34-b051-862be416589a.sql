REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.in_conversation(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.owns_vendor(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;