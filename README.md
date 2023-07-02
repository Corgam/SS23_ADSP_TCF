# SS23_ADSP_TCF

An official repository for the "Tangible Climate Futures" project from the ADSP (SS23) course at TU Berlin.

Authors:

- Simon Albani
- Emil Balitzki
- Theodor Barkow
- Alexander Guttenberger
- Florian Jäger
- Frederik Stalschus

## Project setup

1. Install [Docker](https://docs.docker.com/engine/install/) and run the docker daemon.
2. Install [Node.js](https://nodejs.org/en)
3. Install Git and clone this repository (`git clone https://github.com/Corgam/SS23_ADSP_TCF`)
4. Inside the root folder run `npm run setup`, which will install all required npm packages.

## Deploy the project

1. Type `npm run deploy:frontend` to deploy the frontend.
2. Open a new cmd and type `npm run deploy:backend` to deploy the backend.

- Frontend is hosted at `localhost:4200`
- Express.js server is hosted at `localhost:8080`, with Swagger end-points documentation accessible at `localhost:8080/docs`.
- Docker container with MongoDB database is hosted at `localhost:27017`.

NOTE: To deploy the **dev** version use `npm run deploy:dev:frontend`/`npm run deploy:dev:backend`.

## Backend

The documentation of the backend API and all of the end-points is accessible at `localhost:8080/docs` after deploying the project.

Notes:

- File ID: automatically generated by MongoDB and provided when receiving a file.

### Backend structure

All of the code is situated within the `backend/src` folder.
Additionally, BE uses types specified in the `common/types` folder.

- `config` contains all config variables used by the BE code
- `controllers` includes all routes logic and routing code
- `errors` contains declaration of custom errors, used by the error middleware
- `middlewares` contains all middleware layers used by the express server
- `models` contains schemas for the databases
- `services` contains the algorithms that fulfill the business requirements

## Front-End

### Frontend structure

All of the code is situated within the `frontend/src` folder.

- `app` includes the base application, routing logic, and module for the material-components
- `assets` includes pictures, external icons, ...
- `core` contains essential logic for user access management, shared services
- `lib` contains the high-level components (such as pages) and components which are used ones
- `shared` contains low-level components, which are shared accross different components, such as the map or tables

## Useful scripts for mongoDB
Once the project is up with the mongoDB container you can run some useful scripts:

### Dependencies
To run the script successfully, ensure you have the following dependencies installed:
- Python 3.x: Make sure you have Python 3.x installed on your system. You can download it from the official Python website: [python.org](https://www.python.org/).
- PyMongo: This library provides a Python interface for connecting to and interacting with MongoDB ([Offical Site](https://www.mongodb.com/docs/drivers/pymongo/)). 
- Faker: Faker is a Python library that generates fake data, such as names, addresses, phone numbers, and more. It is used in this script to create realistic-looking data ([Github Repo](https://github.com/joke2k/faker)).
- You can install both using pip:
```
pip install pymongo faker
```
- MongoDB: Make sure you are running the mongo instance with `docker-compose up -d mongodb.

### Populate the database with random data:
`npm run mongo:populate` will connect to mongodb://localhost:27017/datastore and add 10 random documents.
This default setting can also be modified like so: 
```
npm run mongo:populate -- --num-documents <int> --mongo-url <string>
```

### Cleanup the database
Just run `npm run mongo:cleanup -- --mongo-url <string>`

## Deployment on GCP
To deploy the complete application with terraform follow these steps ([Install Terraform](https://developer.hashicorp.com/terraform/downloads)):
1. Download the key to your system (be aware to not commit it) from [GCP](https://console.cloud.google.com/iam-admin/serviceaccounts/details/104857105655565907431/keys?project=adsp-387109&supportedpurview=project)
2. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/key.json`
3. Change to deploy directory with `cd deploy`
4. Setup your terraform environment with `terraform init`
5. Apply the infrastructure with `terraform apply`, you can access the app under the provided URL
6. Shutdown with `terraform destroy`
