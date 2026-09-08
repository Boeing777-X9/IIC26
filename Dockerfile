# ==========================================================
# Retinix Unified Production Dockerfile
# Hosts BOTH FastAPI (PyTorch ML) and Next.js Frontend
# in a single container without requiring Docker Compose
# ==========================================================

# ----------------------------------------------------------
# Stage 1: Build Next.js Frontend
# ----------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ----------------------------------------------------------
# Stage 2: Final Production Container
# ----------------------------------------------------------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=production \
    PORT=3000 \
    BACKEND_PORT=8000 \
    INTERNAL_BACKEND_URL="http://127.0.0.1:8000" \
    CHECKPOINT_PATH=/app/backend/ML/classifier.pt \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Install Node.js 20 runtime, OpenCV system libraries, Pillow libs, and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    libgl1 \
    libglib2.0-0 \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Pre-install CPU-only PyTorch for fast layer caching and small footprint (~150MB vs ~4GB)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install backend Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source and model weights
COPY backend/app/ ./backend/app/
COPY backend/ML/classifier.pt ./backend/ML/classifier.pt

# Copy Next.js standalone build & static files
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static

# Copy orchestrator startup script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Expose frontend port (3000) and backend port (8000)
EXPOSE 3000 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/api/db-status && curl -f http://127.0.0.1:3000/ || exit 1

CMD ["/app/entrypoint.sh"]
