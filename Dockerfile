FROM node:14-buster

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install base dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION lts/fermium

# Ensure NVM_DIR exists
RUN mkdir -p $NVM_DIR;

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

RUN apt-get -y update
RUN apt-get install -y g++ make python2
RUN update-alternatives --install /usr/bin/python python /usr/bin/python2 1
RUN update-alternatives --config python
RUN npm config set python python

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

RUN npm run-script build

EXPOSE  9012
CMD npm run watch
