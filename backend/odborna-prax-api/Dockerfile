# === BUILD STAGE ===
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# skopírujeme Maven wrapper a pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# aby bolo možné spustiť mvnw
RUN chmod +x mvnw

# stiahneme závislosti (cache layer)
RUN ./mvnw dependency:go-offline

# skopírujeme zdrojáky a buildneme JAR
COPY src src
RUN ./mvnw clean package -DskipTests

# === RUNTIME STAGE ===
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# skopírujeme vytvorený .jar z buildera
COPY --from=builder /app/target/*.jar app.jar

# port, na ktorom beží Spring Boot
EXPOSE 8080

# env premenné pre DB budeme nastavovať v docker-compose
ENTRYPOINT ["java","-jar","app.jar"]
