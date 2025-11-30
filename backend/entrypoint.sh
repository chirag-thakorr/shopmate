#!/bin/sh
set -e

# wait for Postgres to be reachable
python - <<'PY'
import socket, time, sys
host = 'db'
port = 5432
timeout = 60
s = socket.socket()
for i in range(timeout):
    try:
        s.connect((host, port))
        s.close()
        print("Database reachable")
        break
    except Exception:
        print("Waiting for database... (%d/%d)" % (i+1, timeout))
        time.sleep(1)
else:
    print("Database not reachable after %d seconds" % timeout)
    sys.exit(1)
PY

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting server..."
# if gunicorn available use it, otherwise fallback to runserver (dev-friendly)
if command -v gunicorn >/dev/null 2>&1; then
  echo "Using gunicorn"
  exec gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 3
else
  echo "gunicorn not found — falling back to Django runserver (dev)"
  exec python manage.py runserver 0.0.0.0:8000
fi
