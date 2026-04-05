from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Student:
    id: str
    trainer_id: str
    name: str
    phone: str
    email: Optional[str]
    goal: Optional[str]
    monthly_fee: Optional[float]
    payment_due_day: Optional[int]
    status: str  # 'active' | 'inactive' | 'blocked'
    last_activity_at: Optional[datetime]
    created_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'Student':
        return cls(
            id=data['id'],
            trainer_id=data['trainer_id'],
            name=data['name'],
            phone=data['phone'],
            email=data.get('email'),
            goal=data.get('goal'),
            monthly_fee=data.get('monthly_fee'),
            payment_due_day=data.get('payment_due_day'),
            status=data.get('status', 'active'),
            last_activity_at=datetime.fromisoformat(data['last_activity_at']) if data.get('last_activity_at') else None,
            created_at=datetime.fromisoformat(data['created_at']),
        )
