# Multi-stage build for production optimization
FROM python:3.11-slim as backend-builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim as backend

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder stage
COPY --from=backend-builder /root/.local /home/appuser/.local

# Copy application code
COPY backend/ .

# Change ownership to appuser
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Add local packages to PATH
ENV PATH=/home/appuser/.local/bin:$PATH

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend build stage
FROM node:18-alpine as frontend-builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ .

# Build the application
RUN npm run build

# Frontend production stage
FROM nginx:alpine as frontend

# Copy built assets from builder stage
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Development stage for backend
FROM python:3.11-slim as backend-dev

WORKDIR /app

# Install system dependencies including development tools
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    git \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies with dev packages
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
RUN pip install pytest pytest-asyncio httpx

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 8000

# Run in development mode with auto-reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Development stage for frontend
FROM node:18-alpine as frontend-dev

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY frontend/ .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]