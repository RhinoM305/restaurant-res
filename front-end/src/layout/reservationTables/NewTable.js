import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

import "./tables.css";

function NewTable() {
  const [table, setTable] = useState({ table_name: "", capacity: 1 });
  const history = useHistory();

  const submitHandler = (event) => {
    event.preventDefault();

    const abortController = new AbortController();
    createTable({ data: table });

    history.push("/dashboard");
  };

  return (
    <div className="tables-form">
      {/* <ErrorAlert /> */}
      <h4>New Table</h4>
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label>Table Name</label>
          <input
            className="form-control"
            onChange={(update) => {
              setTable({
                ...table,
                table_name: update.target.value,
              });
            }}
          ></input>
          <label>Capacity</label>
          <input
            className="form-control"
            type="number"
            value={table.capacity || 1}
            onChange={(update) => {
              setTable({
                ...table,
                capacity: update.target.value,
              });
            }}
          ></input>
        </div>
        <div className="tables-reservation-form-buttons">
          <button className="btn bottom-button">submit</button>
          <button
            className="btn bottom-button-cancel"
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
