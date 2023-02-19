import React, { useEffect, useState } from "react";
import { getAllTableReservations } from "../utils/api";
import { useParams, useHistory } from "react-router-dom";
import { assignReservationToTable } from "../utils/api";
import ErrorAlert from "./ErrorAlert";
import findTableID from "./findTableID";

function SeatParty() {
  const [option, setOption] = useState("");
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");

  const { reservation_id } = useParams();
  const history = useHistory();

  useEffect(loadTableReservations, []);

  function loadTableReservations() {
    const abortController = new AbortController();
    setError(null);
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
      { data: { reservation_id: Number(reservation_id) } },
      findTableID(option, tables),
      abortController.signal
    )
      .then((value) => history.push(`/dashboard`))
      .catch(setError);
    return () => abortController.abort();
  }

  return (
    <div>
      <h2>Please Seat Selected Party: </h2>
      <ErrorAlert error={error} />
      <form onSubmit={submitHandler}>
        <label>Available Tables:</label>
        <select name="table_id" value={option} required onChange={handleChange}>
          <option value="">--Please Pick A Table--</option>
          {list()}
        </select>
        <button className="btn btn-primary">Submit</button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SeatParty;
