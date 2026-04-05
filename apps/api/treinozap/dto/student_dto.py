from marshmallow import Schema, fields, validate, post_load


class CreateStudentSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    phone = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    email = fields.Email(load_default=None)
    goal = fields.Str(load_default=None, validate=validate.Length(max=200))
    monthly_fee = fields.Float(load_default=None, validate=validate.Range(min=0))
    payment_due_day = fields.Int(load_default=None, validate=validate.Range(min=1, max=31))
    status = fields.Str(load_default='active', validate=validate.OneOf(['active', 'inactive', 'blocked']))


class UpdateStudentSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=120))
    phone = fields.Str(validate=validate.Length(min=10, max=20))
    email = fields.Email(load_default=None)
    goal = fields.Str(load_default=None)
    monthly_fee = fields.Float(load_default=None)
    payment_due_day = fields.Int(load_default=None)
    status = fields.Str(validate=validate.OneOf(['active', 'inactive', 'blocked']))


class StudentResponseSchema(Schema):
    id = fields.Str()
    trainer_id = fields.Str()
    name = fields.Str()
    phone = fields.Str()
    email = fields.Str(allow_none=True)
    goal = fields.Str(allow_none=True)
    monthly_fee = fields.Float(allow_none=True)
    payment_due_day = fields.Int(allow_none=True)
    status = fields.Str()
    last_activity_at = fields.Str(allow_none=True)
    created_at = fields.Str()
