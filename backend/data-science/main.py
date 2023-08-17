import os

from app import create_app
from config.app_config import get_flask_config

# Get the mode from the environment variables
mode = os.environ.get("STAGE", "development")
port = os.environ.get("PORT", "50000")
host = os.environ.get("HOST", "localhost")

config = get_flask_config(mode)

# Create an instance of the Flask application
app = create_app(mode, config)

if __name__ == "__main__":
    print(f"Running in {mode} mode")
    print(f"health check is available at http://{host}:{port}/health")
    print(f"documentation is available at http://{host}:{port}/docs")
    print(f"api is available at http://{host}:{port}/api")

    # Start the Flask application
    app.run(host, port)
