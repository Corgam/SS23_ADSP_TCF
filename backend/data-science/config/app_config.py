class Config:
    DEBUG = False
    MAX_CONTENT_LENGTH = 2000 * 1024 * 1024  # 2000MB
    # Add other configuration variables as needed


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    pass


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}


def get_flask_config(mode="development"):
    return config_by_name.get(mode, DevelopmentConfig)
