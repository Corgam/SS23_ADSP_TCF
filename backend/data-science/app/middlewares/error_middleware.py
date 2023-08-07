from app.errors import FailedToParseError
from flask import jsonify


class ErrorHandlerMiddleware:
    def __init__(self, app):
        self.app = app
        self.register_error_handler()

    def register_error_handler(self):
        @self.app.errorhandler(Exception)
        def handle_generic_error(e):
            response = {"error": "Internal Server Error", "message": str(e)}
            return jsonify(response), 500

        @self.app.errorhandler(FailedToParseError)
        def handle_failed_to_parse_error(e):
            response = {
                "error": "Internal Server Error",
                "message": "Error processing the file",
            }
            return jsonify(response), 500

    def __call__(self, environ, start_response):
        return self.app(environ, start_response)
