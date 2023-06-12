import random
import json
from faker import Faker
from utils import generate_coordinates, connect_mongo


def generate_fake_data(fake):
    """Generate fake data using faker"""
    title = fake.sentence()
    description = fake.paragraph()
    dataType = random.choice(["REFERENCED", "NOTREFERENCED"])
    tags = [fake.word() for _ in range(random.randint(1, 5))]
    tags.append("fake")  # To distinguish from real data

    if dataType == "REFERENCED":
        url = fake.url()
        mediaType = random.choice(["VIDEO", "IMAGE"])
        content = {"url": url, "mediaType": mediaType, "coords": generate_coordinates()}
    else:
        content = {"coords": generate_coordinates(), "data": json.loads(fake.json())}

    return {
        "title": title,
        "description": description,
        "dataType": dataType,
        "tags": tags,
        "content": content,
    }


def populate_mongo(mongoDB_url: str, num_documents: int):
    """Generate and insert synthetic data"""
    print(f"Connecting to {mongoDB_url}")
    collection = connect_mongo(mongoDB_url)
    fake = Faker()
    try:
        for _ in range(num_documents):
            collection.insert_one(generate_fake_data(fake))
        print(f"Data seeding completed. Added {num_documents} random documents.")
    except Exception as e:
        print(f"Error inserting document: {e}")
