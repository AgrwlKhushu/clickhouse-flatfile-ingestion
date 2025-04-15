import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
	const location = useLocation();

	return (
		<nav className="nav">
			<div className="container nav-container">
				<Link to="/" className="nav-brand">
					ClickHouse Data Ingestion
				</Link>
				<div className="nav-links">
					<Link
						to="/clickhouse-to-flatfile"
						className={`nav-link ${
							location.pathname === "/clickhouse-to-flatfile" ? "active" : ""
						}`}
					>
						Export to File
					</Link>
					<Link
						to="/flatfile-to-clickhouse"
						className={`nav-link ${
							location.pathname === "/flatfile-to-clickhouse" ? "active" : ""
						}`}
					>
						Import from File
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
