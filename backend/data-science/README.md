# Python Backend Service

## Description
The Python Backend Service is a Flask application that converts `NETCDF` and specifically `CERV2` files into JSON. It is designed to be performant and interact with the public-api.

## Getting Started
These instructions will help you set up the service on your local machine for development and testing purposes.

### Prerequisites
To run this service, you need to have the following installed:

- Python (at least version 3.8)
- Pipenv (optional but recommended for managing dependencies)

### Configuration
The service requires some configuration settings to work correctly. You can find the configuration file at `config/app_config.py`. Adjust the settings as per your requirements before running the service, though it's currently used wheather to run debug mode and at what lenght to split NETCDF files into JSON Objects.

### Steps using pipenv

#### Installation 
Install the required Python dependencies using Pipenv:
```
pipenv install
```
#### Running the Service
To run the service, execute the following command from the root of the project:

```
pipenv run start
```
This will start the service, and you should see output indicating that it's running and ready to accept requests.

#### Testing
The service includes unit tests to ensure its functionality. To run the tests, execute the following command:

```
pipenv run tests
```

### Steps without pipenv

#### Installation without pipenv

If you prefer not to use Pipenv for managing dependencies, you can still install the required packages using `pip` and the `requirements.txt` file provided:

```
pip install -r requirements.txt
```

### Running the Service
To run the service, execute the following command from the root of the project:

```
python3 main.py
```
This will start the service, and you should see output indicating that it's running and ready to accept requests.

#### Testing
The service includes unit tests to ensure its functionality. To run the tests, execute the following command:

```
python3 -m unittest discover tests
```


## Folder Structure
```
.
├── app/                # main application code
│   ├── controllers/    # handle incoming requests and return responses
│   ├── errors/         # custom error classes
│   └── middlewares/    # custom middleware functions for request handling pipeline
│   └── services/       # actual logic
├── config/             # configuration settings
├── tests/              # main application code
├── Dockerfile          # Dockerfile for docker-compose usage
├── main.py             # main entry point
├── Pipfile             # used by Pipenv to manage project dependencies
├── Pipfile.lock
├── README.md
└── requirements.txt    # required dependencies 
```
