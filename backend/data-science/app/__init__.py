from flask import Flask
from flask_restx import Api
from app.middlewares import ErrorHandlerMiddleware

def add_health_check_endpoint(app):
    @app.route('/health')
    def health_check():
        return { "status": "healthy" }
    
def add_api_routes(app):
    api = Api(
        app,
        version="1.0",
        title="Python data science microservice",
        description="Microservice for data science operations",
        doc="/docs",
        prefix="/api"
    )

    # Import the controllers
    from app.controllers.data_processing_controller import api as data_processing_api

    # Add namespaces to the API
    api.add_namespace(data_processing_api)

def create_app(mode, config):
    app = Flask(__name__)
    app.config.from_object(config)

    add_health_check_endpoint(app)
    add_api_routes(app)
    ErrorHandlerMiddleware(app)

    return app
