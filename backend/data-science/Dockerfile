# Use a base Python image
FROM python:3.8-slim-buster

# Install pipenv
RUN pip install pipenv

## Environment variables
ENV STAGE=production
ENV PORT=8800

# Set the working directory inside the container
WORKDIR /app

# Copy the Pipfile and Pipfile.lock to the container
COPY /backend/data-science/Pipfile* ./

# Initialize pipenv environment
RUN pipenv --python 3.8

# Install project dependencies
RUN pipenv install --system --deploy --ignore-pipfile

# Copy source code and build dependencies
COPY backend/data-science/app ./app
COPY backend/data-science/config ./config
COPY backend/data-science/main.py ./

# Expose the port on which the microservice will run
EXPOSE "${PORT}"

# Set the entry point command to start the microservice using Gunicorn
CMD pipenv run gunicorn main:app --bind 0.0.0.0:${PORT}
