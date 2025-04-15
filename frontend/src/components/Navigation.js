import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function Navigation() {
	const location = useLocation();

	return (
		<Navbar bg="white" expand="lg" className="mb-4">
			<Container>
				<Navbar.Brand as={Link} to="/">
					Data Ingestion Tool
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link
							as={Link}
							to="/clickhouse-to-flatfile"
							className={
								location.pathname === "/clickhouse-to-flatfile" ? "active" : ""
							}
						>
							ClickHouse to Flat File
						</Nav.Link>
						<Nav.Link
							as={Link}
							to="/flatfile-to-clickhouse"
							className={
								location.pathname === "/flatfile-to-clickhouse" ? "active" : ""
							}
						>
							Flat File to ClickHouse
						</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

export default Navigation;
