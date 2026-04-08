FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# FastAPI service port
EXPOSE 8000

# Run scraper API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
