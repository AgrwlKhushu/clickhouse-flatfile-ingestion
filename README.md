# ClickHouse Data Ingestion Tool

This project provides a web-based interface for managing data transfers between ClickHouse databases and flat files (CSV). It consists of a Spring Boot backend and a React frontend.

## Features

- Connect to ClickHouse databases using secure authentication
- List available tables from ClickHouse
- View and select columns from ClickHouse tables
- Export data from ClickHouse to CSV files
- Import data from CSV files to ClickHouse
- Column mapping and data type validation

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Node.js 14 or higher
- npm 6 or higher
- ClickHouse server instance

## Project Structure

```
clickhouse-first/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │   └── pom.xml
│   └── frontend/               # React frontend
│       ├── src/
│       ├── package.json
│       └── package-lock.json
```

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies and build:

   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend server will start on `http://localhost:8082`.

### Backend Configuration

The backend uses the following configuration:

- Port: 8082 (configurable in `application.properties`)
- CORS enabled for frontend integration
- Lombok for reducing boilerplate code
- Spring Web for REST endpoints

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will start on `http://localhost:3000`.

## API Endpoints

### ClickHouse Operations

1. Test Connection

   ```
   POST /api/clickhouse/test-connection
   ```

2. Get Tables

   ```
   POST /api/ingestion/clickhouse/tables
   ```

3. Get Columns

   ```
   POST /api/ingestion/clickhouse/columns
   ```

4. Export to Flat File

   ```
   POST /api/ingestion/clickhouse/export
   ```

5. Import from Flat File
   ```
   POST /api/ingestion/clickhouse/import
   ```

### Request Body Examples

1. Connection Settings:

   ```json
   {
   	"host": "localhost",
   	"port": 8123,
   	"database": "default",
   	"user": "default",
   	"jwtToken": "your-token"
   }
   ```

2. Export Request:
   ```json
   {
   	"connectionSettings": {
   		"host": "localhost",
   		"port": 8123,
   		"database": "default",
   		"user": "default",
   		"jwtToken": "your-token"
   	},
   	"tableName": "your_table",
   	"columns": ["column1", "column2"],
   	"outputFile": "export.csv"
   }
   ```

## Usage Guide

1. **Connecting to ClickHouse**

   - Enter your ClickHouse connection details
   - Click "Test Connection" to verify
   - Upon successful connection, you can proceed with operations

2. **Exporting Data**

   - Select the source table from the dropdown
   - Choose columns to export
   - Specify the output file name
   - Click "Export" to start the process

3. **Importing Data**
   - Select the CSV file to import
   - Choose the target table
   - Map columns between source and target
   - Click "Import" to start the process

## Error Handling

The application includes comprehensive error handling for:

- Connection failures
- Invalid credentials
- File operation errors
- Data type mismatches
- Network timeouts

## Security Considerations

- JWT token-based authentication
- Secure password handling
- Input validation
- CORS configuration
- File access restrictions

## Troubleshooting

1. **Connection Issues**

   - Verify ClickHouse server is running
   - Check credentials and connection details
   - Ensure firewall settings allow connection

2. **Export/Import Failures**
   - Check file permissions
   - Verify column data types match
   - Ensure sufficient disk space

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
