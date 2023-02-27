import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../ErrorAlert";

import "./tables.css";

function NewTable() {
  const history = useHistory();

  const submitHandler = (event) => {
    event.preventDefault();
    history.push("/dashboard");
  };

  return (
    <div>
      {/* <ErrorAlert /> */}
      <h4>New Table</h4>
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label>Table Name</label>
          <input className="form-control"></input>
          <label>Capacity</label>
          <input className="form-control" type="number"></input>
        </div>
        <div className="tables-reservation-form">
          <button className="col-sm-2 btn bottom-button">submit</button>
          <button
            className="col-sm-2 btn bottom-button-cancel"
            onClick={() => history.goBack()}
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewTable;
