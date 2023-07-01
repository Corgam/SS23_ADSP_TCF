import os

class Config:
    DEBUG = False
    # Add other configuration variables as needed

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    pass

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}

def get_flask_config(mode='development'):
    return config_by_name.get(mode, DevelopmentConfig)
