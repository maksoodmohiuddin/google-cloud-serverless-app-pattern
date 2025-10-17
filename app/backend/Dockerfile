FROM python:3.11-slim

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt /app/requirements.txt

# Install dependencies and clean up
RUN pip3 install --no-cache-dir -r requirements.txt && \
    pip3 install --no-cache-dir gunicorn

# Copy application code
COPY . /app

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "--timeout", "120", "firestore:app"]
