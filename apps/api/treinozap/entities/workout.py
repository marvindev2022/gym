from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class Exercise:
    id: str
    workout_id: str
    name: str
    sets: Optional[int]
    reps: Optional[str]
    rest_seconds: Optional[int]
    notes: Optional[str]
    order_index: int
    created_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'Exercise':
        return cls(
            id=data['id'],
            workout_id=data['workout_id'],
            name=data['name'],
            sets=data.get('sets'),
            reps=data.get('reps'),
            rest_seconds=data.get('rest_seconds'),
            notes=data.get('notes'),
            order_index=data.get('order_index', 0),
            created_at=datetime.fromisoformat(data['created_at']),
        )


@dataclass
class Workout:
    id: str
    trainer_id: str
    student_id: Optional[str]
    title: str
    description: Optional[str]
    public_token: str
    is_active: bool
    created_at: datetime
    exercises: list[Exercise] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> 'Workout':
        exercises = [Exercise.from_dict(e) for e in data.get('exercises', [])]
        return cls(
            id=data['id'],
            trainer_id=data['trainer_id'],
            student_id=data.get('student_id'),
            title=data['title'],
            description=data.get('description'),
            public_token=data['public_token'],
            is_active=data.get('is_active', True),
            created_at=datetime.fromisoformat(data['created_at']),
            exercises=exercises,
        )
