### MAIN SETUP ###
# Install [Docker](https://docs.docker.com/engine/install/), [Docker Compose](https://docs.docker.com/compose/),
# and run the Docker Daemon (for Ubuntu follow the [Docker Installation Guide](https://docs.docker.com/engine/install/ubuntu/).
echo "[TCF Setup] Installing Docker..."
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
# Install all necessary apt packages
echo "[TCF Setup] Installing necessary apt packages..."
sudo apt install python3-pip
# Update Node to >= 16.0.0 ([Ubuntu Guide](https://github.com/nodesource/distributions))
echo "[TCF Setup] Updating NodeJS..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
# export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install node
# Run the npm setup for our project
echo "[TCF Setup] Running project's setup..."
npm run setup

### MONGODB SCRIPTS ###
# Install [Python 3.x](https://www.python.org/) and pip (Ubuntu: `sudo apt install python3-pip`).
# Install pip packages `pip install pymongo faker`:
# - [PyMongo](https://www.mongodb.com/docs/drivers/pymongo/) this library provides a Python interface for connecting to and interacting with MongoDB.
# - [Faker](https://github.com/joke2k/faker) is a Python library used for generating fake data, such as names, addresses, phone numbers, and more. It is utilized in this script to create realistic-looking data.
echo "[TCF Setup] Installing packages for MongoDB scripts..."
sudo pip install pymongo faker


#5. On Ubuntu: Add current user to the docker group `sudo usermod -aG docker $USER`, open a new terminal window/tab and run the following command to activate the new group membership: `newgrp docker`