package com.zeotap.backend.controller;

import com.zeotap.backend.model.ClickHouseConnectionSettings;
import com.zeotap.backend.model.FlatFileSettings;
import com.zeotap.backend.service.ClickHouseService;
import com.zeotap.backend.service.FlatFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingestion")
@CrossOrigin(origins = "*")
public class DataIngestionController {

    @Autowired
    private ClickHouseService clickHouseService;

    @Autowired
    private FlatFileService flatFileService;

    @PostMapping("/clickhouse/tables")
    public ResponseEntity<Object> getClickHouseTables(@RequestBody ClickHouseConnectionSettings connection) {
        try {
            // Validate connection settings
            if (connection.getHost() == null || connection.getHost().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Host is required"));
            }
            if (connection.getPort() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid port number"));
            }
            if (connection.getDatabase() == null || connection.getDatabase().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Database is required"));
            }
            if (connection.getUser() == null || connection.getUser().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is required"));
            }

            System.out.println("Attempting to connect with settings:");
            System.out.println("Host: " + connection.getHost());
            System.out.println("Port: " + connection.getPort());
            System.out.println("Database: " + connection.getDatabase());
            System.out.println("User: " + connection.getUser());

            List<String> tables = clickHouseService.getTables(connection);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/clickhouse/columns")
    public ResponseEntity<List<String>> getClickHouseColumns(
            @RequestBody Map<String, String> request) {
        try {
            ClickHouseConnectionSettings connection = new ClickHouseConnectionSettings();
            connection.setHost(request.get("host"));
            connection.setPort(Integer.parseInt(request.get("port")));
            connection.setDatabase(request.get("database"));
            connection.setUser(request.get("user"));
            connection.setJwtToken(request.get("jwtToken"));

            List<String> columns = clickHouseService.getColumns(connection, request.get("tableName"));
            return ResponseEntity.ok(columns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/flatfile/columns")
    public ResponseEntity<List<String>> getFlatFileColumns(@RequestBody FlatFileSettings settings) {
        try {
            List<String> columns = flatFileService.getColumns(settings);
            return ResponseEntity.ok(columns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/clickhouse-to-flatfile")
    public ResponseEntity<Long> exportClickHouseToFlatFile(
            @RequestBody Map<String, Object> request) {
        try {
            ClickHouseConnectionSettings connection = new ClickHouseConnectionSettings();
            connection.setHost((String) request.get("host"));
            connection.setPort((Integer) request.get("port"));
            connection.setDatabase((String) request.get("database"));
            connection.setUser((String) request.get("user"));
            connection.setJwtToken((String) request.get("jwtToken"));

            String tableName = (String) request.get("tableName");
            String[] columns = ((List<String>) request.get("columns")).toArray(new String[0]);
            String outputFile = (String) request.get("outputFile");

            long count = clickHouseService.exportToFlatFile(connection, tableName, columns, outputFile);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/flatfile-to-clickhouse")
    public ResponseEntity<Long> importFlatFileToClickHouse(
            @RequestBody Map<String, Object> request) {
        try {
            FlatFileSettings settings = new FlatFileSettings();
            settings.setFileName((String) request.get("fileName"));
            settings.setDelimiter((String) request.get("delimiter"));
            settings.setSelectedColumns(((List<String>) request.get("columns")).toArray(new String[0]));

            String tableName = (String) request.get("tableName");
            long count = flatFileService.importToClickHouse(settings, tableName);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 