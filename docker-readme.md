# Docker support

## Requirements

- Docker CE - 19.03.3+
- Docker Compose - 1.19.0+

## How to install or upgrade docker and docker-compose?

#### Docker:

```shell script
sudo curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh
```

**Notice**:If you already have Docker installed, this script can cause trouble. If you installed the current Docker package using this script and are using it again to update Docker. Or use official installation instructions: [Mac](https://docs.docker.com/docker-for-mac/install/), [Windows](https://docs.docker.com/docker-for-windows/install/), [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/), [Other](https://docs.docker.com/install/#supported-platforms).

#### Docker Compose:

For linux:

```shell script
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
```

For Mac or Windows take a look on: [official guides](https://docs.docker.com/compose/install/#install-compose).

## Running containers

You can use docker-compose directly, or the nifty `make` that comes bundled.

### Build images

```shell script
make build
```

#### Starting containers in background:

```shell script
make up
```

#### Start npm watch:

```shell script
make watch
```

#### Run tests

```shell script
make test
```

#### Stop containers

```shell script
make down
```

#### Using docker-compose instead of make

```shell script
docker-compose up
```
