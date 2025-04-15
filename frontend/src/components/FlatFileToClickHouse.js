import React, { useState } from "react";
import axios from "axios";

const FlatFileToClickHouse = () => {
	const [connectionSettings, setConnectionSettings] = useState({
		host: "",
		port: "",
		database: "",
		user: "",
		jwtToken: "",
	});
	const [fileSettings, setFileSettings] = useState({
		fileName: "",
		delimiter: ",",
	});
	const [columns, setColumns] = useState([]);
	const [selectedColumns, setSelectedColumns] = useState([]);
	const [targetTable, setTargetTable] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleLoadColumns = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await axios.post(
				"http://localhost:8082/api/ingestion/flatfile/columns",
				fileSettings
			);
			setColumns(response.data);
			setSuccess("File columns loaded successfully");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load columns");
		} finally {
			setLoading(false);
		}
	};

	const handleImport = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await axios.post(
				"http://localhost:8082/api/ingestion/clickhouse/import",
				{
					connectionSettings,
					fileSettings,
					columns: selectedColumns,
					targetTable,
				}
			);
			setSuccess("Data imported successfully");
		} catch (err) {
			setError(err.response?.data?.message || "Import failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="card">
				<h2 className="mb-4">Import to ClickHouse</h2>

				{error && <div className="alert alert-error">{error}</div>}
				{success && <div className="alert alert-success">{success}</div>}

				<div className="grid grid-2">
					<div className="card">
						<h3 className="mb-3">File Settings</h3>
						<form onSubmit={handleLoadColumns}>
							<div className="form-group">
								<label className="form-label">File Name</label>
								<input
									type="text"
									className="form-control"
									value={fileSettings.fileName}
									onChange={(e) =>
										setFileSettings({
											...fileSettings,
											fileName: e.target.value,
										})
									}
									placeholder="example.csv"
									required
								/>
							</div>

							<div className="form-group">
								<label className="form-label">Delimiter</label>
								<input
									type="text"
									className="form-control"
									value={fileSettings.delimiter}
									onChange={(e) =>
										setFileSettings({
											...fileSettings,
											delimiter: e.target.value,
										})
									}
									placeholder=","
									required
								/>
							</div>

							<button
								type="submit"
								className="btn btn-primary"
								disabled={loading}
							>
								{loading ? "Loading..." : "Load Columns"}
							</button>
						</form>
					</div>

					<div className="card">
						<h3 className="mb-3">Connection Settings</h3>
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
					</div>
				</div>

				{columns.length > 0 && (
					<div className="card mt-4">
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
							<label className="form-label">Target Table Name</label>
							<input
								type="text"
								className="form-control"
								value={targetTable}
								onChange={(e) => setTargetTable(e.target.value)}
								placeholder="Enter target table name"
								required
							/>
						</div>

						<button
							className="btn btn-primary"
							onClick={handleImport}
							disabled={loading || !targetTable || selectedColumns.length === 0}
						>
							{loading ? "Importing..." : "Import Data"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default FlatFileToClickHouse;
