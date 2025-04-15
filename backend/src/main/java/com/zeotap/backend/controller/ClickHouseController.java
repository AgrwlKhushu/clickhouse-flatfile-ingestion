package com.zeotap.backend.controller;

import com.zeotap.backend.config.ClickHouseConfig;
import com.zeotap.backend.model.ClickHouseConnectionSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.zeotap.backend.service.ClickHouseService;
import ru.yandex.clickhouse.ClickHouseDataSource;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.*;

@RestController
@RequestMapping("/api/ingestion/clickhouse")
@CrossOrigin(origins = "*")
public class ClickHouseController {

    @Autowired
    private ClickHouseConfig clickHouseConfig;

    @Autowired
    private ClickHouseService clickHouseService;

    @PostMapping("/test-connection")
    public Map<String, String> testConnection(@RequestBody Map<String, Object> config) {
        try {
            ClickHouseConnectionSettings settings = new ClickHouseConnectionSettings();
            settings.setHost((String) config.get("host"));
            settings.setPort(((Number) config.get("port")).intValue());
            settings.setUser((String) config.get("user"));
            settings.setJwtToken((String) config.get("jwtToken"));
            settings.setDatabase((String) config.get("database"));

            System.out.println("Testing connection with settings:");
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
            
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT 1")) {
                
                Map<String, String> response = new HashMap<>();
                if (rs.next()) {
                    response.put("status", "success");
                }
                return response;
            }
        } catch (Exception e) {
            System.err.println("Connection test failed: " + e.getMessage());
            e.printStackTrace();
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}