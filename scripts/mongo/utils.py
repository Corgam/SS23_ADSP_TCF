import random
from pymongo import MongoClient

COLLECTION_NAME = "datafiles"


def generate_coordinates():
    """Function to generate random coordinates within Berlin area"""
    longitude = random.uniform(13.0832, 13.7612)
    latitude = random.uniform(52.3381, 52.6755)
    return [longitude, latitude]


def connect_mongo(mongoDB_url: str):
    """Connect to mongo and return collection"""
    client = MongoClient(mongoDB_url)
    db = client[mongoDB_url.split("/")[3]]
    return db[COLLECTION_NAME]
