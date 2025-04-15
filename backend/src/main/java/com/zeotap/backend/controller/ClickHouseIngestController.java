package com.zeotap.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.zeotap.backend.config.ClickHouseConfig;
import com.zeotap.backend.model.ClickHouseConnectionSettings;
import org.apache.commons.csv.*;
import ru.yandex.clickhouse.ClickHouseDataSource;

import java.io.*;
import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api/ingest")
public class ClickHouseIngestController {

    @Autowired
    private ClickHouseConfig clickHouseConfig;

    @PostMapping("/csv-to-clickhouse")
    @CrossOrigin(origins = "*")
    public Map<String, Object> uploadCSV(
            @RequestParam("file") MultipartFile file,
            @RequestParam String url,
            @RequestParam String user,
            @RequestParam String jwt,
            @RequestParam String table
    ) {
        int rowsInserted = 0;

        try (Reader reader = new InputStreamReader(file.getInputStream())) {
            ClickHouseConnectionSettings settings = new ClickHouseConnectionSettings();
            settings.setHost(url);
            settings.setPort(8123); // Default ClickHouse HTTP port
            settings.setUser(user);
            settings.setJwtToken(jwt);
            settings.setDatabase("default"); // Default database

            System.out.println("Creating connection with settings:");
            System.out.println("Host: " + settings.getHost());
            System.out.println("Port: " + settings.getPort());
            System.out.println("Database: " + settings.getDatabase());
            System.out.println("User: " + settings.getUser());

            ClickHouseDataSource dataSource = clickHouseConfig.getConnection(
                settings.getHost(),
                String.valueOf(settings.getPort()),
                settings.getDatabase(),
                settings.getUser(),
                settings.getJwtToken()
            );
            
            try (Connection conn = dataSource.getConnection()) {
                // Log connection success
                System.out.println("✅ Connected to ClickHouse");

                // Parse CSV
                CSVParser csvParser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader);
                List<String> headers = csvParser.getHeaderNames();

                if (headers.isEmpty()) {
                    System.out.println("⚠️ No headers found in CSV.");
                    return Map.of("status", "error", "message", "Empty header row in CSV");
                }

                // Build insert SQL
                StringBuilder sql = new StringBuilder("INSERT INTO ").append(table).append(" (");
                sql.append(String.join(", ", headers)).append(") VALUES (");
                sql.append("?,".repeat(headers.size()));
                sql.setLength(sql.length() - 1); // remove last comma
                sql.append(")");

                System.out.println("📥 Insert Query: " + sql);

                PreparedStatement stmt = conn.prepareStatement(sql.toString());

                for (CSVRecord record : csvParser) {
                    for (int i = 0; i < headers.size(); i++) {
                        stmt.setString(i + 1, record.get(i));
                    }
                    stmt.addBatch();
                    rowsInserted++;
                }

                if (rowsInserted > 0) {
                    stmt.executeBatch();
                    System.out.println("✅ Inserted " + rowsInserted + " rows");
                } else {
                    System.out.println("⚠️ No rows found in CSV");
                }
            }

            return Map.of("status", "success", "rowsInserted", rowsInserted);

        } catch (Exception e) {
            System.err.println("Error during CSV upload: " + e.getMessage());
            e.printStackTrace();
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}