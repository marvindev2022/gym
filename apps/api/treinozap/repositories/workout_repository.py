from typing import Optional
from supabase import Client

from ..entities.workout import Workout


class WorkoutRepository:
    def __init__(self, client: Client):
        self._client = client

    def list_by_trainer(self, trainer_id: str) -> list[Workout]:
        response = (
            self._client.table('workouts')
            .select('*, exercises(*)')
            .eq('trainer_id', trainer_id)
            .order('created_at', desc=True)
            .execute()
        )
        return [Workout.from_dict(row) for row in response.data]

    def get_by_token(self, token: str) -> Optional[Workout]:
        """Busca pública — sem auth necessária."""
        response = (
            self._client.table('workouts')
            .select('*, exercises(*)')
            .eq('public_token', token)
            .eq('is_active', True)
            .single()
            .execute()
        )
        if not response.data:
            return None
        return Workout.from_dict(response.data)

    def create(self, trainer_id: str, data: dict, exercises: list[dict]) -> Workout:
        exercises_payload = data.pop('exercises', [])
        workout_payload = {**data, 'trainer_id': trainer_id}

        # Cria o treino
        workout_response = self._client.table('workouts').insert(workout_payload).execute()
        workout_id = workout_response.data[0]['id']

        # Cria os exercícios
        if exercises_payload:
            for i, ex in enumerate(exercises_payload):
                ex['workout_id'] = workout_id
                ex['order_index'] = i
            self._client.table('exercises').insert(exercises_payload).execute()

        # Retorna com exercícios
        return self.get_by_id(workout_id, trainer_id)

    def get_by_id(self, workout_id: str, trainer_id: str) -> Optional[Workout]:
        response = (
            self._client.table('workouts')
            .select('*, exercises(*)')
            .eq('id', workout_id)
            .eq('trainer_id', trainer_id)
            .single()
            .execute()
        )
        if not response.data:
            return None
        return Workout.from_dict(response.data)

    def log_activity(self, student_id: Optional[str], workout_id: str, event: str, metadata: Optional[dict] = None) -> None:
        self._client.table('activity_logs').insert({
            'student_id': student_id,
            'workout_id': workout_id,
            'event': event,
            'metadata': metadata or {},
        }).execute()
