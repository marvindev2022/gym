from marshmallow import Schema, fields, validate, pre_load, EXCLUDE


class ExerciseSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    sets = fields.Int(load_default=None, validate=validate.Range(min=1))
    reps = fields.Str(load_default=None, validate=validate.Length(max=20))
    rest_seconds = fields.Int(load_default=None, validate=validate.Range(min=0))
    notes = fields.Str(load_default=None)
    order_index = fields.Int(load_default=0)


class CreateWorkoutSchema(Schema):
    student_id = fields.Str(load_default=None)
    title = fields.Str(required=True, validate=validate.Length(min=2, max=200))
    description = fields.Str(load_default=None)
    exercises = fields.List(fields.Nested(ExerciseSchema), load_default=[])


class WorkoutResponseSchema(Schema):
    id = fields.Str()
    trainer_id = fields.Str()
    student_id = fields.Str(allow_none=True)
    title = fields.Str()
    description = fields.Str(allow_none=True)
    public_token = fields.Str()
    is_active = fields.Bool()
    created_at = fields.Str()
    exercises = fields.List(fields.Dict())
