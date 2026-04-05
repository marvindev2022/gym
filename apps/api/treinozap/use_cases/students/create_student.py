from ...repositories.student_repository import StudentRepository
from ...entities.student import Student


class CreateStudentUseCase:
    def __init__(self, repository: StudentRepository):
        self._repository = repository

    def execute(self, trainer_id: str, data: dict) -> Student:
        return self._repository.create(trainer_id, data)
