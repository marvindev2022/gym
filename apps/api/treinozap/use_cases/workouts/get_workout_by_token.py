from typing import Optional
from ...repositories.workout_repository import WorkoutRepository
from ...entities.workout import Workout


class GetWorkoutByTokenUseCase:
    def __init__(self, repository: WorkoutRepository):
        self._repository = repository

    def execute(self, token: str) -> Optional[Workout]:
        return self._repository.get_by_token(token)
