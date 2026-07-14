FROM maven:3.9-eclipse-temurin-8 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -Pdocker clean package -DskipTests

FROM eclipse-temurin:8-jre
WORKDIR /app
COPY --from=build /app/target/api-topaz.war app.war
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.war"]
