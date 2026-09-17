FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies (using CPU-only PyTorch to download ~150MB instead of ~1GB CUDA)
COPY requirements.txt .
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy backend application source and data
COPY app/ ./app/
COPY data/ ./data/
COPY knowledge_base/ ./knowledge_base/

EXPOSE 8000

ENV ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
