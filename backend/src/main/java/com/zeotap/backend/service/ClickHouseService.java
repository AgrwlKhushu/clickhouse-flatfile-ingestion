package com.zeotap.backend.service;

import com.zeotap.backend.model.ClickHouseConnectionSettings;
import org.springframework.stereotype.Service;
import ru.yandex.clickhouse.ClickHouseConnection;
import ru.yandex.clickhouse.ClickHouseDataSource;
import ru.yandex.clickhouse.settings.ClickHouseProperties;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Service
public class ClickHouseService {

    public List<String> getTables(ClickHouseConnectionSettings connection) throws Exception {
        ClickHouseProperties properties = new ClickHouseProperties();
        properties.setUser(connection.getUser());
        properties.setPassword(connection.getJwtToken());
        properties.setDatabase(connection.getDatabase());

        String url = String.format("jdbc:clickhouse:http://%s:%d/%s", connection.getHost(), connection.getPort(), connection.getDatabase());
        System.out.println("Connecting to: " + url);
        ClickHouseDataSource dataSource = new ClickHouseDataSource(url, properties);
        List<String> tables = new ArrayList<>();

        try (ClickHouseConnection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SHOW TABLES")) {
            while (rs.next()) {
                tables.add(rs.getString(1));
            }
        }
        return tables;
    }

    public List<String> getColumns(ClickHouseConnectionSettings connection, String tableName) throws Exception {
        ClickHouseProperties properties = new ClickHouseProperties();
        properties.setUser(connection.getUser());
        properties.setPassword(connection.getJwtToken());
        properties.setDatabase(connection.getDatabase());

        String url = String.format("jdbc:clickhouse:http://%s:%d/%s", connection.getHost(), connection.getPort(), connection.getDatabase());
        System.out.println("Connecting to: " + url);
        ClickHouseDataSource dataSource = new ClickHouseDataSource(url, properties);
        List<String> columns = new ArrayList<>();

        String escapedTableName = tableName.replace("`", "``");
        try (ClickHouseConnection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("DESCRIBE TABLE `" + escapedTableName + "`")) {
            while (rs.next()) {
                columns.add(rs.getString(1));
            }
        }
        return columns;
    }

    public long exportToFlatFile(ClickHouseConnectionSettings connection, String tableName, String[] columns, String outputFile) throws Exception {
        ClickHouseProperties properties = new ClickHouseProperties();
        properties.setUser(connection.getUser());
        properties.setPassword(connection.getJwtToken());
        properties.setDatabase(connection.getDatabase());

        String url = String.format("jdbc:clickhouse:http://%s:%d/%s", connection.getHost(), connection.getPort(), connection.getDatabase());
        System.out.println("Connecting to: " + url);
        System.out.println("User: " + connection.getUser());
        System.out.println("Database: " + connection.getDatabase());
        
        ClickHouseDataSource dataSource = new ClickHouseDataSource(url, properties);
        
        // Escape table and column names
        String escapedTableName = tableName.replace("`", "``");
        String[] escapedColumns = new String[columns.length];
        for (int i = 0; i < columns.length; i++) {
            escapedColumns[i] = "`" + columns[i].replace("`", "``") + "`";
        }
        String columnList = String.join(", ", escapedColumns);
        String query = "SELECT " + columnList + " FROM `" + escapedTableName + "`";
        System.out.println("Executing query: " + query);
        long recordCount = 0;

        try {
            // Convert the path to use system-specific file separator
            String normalizedPath = outputFile.replace("/", File.separator).replace("\\", File.separator);
            File file = new File(normalizedPath);
            System.out.println("Writing to file: " + file.getAbsolutePath());
            
            // Create parent directories if they don't exist
            File parentDir = file.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                System.out.println("Creating directory: " + parentDir.getAbsolutePath());
                boolean dirCreated = parentDir.mkdirs();
                if (!dirCreated) {
                    throw new Exception("Failed to create directory: " + parentDir.getAbsolutePath());
                }
            }

            // Test file creation
            if (!file.exists()) {
                System.out.println("Creating file: " + file.getAbsolutePath());
                boolean fileCreated = file.createNewFile();
                if (!fileCreated) {
                    throw new Exception("Failed to create file: " + file.getAbsolutePath());
                }
            }

            if (!file.canWrite()) {
                throw new Exception("No write permission for file: " + file.getAbsolutePath());
            }

            try (ClickHouseConnection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query);
                 PrintWriter writer = new PrintWriter(new FileWriter(file))) {
                
                System.out.println("Connected to database, writing data...");
                
                // Write header
                writer.println(String.join(",", columns));

                // Write data
                while (rs.next()) {
                    StringBuilder row = new StringBuilder();
                    for (int i = 0; i < columns.length; i++) {
                        if (i > 0) {
                            row.append(",");
                        }
                        String value = rs.getString(i + 1);
                        // Escape values containing commas
                        if (value != null && value.contains(",")) {
                            value = "\"" + value.replace("\"", "\"\"") + "\"";
                        }
                        row.append(value != null ? value : "");
                    }
                    writer.println(row);
                    recordCount++;
                    
                    if (recordCount % 1000 == 0) {
                        System.out.println("Processed " + recordCount + " records...");
                    }
                }
                System.out.println("Export completed. Total records: " + recordCount);
                return recordCount;
            }
        } catch (Exception e) {
            System.err.println("Error during export: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}