# Welcome to the SS23_ADSP_TCF Repository!

This is an official repository for the `Tangible Climate Futures` project for the `(Advanced) Distributed Systems Prototyping SS23` course at TU Berlin. The description and the structure of our project, together with a detailed structure of implemented JSON objects, can be found in our [wiki](https://github.com/Corgam/SS23_ADSP_TCF/wiki).

Project Developers:

- **Simon Albani** (Frontend, User Authentication)
- **Emil Balitzki** (Backend: Public-API, MongoDB, Filtering)
- **Theodor Barkow** (Frontend, Team Leader)
- **Alexander Guttenberger** (Backend: Public-API, Python)
- **Florian Jäger** (Frontend)
- **Frederik Stalschus** (Development Features & Deployment, Backend: Python)

# Project Deployment

Our Project can be deployed in multiple ways, including full-Docker deployment, developer deployment, and on the Google Cloud Platform (using Terraform).

Setup:

1. Install Git (Ubuntu: `sudo apt update && sudo apt install git`).
2. Clone this repository (`git clone https://github.com/Corgam/SS23_ADSP_TCF`).
3. Go the the root folder (Ubuntu: `cd SS23_ADSP_TCF`) and run the .sh script (Ubuntu: `sh setup.sh`, do not use sudo).
4. Please restart your terminal for the changes to take effect. If you're running Linux in a virtual machine, it may be necessary to restart the virtual machine for changes to take effect.
5. Inside `frontend/src/environments/` folder, fill in the Firebase API keys in files: `environment.ts` and `environment.development.ts`

Note: We use `.sh` script for automatic setup. In case of errors, or manual installation, follow the steps descripted in the `setup.sh` file.

## Docker Deployment

The full-Docker deployment is the recommended way for using the application, where all of the components are deployed as individual Docker containers. If you are a developer, you can use the Developer Deployment described in the section below. While we have tested this deployment on a clean `Ubuntu 22.04 LTS (Jammy Jellyfish, 64-bit)`, it should work on all machines with Docker installed.

1. Go to the root folder `cd SS23_ADSP_TCF` and run `npm run deploy`, which will deploy all necessary Docker containers (including FE, BE, and all microservices). Make sure that the Docker Service is running (`docker ps`).

Notes:

- BE is located at `localhost:40000` with Swagger Docs at `localhost:40000/docs`
- FE is located at `localhost:8080`
- MongoDB is located at `localhost:27017` inside a Docker Container
- Python Microservice is located at `localhost:50000` with Swagger Docs at `localhost:50000/docs`

## Developer Deployment (reduced-Docker)

The developer deployment (or reduced-Docker) is a deployment recommended for developing the project. All components, except MongoDB, are deployed locally (no Docker containers) allowing for easier development (live reloading). This deployment was tested on a clean `Ubuntu 22.04 LTS (Jammy Jellyfish, 64-bit)`.

1. Run `npm run dev:all` to run all components as the dev version (live reloading) as background processes. The MongoDB will be still deployed as a Docker container, thus make sure that the Docker Service is running (`docker ps`).

Notes:

- BE is located at `localhost:40000` with Swagger Docs at `localhost:40000/docs`
- FE is located at `localhost:8080`
- MongoDB is located at `localhost:27017` inside a Docker Container
- Python Microservice is located at `localhost:50000` with Swagger Docs at `localhost:50000/docs`
- The processes for all components will be run in a single terminal, thus for easier development of individual components, use specific npm scripts, described at the bottom of the README. These scripts will allow for the deployment of individual services in separate terminals.

## Cloud Deployment (GCP using Terraform)

This cloud deployment will deploy our complete project on GCP using Terraform. It is intended to be used as a production-ready deployment, thus making the project publicly available.

1. First install the [Terraform](https://developer.hashicorp.com/terraform/downloads).
2. Download the GCP access keys (be aware to not commit them) from [GCP](https://cloud.google.com/iam/docs/keys-create-delete) and save them as a JSON file on your machine.
3. Create an environment variable `GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/key.json`
4. Inside `frontend/src/environments/` folder, fill in the Firebase API keys in files: `environment.ts` and `environment.development.ts`
5. Inside our project, go to the `deploy` directory using `cd deploy`
6. Setup your terraform environment with `terraform init`
7. Apply the infrastructure with `terraform apply`, you can access the app under the provided above URLs.
8. For shutdown use `terraform destroy`.

# Useful Scripts for MongoDB

Once the project is set up, and the MongoDB container is running, you can execute some helpful scripts:

Note: Make sure you have the MongoDB instance running.

## Seed the Database with Random Data

To seed the database with random documents, use the following command `python3 scripts/mongo/main.py seed`

Options:

- `--num-documents <int>` - the number of documents to seed (default 10).
- `--mongo-url <string>`- the URL to the database (default `mongodb://localhost:27017/datastore`)
- Example: `python3 scripts/mongo/main.py seed --num-documents 20 --mongo-url mongodb://localhost:27017/mydatabase`

## Cleanup the Database

To clean up the database, simply run the following command `python3 scripts/mongo/main.py cleanup --mongo-url <string>`

- Example: `python3 scripts/mongo/main.py cleanup --mongo-url mongodb://localhost:27017/datastore`

# NPM Scripts Documentation

Here is a list and description of all npm scripts included in the main `package.json` file:

- `npm run setup` - Installes all necessary npm packages, for both the FE and BE.
- `npm run setup:frontend` - Installes all necessary npm packages for just the FE.
- `npm run setup:backend` - Installes all necessary npm packages for just the BE.
- `npm run setup:python` - Installes all required Python libraries for the Python Microservice.
- `npm run deploy` - Deploys the whole app in Docker containers, including FE, BE, MongoDB, and Python Microservice.
- `npm run deploy:mongo` - Deploys just the MongoDB Docker container.
- `npm run dev:backend` - Deploys the MongoDB and Python Docker containers and the dev version (live reloading) of the BE.
- `npm run dev:frontend` - Deploys the dev version (live reloading) of the FE.
- `npm run dev:ds` - Deploys just the Python Microservice as the dev version (live reloading).
- `npm run dev:pub` - Deploys just the BE as the dev version (live reloading).
- `npm run dev:all` - Deploys the whole app as the dev version (live reloading) as background processes.
