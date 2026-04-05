from datetime import datetime, timedelta, timezone
from supabase import Client


class GetDashboardMetricsUseCase:
    def __init__(self, client: Client):
        self._client = client

    def execute(self, trainer_id: str) -> dict:
        # Total de alunos
        total_response = (
            self._client.table('students')
            .select('id', count='exact')
            .eq('trainer_id', trainer_id)
            .execute()
        )
        total_students = total_response.count or 0

        # Alunos ativos
        active_response = (
            self._client.table('students')
            .select('id', count='exact')
            .eq('trainer_id', trainer_id)
            .eq('status', 'active')
            .execute()
        )
        active_students = active_response.count or 0

        # Inativos (sem treinar há 7+ dias)
        cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        inactive_response = (
            self._client.table('students')
            .select('id', count='exact')
            .eq('trainer_id', trainer_id)
            .eq('status', 'active')
            .or_(f'last_activity_at.lt.{cutoff},last_activity_at.is.null')
            .execute()
        )
        inactive_count = inactive_response.count or 0

        # Receita estimada (soma das mensalidades de alunos ativos)
        revenue_response = (
            self._client.table('students')
            .select('monthly_fee')
            .eq('trainer_id', trainer_id)
            .eq('status', 'active')
            .execute()
        )
        estimated_revenue = sum(
            row['monthly_fee'] for row in revenue_response.data if row.get('monthly_fee')
        )

        return {
            'total_students': total_students,
            'active_students': active_students,
            'inactive_count': inactive_count,
            'estimated_monthly_revenue': estimated_revenue,
        }
