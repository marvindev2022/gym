from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from ...extensions import supabase_client
from ...repositories.workout_repository import WorkoutRepository
from ...use_cases.workouts.create_workout import CreateWorkoutUseCase
from ...use_cases.workouts.get_workout_by_token import GetWorkoutByTokenUseCase
from ...dto.workout_dto import CreateWorkoutSchema, WorkoutResponseSchema

workouts_bp = Blueprint('workouts', __name__)


def get_trainer_id() -> str:
    user_id = get_jwt_identity()
    client = supabase_client()
    response = client.table('trainers').select('id').eq('user_id', user_id).single().execute()
    return response.data['id']


def serialize_workout(workout) -> dict:
    return {
        'id': workout.id,
        'trainer_id': workout.trainer_id,
        'student_id': workout.student_id,
        'title': workout.title,
        'description': workout.description,
        'public_token': workout.public_token,
        'is_active': workout.is_active,
        'created_at': workout.created_at.isoformat(),
        'exercises': [
            {
                'id': ex.id,
                'name': ex.name,
                'sets': ex.sets,
                'reps': ex.reps,
                'rest_seconds': ex.rest_seconds,
                'notes': ex.notes,
                'order_index': ex.order_index,
            }
            for ex in sorted(workout.exercises, key=lambda e: e.order_index)
        ],
    }


@workouts_bp.get('/')
@jwt_required()
def list_workouts():
    trainer_id = get_trainer_id()
    repo = WorkoutRepository(supabase_client())
    workouts = repo.list_by_trainer(trainer_id)
    return jsonify([serialize_workout(w) for w in workouts])


@workouts_bp.post('/')
@jwt_required()
def create_workout():
    trainer_id = get_trainer_id()
    schema = CreateWorkoutSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': e.messages}), 422

    repo = WorkoutRepository(supabase_client())
    use_case = CreateWorkoutUseCase(repo)
    workout = use_case.execute(trainer_id, data)
    return jsonify(serialize_workout(workout)), 201


@workouts_bp.get('/public/<token>')
def get_public_workout(token: str):
    """Rota pública — aluno acessa sem autenticação."""
    repo = WorkoutRepository(supabase_client())
    use_case = GetWorkoutByTokenUseCase(repo)
    workout = use_case.execute(token)
    if not workout:
        return jsonify({'error': 'Treino não encontrado ou inativo'}), 404

    # Registra visualização
    repo.log_activity(
        student_id=workout.student_id,
        workout_id=workout.id,
        event='viewed_workout',
        metadata={'token': token},
    )

    return jsonify(serialize_workout(workout))


@workouts_bp.post('/public/<token>/complete')
def complete_workout(token: str):
    """Aluno marca treino como concluído."""
    repo = WorkoutRepository(supabase_client())
    workout = repo.get_by_token(token)
    if not workout:
        return jsonify({'error': 'Treino não encontrado'}), 404

    repo.log_activity(
        student_id=workout.student_id,
        workout_id=workout.id,
        event='completed_workout',
    )

    # Atualiza last_activity_at do aluno
    if workout.student_id:
        from datetime import datetime, timezone
        supabase_client().table('students').update({
            'last_activity_at': datetime.now(timezone.utc).isoformat(),
        }).eq('id', workout.student_id).execute()

    return jsonify({'message': 'Treino registrado com sucesso!'})
