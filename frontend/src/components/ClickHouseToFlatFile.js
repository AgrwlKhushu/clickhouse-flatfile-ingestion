import React, { useState } from "react";
import axios from "axios";

const ClickHouseToFlatFile = () => {
	const [connectionSettings, setConnectionSettings] = useState({
		host: "",
		port: "",
		database: "",
		user: "",
		jwtToken: "",
	});
	const [tables, setTables] = useState([]);
	const [selectedTable, setSelectedTable] = useState("");
	const [columns, setColumns] = useState([]);
	const [selectedColumns, setSelectedColumns] = useState([]);
	const [outputFile, setOutputFile] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleConnect = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			// Ensure host doesn't have protocol prefix
			const cleanHost = connectionSettings.host.replace(/^https?:\/\//, "");

			const response = await axios.post(
				"http://localhost:8082/api/ingestion/clickhouse/tables",
				{
					...connectionSettings,
					host: cleanHost,
					port: parseInt(connectionSettings.port, 10),
				}
			);
			setTables(response.data);
			setSuccess("Successfully connected to ClickHouse");
		} catch (err) {
			setError(
				err.response?.data?.error ||
					err.response?.data?.message ||
					"Failed to connect to ClickHouse"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleTableSelect = async (table) => {
		setSelectedTable(table);
		setLoading(true);
		setError("");

		try {
			const response = await axios.post(
				"http://localhost:8082/api/ingestion/clickhouse/columns",
				{
					...connectionSettings,
					tableName: table,
				}
			);
			setColumns(response.data);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to fetch columns");
		} finally {
			setLoading(false);
		}
	};

	const handleExport = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await axios.post(
				"http://localhost:8082/api/ingestion/clickhouse/export",
				{
					connectionSettings,
					tableName: selectedTable,
					columns: selectedColumns,
					outputFile,
				}
			);
			setSuccess("Data exported successfully");
		} catch (err) {
			setError(err.response?.data?.message || "Export failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="card">
				<h2 className="mb-4">Export from ClickHouse</h2>

				{error && <div className="alert alert-error">{error}</div>}
				{success && <div className="alert alert-success">{success}</div>}

				<form onSubmit={handleConnect} className="mb-4">
					<div className="grid grid-2">
						<div className="form-group">
							<label className="form-label">Host</label>
							<input
								type="text"
								className="form-control"
								value={connectionSettings.host}
								onChange={(e) =>
									setConnectionSettings({
										...connectionSettings,
										host: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Port</label>
							<input
								type="number"
								className="form-control"
								value={connectionSettings.port}
								onChange={(e) =>
									setConnectionSettings({
										...connectionSettings,
										port: e.target.value,
									})
								}
								required
							/>
						</div>
					</div>

					<div className="grid grid-2">
						<div className="form-group">
							<label className="form-label">Database</label>
							<input
								type="text"
								className="form-control"
								value={connectionSettings.database}
								onChange={(e) =>
									setConnectionSettings({
										...connectionSettings,
										database: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="form-group">
							<label className="form-label">User</label>
							<input
								type="text"
								className="form-control"
								value={connectionSettings.user}
								onChange={(e) =>
									setConnectionSettings({
										...connectionSettings,
										user: e.target.value,
									})
								}
								required
							/>
						</div>
					</div>

					<div className="form-group">
						<label className="form-label">JWT Token</label>
						<input
							type="password"
							className="form-control"
							value={connectionSettings.jwtToken}
							onChange={(e) =>
								setConnectionSettings({
									...connectionSettings,
									jwtToken: e.target.value,
								})
							}
							required
						/>
					</div>

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? "Connecting..." : "Connect"}
					</button>
				</form>

				{tables.length > 0 && (
					<div className="card">
						<h3 className="mb-3">Select Table</h3>
						<div className="grid grid-2">
							{tables.map((table) => (
								<button
									key={table}
									className={`btn ${
										selectedTable === table ? "btn-primary" : "btn-secondary"
									}`}
									onClick={() => handleTableSelect(table)}
								>
									{table}
								</button>
							))}
						</div>
					</div>
				)}

				{columns.length > 0 && (
					<div className="card">
						<h3 className="mb-3">Select Columns</h3>
						<div className="grid grid-2">
							{columns.map((column) => (
								<div key={column} className="form-group">
									<label className="checkbox-label">
										<input
											type="checkbox"
											checked={selectedColumns.includes(column)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedColumns([...selectedColumns, column]);
												} else {
													setSelectedColumns(
														selectedColumns.filter((col) => col !== column)
													);
												}
											}}
										/>
										<span className="ml-2">{column}</span>
									</label>
								</div>
							))}
						</div>

						<div className="form-group mt-4">
							<label className="form-label">Output File Name</label>
							<input
								type="text"
								className="form-control"
								value={outputFile}
								onChange={(e) => setOutputFile(e.target.value)}
								placeholder="example.csv"
								required
							/>
						</div>

						<button
							className="btn btn-primary"
							onClick={handleExport}
							disabled={loading || !outputFile || selectedColumns.length === 0}
						>
							{loading ? "Exporting..." : "Export Data"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ClickHouseToFlatFile;
