package com.zeotap.backend.config;

import org.springframework.context.annotation.Configuration;
import ru.yandex.clickhouse.ClickHouseDataSource;
import ru.yandex.clickhouse.settings.ClickHouseProperties;

@Configuration
public class ClickHouseConfig {
    public ClickHouseDataSource getConnection(String host, String port, String database, String user, String password) {
        try {
            ClickHouseProperties properties = new ClickHouseProperties();
            properties.setUser(user);
            properties.setPassword(password);
            properties.setDatabase(database);
            
            // Use HTTP protocol explicitly
            String url = String.format("jdbc:clickhouse:http://%s:%s/%s", host, port, database);
            System.out.println("Creating connection with URL: " + url);
            System.out.println("Database: " + database);
            System.out.println("User: " + user);
            
            return new ClickHouseDataSource(url, properties);
        } catch (Exception e) {
            System.err.println("Error creating ClickHouse connection: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}