from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ...extensions import supabase_client

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/login')
def login():
    """Login via Supabase Auth — retorna JWT para uso nas rotas protegidas."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400

    try:
        client = supabase_client()
        response = client.auth.sign_in_with_password({'email': email, 'password': password})
        user = response.user
        session = response.session

        # Busca dados do trainer
        trainer_response = (
            client.table('trainers')
            .select('*')
            .eq('user_id', user.id)
            .single()
            .execute()
        )

        return jsonify({
            'access_token': session.access_token,
            'trainer': trainer_response.data,
        })
    except Exception as e:
        return jsonify({'error': 'Credenciais inválidas'}), 401


@auth_bp.post('/signup')
def signup():
    """Cria conta e trainer profile."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    phone = data.get('phone', '')

    if not all([email, password, name]):
        return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400

    try:
        client = supabase_client()
        auth_response = client.auth.sign_up({'email': email, 'password': password})
        user = auth_response.user

        # Cria perfil do trainer
        trainer_response = client.table('trainers').insert({
            'user_id': user.id,
            'name': name,
            'phone': phone,
            'plan': 'free',
        }).execute()

        return jsonify({'trainer': trainer_response.data[0]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
