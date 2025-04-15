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

function FlatFileToClickHouse() {
	const [settings, setSettings] = useState({
		fileName: "",
		delimiter: ",",
	});
	const [columns, setColumns] = useState([]);
	const [selectedColumns, setSelectedColumns] = useState([]);
	const [tableName, setTableName] = useState("");
	const [status, setStatus] = useState({ type: "", message: "" });
	const [loading, setLoading] = useState(false);

	const handleSettingsChange = (e) => {
		setSettings({ ...settings, [e.target.name]: e.target.value });
	};

	const handleLoadColumns = async () => {
		try {
			setLoading(true);
			const response = await axios.post(
				"http://localhost:8082/api/ingestion/flatfile/columns",
				settings
			);
			setColumns(response.data);
			setStatus({ type: "success", message: "Columns loaded successfully" });
		} catch (error) {
			setStatus({ type: "danger", message: "Failed to load columns" });
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

	const handleImport = async () => {
		try {
			setLoading(true);
			const response = await axios.post(
				"http://localhost:8082/api/ingestion/flatfile-to-clickhouse",
				{
					...settings,
					columns: selectedColumns,
					tableName,
				}
			);
			setStatus({
				type: "success",
				message: `Imported ${response.data} records successfully`,
			});
		} catch (error) {
			setStatus({ type: "danger", message: "Import failed" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2>Flat File to ClickHouse Import</h2>

			<Card className="mb-4">
				<Card.Header>File Settings</Card.Header>
				<Card.Body>
					<Form>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>File Path</Form.Label>
									<Form.Control
										type="text"
										name="fileName"
										value={settings.fileName}
										onChange={handleSettingsChange}
										placeholder="Enter file path"
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Delimiter</Form.Label>
									<Form.Control
										type="text"
										name="delimiter"
										value={settings.delimiter}
										onChange={handleSettingsChange}
										placeholder="Enter delimiter"
									/>
								</Form.Group>
							</Col>
						</Row>
						<Button
							variant="primary"
							onClick={handleLoadColumns}
							disabled={loading || !settings.fileName}
						>
							{loading ? <Spinner size="sm" /> : "Load Columns"}
						</Button>
					</Form>
				</Card.Body>
			</Card>

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
					<Card.Header>Import Settings</Card.Header>
					<Card.Body>
						<Form.Group className="mb-3">
							<Form.Label>Target Table Name</Form.Label>
							<Form.Control
								type="text"
								value={tableName}
								onChange={(e) => setTableName(e.target.value)}
								placeholder="Enter target table name"
							/>
						</Form.Group>
						<Button
							variant="success"
							onClick={handleImport}
							disabled={loading || !tableName}
						>
							{loading ? <Spinner size="sm" /> : "Import"}
						</Button>
					</Card.Body>
				</Card>
			)}

			{status.message && <Alert variant={status.type}>{status.message}</Alert>}
		</div>
	);
}

export default FlatFileToClickHouse;
