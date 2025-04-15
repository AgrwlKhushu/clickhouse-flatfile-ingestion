import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Navigation from "./components/Navigation";
import ClickHouseToFlatFile from "./components/ClickHouseToFlatFile";
import FlatFileToClickHouse from "./components/FlatFileToClickHouse";
import "./styles/theme.css";

const App = () => {
	return (
		<Router>
			<div className="app">
				<Navigation />
				<Routes>
					<Route
						path="/"
						element={<Navigate to="/clickhouse-to-flatfile" replace />}
					/>
					<Route
						path="/clickhouse-to-flatfile"
						element={<ClickHouseToFlatFile />}
					/>
					<Route
						path="/flatfile-to-clickhouse"
						element={<FlatFileToClickHouse />}
					/>
				</Routes>
			</div>
		</Router>
	);
};

export default App;
