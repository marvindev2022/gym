from ...repositories.workout_repository import WorkoutRepository
from ...entities.workout import Workout


class CreateWorkoutUseCase:
    def __init__(self, repository: WorkoutRepository):
        self._repository = repository

    def execute(self, trainer_id: str, data: dict) -> Workout:
        exercises = data.pop('exercises', [])
        return self._repository.create(trainer_id, data, exercises)
