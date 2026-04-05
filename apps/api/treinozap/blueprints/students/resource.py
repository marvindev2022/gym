from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from ...extensions import supabase_client
from ...repositories.student_repository import StudentRepository
from ...use_cases.students.list_students import ListStudentsUseCase
from ...use_cases.students.create_student import CreateStudentUseCase
from ...use_cases.students.get_inactive_students import GetInactiveStudentsUseCase
from ...dto.student_dto import CreateStudentSchema, UpdateStudentSchema, StudentResponseSchema

students_bp = Blueprint('students', __name__)


def get_trainer_id_from_token() -> str:
    """Extrai trainer_id do JWT (via Supabase user_id)."""
    user_id = get_jwt_identity()
    client = supabase_client()
    response = client.table('trainers').select('id').eq('user_id', user_id).single().execute()
    return response.data['id']


@students_bp.get('/')
@jwt_required()
def list_students():
    trainer_id = get_trainer_id_from_token()
    repo = StudentRepository(supabase_client())
    use_case = ListStudentsUseCase(repo)
    students = use_case.execute(trainer_id)
    schema = StudentResponseSchema(many=True)
    return jsonify(schema.dump([vars(s) for s in students]))


@students_bp.post('/')
@jwt_required()
def create_student():
    trainer_id = get_trainer_id_from_token()
    schema = CreateStudentSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': e.messages}), 422

    repo = StudentRepository(supabase_client())
    use_case = CreateStudentUseCase(repo)
    student = use_case.execute(trainer_id, data)
    return jsonify(StudentResponseSchema().dump(vars(student))), 201


@students_bp.get('/<student_id>')
@jwt_required()
def get_student(student_id: str):
    trainer_id = get_trainer_id_from_token()
    repo = StudentRepository(supabase_client())
    student = repo.get_by_id(student_id, trainer_id)
    if not student:
        return jsonify({'error': 'Aluno não encontrado'}), 404
    return jsonify(StudentResponseSchema().dump(vars(student)))


@students_bp.patch('/<student_id>')
@jwt_required()
def update_student(student_id: str):
    trainer_id = get_trainer_id_from_token()
    schema = UpdateStudentSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': e.messages}), 422

    repo = StudentRepository(supabase_client())
    student = repo.update(student_id, trainer_id, data)
    if not student:
        return jsonify({'error': 'Aluno não encontrado'}), 404
    return jsonify(StudentResponseSchema().dump(vars(student)))


@students_bp.delete('/<student_id>')
@jwt_required()
def delete_student(student_id: str):
    trainer_id = get_trainer_id_from_token()
    repo = StudentRepository(supabase_client())
    deleted = repo.delete(student_id, trainer_id)
    if not deleted:
        return jsonify({'error': 'Aluno não encontrado'}), 404
    return '', 204


@students_bp.get('/inactive')
@jwt_required()
def get_inactive():
    trainer_id = get_trainer_id_from_token()
    days = request.args.get('days', 7, type=int)
    repo = StudentRepository(supabase_client())
    use_case = GetInactiveStudentsUseCase(repo)
    students = use_case.execute(trainer_id, days)
    return jsonify(StudentResponseSchema(many=True).dump([vars(s) for s in students]))
