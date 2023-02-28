import React, { useEffect, useState } from "react";
import { getAllTableReservations } from "../../utils/api";
import { useParams, useHistory } from "react-router-dom";
import { assignReservationToTable, updateReservation } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";
import findTableID from "./findTableID";

import "./tables.css";

function SeatParty() {
  const [option, setOption] = useState("");
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");

  const { reservation_id } = useParams();
  const history = useHistory();

  useEffect(loadTableReservations, []);

  function loadTableReservations() {
    const abortController = new AbortController();
    setError("");
    getAllTableReservations(abortController.signal)
      .then(setTables)
      .catch(setError);
    return () => abortController.abort();
  }

  const list = () => {
    if (tables) {
      return tables.map((table) => {
        if (!table.reservation_id) {
          return <option value={table.table_name}>{table.table_name}</option>;
        }
      });
    }
  };

  function handleChange(event) {
    setOption(event.target.value);
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();

    assignReservationToTable(
      { data: { reservation_id: Number(reservation_id), status: "seated" } },
      findTableID(option, tables),
      abortController.signal
    )
      .then(() => history.goBack())
      .catch(setError);
    return () => abortController.abort();
  }

  return (
    <div className="tables-form">
      <h3>Please Seat Selected Party </h3>
      <ErrorAlert error={error} />
      <form onSubmit={submitHandler}>
        <div className="seat-form">
          <select
            name="table_id"
            value={option}
            required
            onChange={handleChange}
          >
            <option value="">--Please Select A Table--</option>
            {list()}
          </select>
        </div>
        <div className="seat-buttons">
          <button className="btn bottom-button mt-2">Submit</button>
          <button
            className="btn bottom-button-cancel"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SeatParty;
