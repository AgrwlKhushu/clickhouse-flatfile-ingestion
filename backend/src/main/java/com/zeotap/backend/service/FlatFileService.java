package com.zeotap.backend.service;

import com.zeotap.backend.model.FlatFileSettings;
import org.springframework.stereotype.Service;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class FlatFileService {

    public List<String> getColumns(FlatFileSettings settings) throws Exception {
        List<String> columns = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(settings.getFileName()))) {
            String headerLine = reader.readLine();
            if (headerLine != null) {
                String[] headers = headerLine.split(settings.getDelimiter());
                for (String header : headers) {
                    columns.add(header.trim());
                }
            }
        }
        return columns;
    }

    public long importToClickHouse(FlatFileSettings settings, String tableName) throws Exception {
        Path filePath = Paths.get(settings.getFileName());
        long lineCount = Files.lines(filePath).count() - 1; // Subtract 1 for header
        // TODO: Implement ClickHouse import logic
        return lineCount;
    }

    public void writeToFile(String outputFile, List<String> headers, List<List<String>> data) throws Exception {
        try (FileWriter out = new FileWriter(outputFile);
             CSVPrinter printer = new CSVPrinter(out, CSVFormat.DEFAULT.withHeader(headers.toArray(new String[0])))) {
            for (List<String> row : data) {
                printer.printRecord(row);
            }
        }
    }
} 