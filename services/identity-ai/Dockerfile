FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY models ./models

# Add the internal HTTP entrypoint once the document, face, and liveness
# pipelines are implemented and wired together.
