import argparse
from populateMongo import populate_mongo
from cleanupMongo import cleanup_mongo

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Support for local mongo development")
    parser.add_argument(
        "function", choices=["populate", "cleanup"], help="Function to execute"
    )
    parser.add_argument(
        "-u",
        "--mongo-url",
        type=str,
        default="mongodb://localhost:27017/datastore",
        help="MongoDB URL",
    )
    parser.add_argument(
        "-n",
        "--num-documents",
        type=int,
        default=10,
        help="Number of documents to create",
    )
    args = parser.parse_args()

    if args.function == "populate":
        populate_mongo(args.mongo_url, args.num_documents)
    elif args.function == "cleanup":
        cleanup_mongo(args.mongo_url)
