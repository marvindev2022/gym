from ...repositories.student_repository import StudentRepository
from ...entities.student import Student


class GetInactiveStudentsUseCase:
    def __init__(self, repository: StudentRepository):
        self._repository = repository

    def execute(self, trainer_id: str, inactive_days: int = 7) -> list[Student]:
        return self._repository.get_inactive(trainer_id, inactive_days)
