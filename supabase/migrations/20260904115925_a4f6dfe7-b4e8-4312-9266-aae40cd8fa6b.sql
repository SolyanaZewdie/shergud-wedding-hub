REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_vendor(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.in_conversation(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.shares_conversation(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_vendor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.in_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_conversation(uuid) TO authenticated;