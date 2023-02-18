import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const history = useHistory();

  const submitHandler = (event) => {
    event.preventDefault();
    history.push("/dashboard");
  };

  return (
    <div>
      {/* <ErrorAlert /> */}
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label>Table Name</label>
          <input className="form-control"></input>
          <label>Capacity</label>
          <input className="form-control" type="number"></input>
        </div>
        <button className="btn btn-primary">submit</button>
        <button className="btn btn-danger" onClick={() => history.goBack()}>
          cancel
        </button>
      </form>
    </div>
  );
}

export default NewTable;
