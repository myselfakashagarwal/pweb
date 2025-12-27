FROM docker:dind as docker-source

# Final stage - Jenkins with Docker
FROM jenkins/jenkins:lts
USER root

# Copy Docker binaries from docker image
COPY --from=docker-source /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker-source /usr/local/bin/docker-compose /usr/local/bin/docker-compose

# Add jenkins to docker group
RUN groupadd -f docker && usermod -aG docker jenkins
