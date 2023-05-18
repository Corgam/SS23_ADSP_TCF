# SS23_ADSP_TCF

An official repository for the "Tangible Climate Futures" project from the ADSP (SS23) course at TU Berlin.

Authors:

- Simon Albani
- Emil Balitzki
- Theodor Barkow
- Alexander Guttenberger
- Florian Jäger
- Frederik Stalschus

## Requirements and setup

1. Install [Docker](https://docs.docker.com/engine/install/).
2. Install Git and clone this repository.

## Run the project

1. Type `docker-compose up --build` to run the backend Express server and the MongoDB database Docker containers.

## Backend API

The backend contains:

- Docker container with an Express.js server, hosted at `localhost:40000`.
- Docker container with MongoDB database, hosted at `localhost:27017`.

Following end-points are possible to use:

| Method | Route          | Required body keys | Optional body keys | Description                                                                                                                    |
| ------ | -------------- | ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| POST   | /datafiles     | title              | description        | Creates a new BasicDataFile inside the database. This is a sample object to test the database.                                 |
| GET    | /datafiles     | -                  | -                  | Returns all BasicDataFiles from the database.                                                                                  |
| GET    | /datafiles/:id | -                  | -                  | Returns a single BasicDataFile with the given ID from the database                                                             |
| PUT    | /datafiles/:id | -                  | values to update   | Updates a single BasicDataFile with the given ID using the provided key-value pairs. Provided values cannot exceed the scheme. |
| DELETE | /datafiles/:id | -                  | -                  | Deletes a single BasicDataFile with the given ID from the database                                                             |

Notes:

- Request body: a JSON object should be provided, with key-values pairs described above.
- File ID: automatically generated by MongoDB and provided when receiving a file.

## Front-End
### Requirements
node.js, root access for angular development

### Compiling
cd folder
ng serve --open