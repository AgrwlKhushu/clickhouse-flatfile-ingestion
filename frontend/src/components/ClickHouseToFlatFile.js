import React, { useState } from "react";
import {
	Form,
	Button,
	Card,
	Row,
	Col,
	ListGroup,
	Alert,
	Spinner,
} from "react-bootstrap";
import axios from "axios";

function ClickHouseToFlatFile() {
	const [connection, setConnection] = useState({
		host: "",
		port: 8123,
		database: "",
		user: "",
		jwtToken: "",
	});
	const [tables, setTables] = useState([]);
	const [selectedTable, setSelectedTable] = useState("");
	const [columns, setColumns] = useState([]);
	const [selectedColumns, setSelectedColumns] = useState([]);
	const [outputFile, setOutputFile] = useState("");
	const [status, setStatus] = useState({ type: "", message: "" });
	const [loading, setLoading] = useState(false);

	const handleConnectionChange = (e) => {
		setConnection({ ...connection, [e.target.name]: e.target.value });
	};

	const handleConnect = async () => {
		try {
			setLoading(true);
			const response = await axios.post(
				"http://localhost:8082/api/ingestion/clickhouse/tables",
				connection
			);
			setTables(response.data);
			setStatus({ type: "success", message: "Connected successfully" });
		} catch (error) {
			setStatus({ type: "danger", message: "Connection failed" });
		} finally {
			setLoading(false);
		}
	};

	const handleTableSelect = async (table) => {
		setSelectedTable(table);
		try {
			setLoading(true);
			const response = await axios.post(
				"http://localhost:8082/api/ingestion/clickhouse/columns",
				{
					...connection,
					tableName: table,
				}
			);
			setColumns(response.data);
		} catch (error) {
			setStatus({ type: "danger", message: "Failed to fetch columns" });
		} finally {
			setLoading(false);
		}
	};

	const handleColumnToggle = (column) => {
		setSelectedColumns((prev) =>
			prev.includes(column)
				? prev.filter((c) => c !== column)
				: [...prev, column]
		);
	};

	const handleExport = async () => {
		try {
			setLoading(true);
			const response = await axios.post(
				"http://localhost:8082/api/ingestion/clickhouse/export",
				{
					...connection,
					tableName: selectedTable,
					columns: selectedColumns,
					outputFile,
				}
			);
			setStatus({
				type: "success",
				message: `Exported ${response.data} records successfully`,
			});
		} catch (error) {
			setStatus({ type: "danger", message: "Export failed" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2>ClickHouse to Flat File Export</h2>

			<Card className="mb-4">
				<Card.Header>Connection Settings</Card.Header>
				<Card.Body>
					<Form>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Host</Form.Label>
									<Form.Control
										type="text"
										name="host"
										value={connection.host}
										onChange={handleConnectionChange}
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Port</Form.Label>
									<Form.Control
										type="number"
										name="port"
										value={connection.port}
										onChange={handleConnectionChange}
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Database</Form.Label>
									<Form.Control
										type="text"
										name="database"
										value={connection.database}
										onChange={handleConnectionChange}
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>User</Form.Label>
									<Form.Control
										type="text"
										name="user"
										value={connection.user}
										onChange={handleConnectionChange}
									/>
								</Form.Group>
							</Col>
						</Row>
						<Form.Group className="mb-3">
							<Form.Label>JWT Token</Form.Label>
							<Form.Control
								type="password"
								name="jwtToken"
								value={connection.jwtToken}
								onChange={handleConnectionChange}
							/>
						</Form.Group>
						<Button
							variant="primary"
							onClick={handleConnect}
							disabled={loading}
						>
							{loading ? <Spinner size="sm" /> : "Connect"}
						</Button>
					</Form>
				</Card.Body>
			</Card>

			{tables.length > 0 && (
				<Card className="mb-4">
					<Card.Header>Select Table</Card.Header>
					<Card.Body>
						<ListGroup>
							{tables.map((table) => (
								<ListGroup.Item
									key={table}
									action
									active={selectedTable === table}
									onClick={() => handleTableSelect(table)}
								>
									{table}
								</ListGroup.Item>
							))}
						</ListGroup>
					</Card.Body>
				</Card>
			)}

			{columns.length > 0 && (
				<Card className="mb-4">
					<Card.Header>Select Columns</Card.Header>
					<Card.Body>
						<ListGroup>
							{columns.map((column) => (
								<ListGroup.Item key={column}>
									<Form.Check
										type="checkbox"
										label={column}
										checked={selectedColumns.includes(column)}
										onChange={() => handleColumnToggle(column)}
									/>
								</ListGroup.Item>
							))}
						</ListGroup>
					</Card.Body>
				</Card>
			)}

			{selectedColumns.length > 0 && (
				<Card className="mb-4">
					<Card.Header>Export Settings</Card.Header>
					<Card.Body>
						<Form.Group className="mb-3">
							<Form.Label>Output File Path</Form.Label>
							<Form.Control
								type="text"
								value={outputFile}
								onChange={(e) => setOutputFile(e.target.value)}
								placeholder="Enter output file path"
							/>
						</Form.Group>
						<Button
							variant="success"
							onClick={handleExport}
							disabled={loading || !outputFile}
						>
							{loading ? <Spinner size="sm" /> : "Export"}
						</Button>
					</Card.Body>
				</Card>
			)}

			{status.message && <Alert variant={status.type}>{status.message}</Alert>}
		</div>
	);
}

export default ClickHouseToFlatFile;
