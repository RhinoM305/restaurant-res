import React, { useState, useEffect } from "react";
import { getAllTableReservations } from "../utils/api";
// import ErrorAlert from "../layour/ErrorAlert";

function DisplayTableReservations() {
  const [tables, setTables] = useState();
  const [error, setError] = useState();
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
        return (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{table.table_name}</h5>
              <p>Capacity: {table.capacity}</p>
              <p data-table-id-status={table.table_id}>
                Availability: {table.reservation_id ? "occupied" : "unoccupied"}
              </p>
            </div>
          </div>
        );
      });
    }
  };
  return (
    <div>
      <h2>Table Reservations</h2>
      {list()}
    </div>
  );
}

export default DisplayTableReservations;
