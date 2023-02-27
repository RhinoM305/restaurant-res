import React from "react";
import NavBar from "./navigation/NavBar";
import Routes from "./Routes";

import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */

function Layout() {
  return (
    <div className="container-fluid background">
      <div className="row h-100">
        <div
          className="col-md-6 side-bar"
          style={{
            order: 2,
            position: "fixed",
            zIndex: "999",
            bottom: "0",
          }}
        >
          <NavBar />
        </div>
        <div className="col-md-6" style={{ order: 1 }}>
          <Routes />
        </div>
      </div>
    </div>
  );
}

export default Layout;
