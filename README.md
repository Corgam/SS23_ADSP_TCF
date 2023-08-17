# Welcome to the SS23_ADSP_TCF Repository!

This is an official repository for the `Tangible Climate Futures` project for the `(Advanced) Distributed Systems Prototyping SS23` course at TU Berlin.

Project Developers:

- **Simon Albani** (Frontend, User Authentication)
- **Emil Balitzki** (Backend: Public-API, MongoDB, Filtering)
- **Theodor Barkow** (Frontend, Team Leader)
- **Alexander Guttenberger** (Backend: Public-API, Python)
- **Florian Jäger** (Frontend)
- **Frederik Stalschus** (Development Features & Deployment, Backend: Python)

# Project Deployment

Our Project can be deployed in multiple ways, including full-Docker deployment, developer deployment and on Google Cloud Platform (using Terraform).

## Docker Deployment

The full-Docker deployment is the recommended way for using the application, where all of the components are deployed as individual Docker containers. If you are a developer, you can use the Developer Deployment described in section below. While we have tested this deployment on a clean `Ubuntu 22.04 LTS (Jammy Jellyfish, 64-bit)`, it should work on all machines with Docker installed.

Setup:

1. Install [Docker](https://docs.docker.com/engine/install/), [Docker Compose](https://docs.docker.com/compose/) and run the Docker Daemon (for Ubuntu follow the [Docker Guide](https://docs.docker.com/engine/install/ubuntu/) and the [Docker Compose Guide](https://docs.docker.com/compose/install/linux/)).
2. Install Git and clone this repository (`git clone https://github.com/Corgam/SS23_ADSP_TCF`)
3. Inside the root folder run `npm run deploy`, which will deploy all necessary Docker containers (including FE, BE and all microservices).

- Frontend is hosted at `localhost:8080`
- Backend Public API (Express.js) server is hosted at `localhost:40000`, with Swagger end-points documentation accessible at `localhost:40000/docs`.
- All microservices (and their containers) should not be accessible outside the main Public API service.

## Developer Deployment (reduced-Docker)

The developer deployment (or reduced-Docker) is a deployment recommended for developing the project. All components, except MongoDB, are deployed locally (no Docker containers) allowing for easier CI/CD developement. This deployment was tested on a clean `Ubuntu 22.04 LTS (Jammy Jellyfish, 64-bit)`.

Setup:

1. Go to the root folder and run `npm run setup` to install all necessary npm packages.
2. Run `npm run ...`

## Cloud Deployment (GCP using Terraform)

To deploy the complete application with terraform follow these steps ([Install Terraform](https://developer.hashicorp.com/terraform/downloads)):

1. Download the key to your system (be aware to not commit it) from [GCP](https://console.cloud.google.com/iam-admin/serviceaccounts/details/104857105655565907431/keys?project=adsp-387109&supportedpurview=project)
2. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/key.json`
3. Change to deploy directory with `cd deploy`
4. Setup your terraform environment with `terraform init`
5. Apply the infrastructure with `terraform apply`, you can access the app under the provided URL
6. Shutdown with `terraform destroy`

## Useful Scripts for MongoDB

Once the project is set up with the MongoDB container, you can execute some helpful scripts:

### Dependencies

To ensure successful execution of the script, please make sure you have the following dependencies installed:

- Python 3.x: Ensure that you have Python 3.x installed on your system. You can download it from the official Python website: [python.org](https://www.python.org/).
- PyMongo: This library provides a Python interface for connecting to and interacting with MongoDB. You can find more information on the [official site](https://www.mongodb.com/docs/drivers/pymongo/).
- Faker: Faker is a Python library used for generating fake data, such as names, addresses, phone numbers, and more. It is utilized in this script to create realistic-looking data. You can find the library on [GitHub](https://github.com/joke2k/faker).
- You can install both dependencies using pip:

```
pip install pymongo faker
```

- MongoDB: Make sure you have the MongoDB instance running with the command `docker-compose up -d mongodb`.

### Seed the Database with Random Data

To seed the database with random data, use the following command:

```
python scripts/mongo/main.py seed
```

This command connects to `mongodb://localhost:27017/datastore` and adds 10 random documents. You can modify the default settings as follows:

```
python scripts/mongo/main.py seed --num-documents <int> --mongo-url <string>
```

For example:

```
python scripts/mongo/main.py seed --num-documents 20 --mongo-url mongodb://localhost:27017/mydatabase
```

### Cleanup the Database

To clean up the database, simply run the following command:

```
python scripts/mongo/main.py cleanup --mongo-url <string>
```

For example:

```
python scripts/mongo/main.py cleanup --mongo-url mongodb://localhost:27017/mydatabase
```
