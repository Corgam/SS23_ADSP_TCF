"""
Module containing configuration classes and functions for the Flask application.
"""

class Config:
    """
    Base configuration class containing common configuration variables.
    """
    DEBUG = False
    # Add other configuration variables as needed

class DevelopmentConfig(Config):
    """
    Configuration class for development environment.
    """
    DEBUG = True

class ProductionConfig(Config):
    """
    Configuration class for production environment.
    """
    pass

config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}

def get_flask_config(mode="development"):
    """
    Retrieves the appropriate Flask configuration based on the specified mode.

    :param mode: The mode/environment for which to retrieve the configuration.
    :return: An instance of the appropriate Flask configuration class.
    """
    return config_by_name.get(mode, DevelopmentConfig)
