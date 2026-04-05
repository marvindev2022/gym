.PHONY: dev install lint format test

install:
	pip install -r requirements-dev.txt

dev:
	flask --app treinozap/app.py run --debug --port 5001

lint:
	flake8 treinozap/ --max-line-length=100

format:
	black treinozap/ --line-length=100

test:
	pytest tests/ -v
