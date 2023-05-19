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

1. Type `npm run deploy_frontend` to deploy the frontend.
2. Open new cmd and type `npm run deploy_backend` to deploy the backend.

- Frontend is hosted at `localhost:4200`
- Express.js server is hosted at `localhost:8080`.
- Docker container with MongoDB database is hosted at `localhost:27017`.

NOTE: To deploy the **dev** version use `npm run deploy_dev_frontend`/`npm run deploy_dev_backend`.

## Backend API

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

### Frontend structure

All of the code is situated within the `frontend/src` folder.

- `app` includes the base application, routing logic, and module for the material-components
- `assets` includes pictures, external icons, ...
- `core` containes essential logic for user access management, shared services
- `lib` containes the high-level components (such as pages) and components which are used ones
- `shared` containes low-level components, which are shared accross different components, such as the map or tables
