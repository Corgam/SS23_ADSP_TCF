#!/bin/bash

### MAIN SETUP ###
# Install [Docker](https://docs.docker.com/engine/install/), [Docker Compose](https://docs.docker.com/compose/),
# and run the Docker Daemon (for Ubuntu follow the [Docker Installation Guide](https://docs.docker.com/engine/install/ubuntu/).
echo "[TCF Setup] Installing Docker..."
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg -y
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
# Install all necessary apt packages
echo "[TCF Setup] Installing necessary apt packages..."
sudo apt install python3 -y
sudo apt install python3-pip -y
python3 -m pip install --upgrade pip
python3 -m pip install pipenv
sudo -H pip install -U pipenv
# Update Node to >= 16.0.0 ([Ubuntu Guide](https://github.com/nodesource/distributions))
echo "[TCF Setup] Updating NodeJS..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
# Run the npm setup for our project
echo "[TCF Setup] Running project's setup..."
npm run setup
### MONGODB SCRIPTS ###
# Install [Python 3.x](https://www.python.org/) and pip (Ubuntu: `sudo apt install python3-pip`).
# Install pip packages `pip install pymongo faker`:
# - [PyMongo](https://www.mongodb.com/docs/drivers/pymongo/) this library provides a Python interface for connecting to and interacting with MongoDB.
# - [Faker](https://github.com/joke2k/faker) is a Python library used for generating fake data, such as names, addresses, phone numbers, and more. It is utilized in this script to create realistic-looking data.
echo "[TCF Setup] Installing packages for MongoDB scripts..."
sudo python3 -m pip install pymongo faker
# Check if user is already in the 'docker' group, otherwise add them to it
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
# Finish setup
echo "[TCF Setup] Setup complete!"
echo "Please restart your terminal for the changes to take effect. If you're running Linux in a virtual machine, it may be necessary to restart the virtual machine for changes to take effect."