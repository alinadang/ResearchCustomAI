#!/bin/bash
# Start the FastAPI backend server
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
  source .venv/bin/activate
fi

echo "Starting FastAPI backend on http://127.0.0.1:8000"
echo "API docs available at http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to stop."
echo ""

.venv/bin/python3 -m uvicorn app.main:app --reload --port 8000
