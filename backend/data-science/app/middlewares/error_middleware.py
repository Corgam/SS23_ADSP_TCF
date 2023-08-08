"""
Module containing a middleware class to handle custom error responses.
"""

from app.errors import FailedToParseError
from flask import jsonify

class ErrorHandlerMiddleware:
    """
    Middleware class to handle custom error responses for specific exception types.
    """

    def __init__(self, app):
        """
        Initialize the middleware with the Flask application.

        :param app: The Flask application.
        """
        self.app = app
        self.register_error_handler()

    def register_error_handler(self):
        """
        Register custom error handlers for specific exception types.
        """
        @self.app.errorhandler(Exception)
        def handle_generic_error(e):
            """
            Handle generic exceptions with a custom error response.

            :param e: The exception that occurred.
            :return: A JSON response containing an error message and status code.
            """
            response = {"error": "Internal Server Error", "message": str(e)}
            return jsonify(response), 500

        @self.app.errorhandler(FailedToParseError)
        def handle_failed_to_parse_error(e):
            """
            Handle FailedToParseError exceptions with a custom error response.

            :param e: The FailedToParseError exception that occurred.
            :return: A JSON response containing an error message and status code.
            """
            response = {
                "error": "Internal Server Error",
                "message": "Error processing the file",
            }
            return jsonify(response), 500

    def __call__(self, environ, start_response):
        """
        Implement the WSGI application interface.

        :param environ: The WSGI environment dictionary.
        :param start_response: The function to start the response.
        :return: The response from the Flask application.
        """
        return self.app(environ, start_response)
