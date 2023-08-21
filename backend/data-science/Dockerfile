# Use a base Python image
FROM python:3.10.12-slim-bookworm

# Install pipenv
RUN pip install pipenv

## Environment variables
ENV STAGE=production
ENV PORT=8800

# Set the working directory inside the container
WORKDIR /app

# Copy the Pipfile and Pipfile.lock to the container
COPY /backend/data-science/Pipfile* ./

# Initialize pipenv environment with user-specific location
ENV PIPENV_VENV_IN_PROJECT=1

# Install project dependencies
RUN pipenv install --deploy --ignore-pipfile

# Copy source code and build dependencies
COPY backend/data-science/app ./app
COPY backend/data-science/config ./config
COPY backend/data-science/main.py ./

# Expose the port on which the microservice will run
EXPOSE "${PORT}"

# change to the non-root user
USER 1000

# Run the microservice with non-root user
CMD pipenv run gunicorn main:app --bind 0.0.0.0:${PORT}
