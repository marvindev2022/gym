from ...repositories.student_repository import StudentRepository
from ...entities.student import Student


class ListStudentsUseCase:
    def __init__(self, repository: StudentRepository):
        self._repository = repository

    def execute(self, trainer_id: str) -> list[Student]:
        return self._repository.list_by_trainer(trainer_id)
