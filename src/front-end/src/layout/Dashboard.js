import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "./ErrorAlert";
import { useHistory } from "react-router-dom";
import DisplayTableReservations from "./reservationTables/displayTableRes";
import ListReservations from "./reservations/ListReservations";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";


import "./Layout.css";

const moment = require("moment");
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);

  const [error, setError] = useState("");

  const history = useHistory();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setError);
    return () => abortController.abort();
  }

  function dateDisplay() {
    let today = moment(`${date}`);
    let prev = today.clone().subtract(1, "day");
    let next = today.clone().add(1, "day");

    return (
      <React.Fragment>
        <div className="dashboard-buttons">
          <div className="dashboard-date-select">
            <button
              onClick={() => clickHandler("prev", prev.format("YYYY-MM-DD"))}
              className="btn dashboard-date-btn"
            >
              <BsChevronLeft/>
            </button>
            <div
              className="dashboard-curr-date"
            >{today.format("YYYY-MM-DD")}
            </div>
            <button
              onClick={() => clickHandler("next", next.format("YYYY-MM-DD"))}
              className="btn dashboard-date-btn"
            >
              <BsChevronRight/>
            </button>
          </div>
          <button
            className="btn home-btn"
            onClick={() => {
              setReservations([]);
              history.push(`/dashboard`);
            }}
          >
            Today's Reservations: {moment().format("YYYY-MM-DD")}
          </button>
        </div>
      </React.Fragment>
    );
  }
  // PON stands for previous or next
  // second param takes in date to parse to link
  function clickHandler(PON, d) {
    if (!d) {
      return;
    }
    if (PON === "prev") {
      setReservations([]);
      history.push(`/dashboard?date=${d}`);
    } else {
      setReservations([]);
      history.push(`/dashboard?date=${d}`);
    }
  }

  return (
    <main className="test">
      <h2 className="mb-4">Dashboard</h2>
      {dateDisplay()}
      <div className="reservation-tables-div">
      <div className="reservation-side">
        <div className="mb-3">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h4 className="reservations-for-today">Reservations for today</h4>
        </div>
      </div>
      <ErrorAlert error={error} />
      {reservations[0] && (
        <ListReservations
          data={reservations}
          load={loadDashboard}
          setError={setError}
        />
      )}
      </div>
      <DisplayTableReservations refreshDashboard={loadDashboard} />
      </div>
      
    </main>
  );
}
//{JSON.stringify(reservations)}
export default Dashboard;
