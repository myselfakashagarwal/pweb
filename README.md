<img width="849" alt="Screenshot 2024-05-27 at 5 56 37 PM" src="https://github.com/myselfakashagarwal/pweb/assets/106314226/a2505e19-4b3b-40c3-aa4b-1e2228ad0831">

## About  
A web development codebase integrated with a modularized CI/CD pipeline.

## Components  
- **Develop** – Dev codebase running via Docker Compose, mimicking production for development.  
- **Build** – Jenkins with build and push jobs using Docker-in-Docker (DIND) to build and push artifacts.  
- **Deploy** – Pulling the artifact and running it.  
- **Update** – A background service that updates to newer versions automatically.

### Develop  
The website is built using [Three.js](https://threejs.org/), a WebGL framework. For development purposes, Docker Compose is used to mount the codebase along with environment variables and configurations, providing features such as hot reload.

### Build  
Jenkins and Docker are used together in a multi-stage build process. Jenkins jobs like `pweb_build` (which uses the host's Docker daemon to build the artifact) and `pweb_push` (which pushes the build to a defined registry) are mounted during the artifact build.

### Deploy & Update  
A cloud VM instance with Docker is kept running with two containers:
- One for the deployable build created in the build phase.  
- The other for **Watchtower**, which handles automatic deployments. It monitors the registry and pulls new builds (on push), replacing the old versions with the same configurations and performing graceful shutdowns.

## Working  
The entire pipeline is abstracted in `pweb.yml`, a Docker Compose file with multiple configured environments. Profiles are defined to spawn different environments as needed—such as `development` for local development, `build` for the build phase, and `deploy` and `update` for deployment on the cloud.

## Use
(assumed user in present inside the cloned repo)

To spawn the environment ANY <syntax>
```bash
docker-compose -f pweb.yml --profile ${DESIRED-ENV} up
```

To spawn the environment for development <command>
```bash
docker-compose -f pweb.yml --profile development up
```

To spawn the environment for creatinfg and pushing builds <command>
```bash
docker-compose -f pweb.yml --profile build up
```

To spawn complete pipeline <command>
```
docker-compose -f pweb.yml --profile pweb up
```

<hr>
