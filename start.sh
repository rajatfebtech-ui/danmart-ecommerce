#!/bin/bash
# Start the mock API (Python) + React dev server together.
# Press Ctrl+C to stop both.

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check Node is installed
if ! command -v node &>/dev/null; then
  echo ""
  echo "  ERROR: Node.js is not installed."
  echo "  Install it with nvm (no admin needed):"
  echo ""
  echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
  echo "    source ~/.zshrc"
  echo "    nvm install --lts"
  echo ""
  echo "  Then run ./start.sh again."
  exit 1
fi

# Install frontend deps if needed
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$PROJECT_DIR" && npm install
fi

echo "Starting mock API on http://localhost:3001 ..."
python3 "$PROJECT_DIR/mock-server/server.py" &
MOCK_PID=$!

sleep 1

echo "Starting React app on http://localhost:5173 ..."
cd "$PROJECT_DIR" && npm run dev &
VITE_PID=$!

trap "echo ''; echo 'Stopping...'; kill $MOCK_PID $VITE_PID 2>/dev/null; exit" INT TERM
wait
