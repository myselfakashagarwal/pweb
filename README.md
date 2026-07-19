# Pweb

Pweb is a localized software delivery pipeline embedded directly inside the application codebase it delivers. Instead of relying on an external CI/CD platform, every lifecycle stage, development, build, deployment, and operational update, is defined as a containerized environment inside a single Docker Compose file that lives in the repository, is versioned alongside the application, and can be instantiated on demand.

## Design Philosophy

The pipeline is a compose file. There is no separate CI/CD platform to configure or keep in sync: `pweb.yml`, a single Docker Compose file checked into the repository, defines every lifecycle stage the application needs. Because the pipeline lives in the same place as the code, infrastructure and application logic version together and can never quietly drift apart.

The environment is the profile. Each lifecycle stage, development, build, deploy, update, is expressed as a Compose profile rather than a separate project or separate tooling. Spawning a stage is a single command: `docker compose -f pweb.yml --profile <name> up`. A profile only brings up the containers relevant to that stage, so stages stay isolated from each other while sharing one configuration file and one version history.

Development mirrors production. The development profile does not run a simplified stand in, it mounts the actual codebase, environment variables, and configuration into a container so the running environment matches production as closely as possible, while still supporting hot reload for iterative changes.

The build environment builds itself out. Rather than depending on an externally managed Jenkins server, the build profile brings up its own Jenkins instance, running Docker in Docker so that Jenkins can build and push container images using the host's own Docker daemon. Two purpose built jobs, `pweb_build` and `pweb_push`, are mounted into that Jenkins instance at startup rather than configured by hand through the UI.

Deployment updates itself. The deploy and update profiles run two containers side by side on a cloud VM: one running the deployed artifact, and one running Watchtower, which polls the image registry, pulls newer builds as they are pushed, and replaces the running container with the same configuration through a graceful shutdown, all without a person triggering the redeploy.

## Architectural Layers

### Development Layer
A Three.js based frontend runs through Docker Compose with the codebase, environment variables, and configuration mounted directly into the container, giving hot reload and a runtime that mirrors production during iterative development.

### Build Layer
Jenkins runs inside its own container with Docker in Docker enabled, so it can build multi stage container images using the host's Docker daemon without a separate build host. Two jobs handle the actual work: `pweb_build` builds the artifact, and `pweb_push` publishes the resulting image to a container registry (GHCR).

### Deploy and Update Layer
A cloud VM runs the deployed artifact alongside Watchtower. Watchtower watches the registry for new pushes, pulls newer images automatically, and replaces the running container in place, preserving its configuration and shutting the old container down cleanly.

## Working

The entire pipeline is described in one file, `pweb.yml`, a Docker Compose file with a profile defined for each lifecycle stage: `development` for local iteration, `build` for producing and publishing artifacts, and `deploy` and `update` for running and automatically refreshing the deployed application on the cloud. Spawning any stage is the same operation regardless of which one it is:

```bash
docker compose -f pweb.yml --profile ${DESIRED_ENV} up
```

Only the containers belonging to the requested profile start, so a developer can bring up just the development environment locally while the build and deploy profiles stay dormant until they are needed, all from the same file and the same clone of the repository.

## Components

| Component | Role | Mechanism |
|---|---|---|
| Development | Local, production like runtime for iterative changes | Docker Compose mounts the codebase, environment variables, and config into a Three.js runtime with hot reload |
| Build | Produces and publishes deployable container images | Jenkins running with Docker in Docker; `pweb_build` builds the artifact, `pweb_push` publishes it to GHCR |
| Deploy | Runs the deployed artifact | A single container on a cloud VM running the published image |
| Update | Keeps the deployed artifact current | Watchtower polls the registry, pulls new images, and replaces the running container with a graceful shutdown |

## Usage

Run these from inside a clone of the repository.

To spawn any environment:
```bash
docker compose -f pweb.yml --profile ${DESIRED_ENV} up
```

To spawn the development environment:
```bash
docker compose -f pweb.yml --profile development up
```

To spawn the build environment and create and push a build:
```bash
docker compose -f pweb.yml --profile build up
```

To spawn the complete pipeline:
```bash
docker compose -f pweb.yml --profile pweb up
```
