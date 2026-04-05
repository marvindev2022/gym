import os
from supabase import create_client, Client


def get_supabase_client() -> Client:
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        raise RuntimeError('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios')
    return create_client(url, key)


# Singleton — inicializado na primeira chamada
_supabase: Client | None = None


def supabase_client() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = get_supabase_client()
    return _supabase
