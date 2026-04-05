from datetime import datetime, timedelta, timezone
from typing import Optional
from supabase import Client

from ..entities.student import Student


class StudentRepository:
    def __init__(self, client: Client):
        self._client = client

    def list_by_trainer(self, trainer_id: str) -> list[Student]:
        response = (
            self._client.table('students')
            .select('*')
            .eq('trainer_id', trainer_id)
            .order('created_at', desc=True)
            .execute()
        )
        return [Student.from_dict(row) for row in response.data]

    def get_by_id(self, student_id: str, trainer_id: str) -> Optional[Student]:
        response = (
            self._client.table('students')
            .select('*')
            .eq('id', student_id)
            .eq('trainer_id', trainer_id)
            .single()
            .execute()
        )
        if not response.data:
            return None
        return Student.from_dict(response.data)

    def create(self, trainer_id: str, data: dict) -> Student:
        payload = {**data, 'trainer_id': trainer_id}
        response = self._client.table('students').insert(payload).execute()
        return Student.from_dict(response.data[0])

    def update(self, student_id: str, trainer_id: str, data: dict) -> Optional[Student]:
        response = (
            self._client.table('students')
            .update(data)
            .eq('id', student_id)
            .eq('trainer_id', trainer_id)
            .execute()
        )
        if not response.data:
            return None
        return Student.from_dict(response.data[0])

    def delete(self, student_id: str, trainer_id: str) -> bool:
        response = (
            self._client.table('students')
            .delete()
            .eq('id', student_id)
            .eq('trainer_id', trainer_id)
            .execute()
        )
        return bool(response.data)

    def get_inactive(self, trainer_id: str, inactive_days: int = 7) -> list[Student]:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=inactive_days)).isoformat()
        response = (
            self._client.table('students')
            .select('*')
            .eq('trainer_id', trainer_id)
            .eq('status', 'active')
            .or_(f'last_activity_at.lt.{cutoff},last_activity_at.is.null')
            .execute()
        )
        return [Student.from_dict(row) for row in response.data]

    def get_payment_due_soon(self, trainer_id: str, days_ahead: int = 3) -> list[Student]:
        """Retorna alunos com vencimento nos próximos N dias."""
        today = datetime.now(timezone.utc).day
        target_days = [(today + i - 1) % 31 + 1 for i in range(days_ahead + 1)]
        response = (
            self._client.table('students')
            .select('*')
            .eq('trainer_id', trainer_id)
            .eq('status', 'active')
            .in_('payment_due_day', target_days)
            .execute()
        )
        return [Student.from_dict(row) for row in response.data]
