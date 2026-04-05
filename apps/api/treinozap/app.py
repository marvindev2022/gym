from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from .extensions import supabase_client
from .blueprints.students.resource import students_bp
from .blueprints.workouts.resource import workouts_bp
from .blueprints.auth.resource import auth_bp


def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__)

    # Configuração
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']

    # Extensions
    CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(','))
    JWTManager(app)

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(students_bp, url_prefix='/api/v1/students')
    app.register_blueprint(workouts_bp, url_prefix='/api/v1/workouts')

    # Health check
    @app.get('/health')
    def health():
        return {'status': 'ok', 'service': 'treinozap-api'}

    return app
