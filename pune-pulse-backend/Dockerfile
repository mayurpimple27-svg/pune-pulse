# Multi-stage build for Spring Boot backend
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Build application
COPY src ./src
RUN mvn -q -DskipTests package

# Runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# App runs on port 8090 (configured in application.yml)
EXPOSE 8090

# Copy Spring Boot fat jar from builder stage
COPY --from=builder /app/target/pune-pulse-backend-0.0.1-SNAPSHOT.jar app.jar

# Optional runtime JVM flags: -e JAVA_OPTS="-Xms256m -Xmx512m"
ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
