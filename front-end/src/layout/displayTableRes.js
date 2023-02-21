import React, { useState, useEffect } from "react";
import {
  getAllTableReservations,
  deleteTableReservation,
  updateReservation,
} from "../utils/api";
import findTableID from "./findTableID";
// import ErrorAlert from "../layour/ErrorAlert";

function DisplayTableReservations({ refreshDashboard }) {
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

  function handleTableFinish(event, reservationID) {
    const tableID = event.target.value;
    const abortController = new AbortController();

    if (window.confirm("Are you sure?") == true) {
      deleteTableReservation(tableID, abortController.signal)
        .then(changeStatus("finished", reservationID))
        .then(loadTableReservations)
        .then(() => refreshDashboard())
        .catch(setError);

      return () => abortController.abort();
    } else {
      return;
    }
  }

  function changeStatus(status, reservationID) {
    const abortController = new AbortController();

    updateReservation(
      { data: { status: status } },
      Number(reservationID),
      abortController.signal
    ).catch(setError);
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
              {table.reservation_id && (
                <button
                  className="btn btn-danger"
                  onClick={(event) =>
                    handleTableFinish(event, table.reservation_id)
                  }
                  value={table.table_id}
                  data-table-id-finish={table.table_id}
                >
                  Finish
                </button>
              )}
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
