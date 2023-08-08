"""
Module responsible for creating the Flask application and setting up routes.
"""

from flask import Flask
from flask_restx import Api
from app.middlewares import ErrorHandlerMiddleware

def add_health_check_endpoint(app):
    """
    Adds a health check endpoint to the Flask application.

    :param app: The Flask application.
    """
    @app.route("/health")
    def health_check():
        """
        Health check endpoint to verify the status of the application.

        :return: A JSON response indicating the health status.
        """
        return {"status": "healthy"}

def add_api_routes(app):
    """
    Adds API routes and namespaces to the Flask application.

    :param app: The Flask application.
    """
    api = Api(
        app,
        version="1.0",
        title="Python data science microservice",
        description="Microservice for data science operations",
        doc="/docs",
        prefix="/api",
    )

    # Import the controllers
    from app.controllers.data_processing_controller import api as data_processing_api

    # Add namespaces to the API
    api.add_namespace(data_processing_api)

def create_app(mode, config):
    """
    Creates and configures a Flask application.

    :param mode: The mode/environment in which the application is running.
    :param config: The configuration object for the application.
    :return: The configured Flask application.
    """
    app = Flask(__name__)
    app.config.from_object(config)

    # Add health check endpoint
    add_health_check_endpoint(app)

    # Add API routes and namespaces
    add_api_routes(app)

    # Apply the error handling middleware
    ErrorHandlerMiddleware(app)

    return app
