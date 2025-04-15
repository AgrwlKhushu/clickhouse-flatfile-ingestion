import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Navigation from "./components/Navigation";
import ClickHouseToFlatFile from "./components/ClickHouseToFlatFile";
import FlatFileToClickHouse from "./components/FlatFileToClickHouse";
import "./App.css";

function App() {
	return (
		<Router>
			<div className="App">
				<Navigation />
				<Container className="mt-4">
					<Routes>
						<Route
							path="/clickhouse-to-flatfile"
							element={<ClickHouseToFlatFile />}
						/>
						<Route
							path="/flatfile-to-clickhouse"
							element={<FlatFileToClickHouse />}
						/>
						<Route path="/" element={<ClickHouseToFlatFile />} />
					</Routes>
				</Container>
			</div>
		</Router>
	);
}

export default App;
