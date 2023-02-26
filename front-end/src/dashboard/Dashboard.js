import React, { useEffect, useState } from "react";
import { listReservations, getAllReservationDates } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, Link } from "react-router-dom";
import DisplayTableReservations from "../layout/displayTableRes";
import ListReservations from "../layout/ListReservations";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [occupiedDatesError, setOccupiedDatesError] = useState(null);
  const [error, setError] = useState("");

  const history = useHistory();

  let indexOfCurrentDate = 0;

  useEffect(loadDashboard, [date]);
  useEffect(getOccupiedDates, []);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  function getOccupiedDates() {
    const abortController = new AbortController();
    setOccupiedDatesError(null);
    getAllReservationDates(abortController.signal)
      .then((data) => {
        return data.map((date) => date.reservation_date.substring(0, 10));
      })
      .then(setOccupiedDates)
      .catch(setOccupiedDatesError);
    return () => abortController.abort();
  }

  if (occupiedDates[0]) {
    indexOfCurrentDate = occupiedDates.indexOf(date);
  }

  function dateDisplay() {
    let prev = occupiedDates[indexOfCurrentDate - 1];
    let next = occupiedDates[indexOfCurrentDate + 1];

    if (!date) {
      next = occupiedDates[indexOfCurrentDate];
    }

    return (
      <React.Fragment>
        {prev && (
          <button onClick={() => clickHandler("prev", prev)}>{prev}</button>
        )}
        {next && (
          <button onClick={() => clickHandler("next", next)}>{next}</button>
        )}
        <button
          onClick={() => {
            setReservations([]);
            history.push(`/dashboard`);
          }}
        >
          Home
        </button>
      </React.Fragment>
    );
  }
  // PON stands for previous or next
  // second param takes in date to parse to link
  function clickHandler(PON, d) {
    if (PON === "prev") {
      history.push(`/dashboard?date=${d}`);
    } else {
      history.push(`/dashboard?date=${d}`);
    }
  }

  return (
    <main>
      <h1>Dashboard</h1>
      {dateDisplay()}
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={occupiedDatesError} />
      <ErrorAlert error={error} />
      {reservations[0] && (
        <ListReservations
          data={reservations}
          load={loadDashboard}
          setError={setError}
        />
      )}
      <DisplayTableReservations refreshDashboard={loadDashboard} />
    </main>
  );
}
//{JSON.stringify(reservations)}
export default Dashboard;
