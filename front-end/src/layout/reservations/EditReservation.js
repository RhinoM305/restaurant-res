import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getSpecificReservation, updateReservation } from "../../utils/api";
import { today } from "../../utils/date-time";
import formatPhoneNumber from "../../utils/formatPhoneNumber";
import ErrorAlert from "../ErrorAlert";

import "./Reservations.css";

function EditReservation() {
  const [reservation, setReservation] = useState({});

  const [error, setError] = useState("");

  const { reservation_id } = useParams();
  const history = useHistory();

  useEffect(loadReservation, []);

  function loadReservation() {
    const abortController = new AbortController();
    setReservation({});
    getSpecificReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setError);
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();

    updateReservation(
      { data: reservation },
      Number(reservation_id),
      abortController.signal
    )
      .then(() => history.goBack())
      .catch(setError);
    return () => abortController.abort();
  }

  function editForm() {
    return (
      <div className="reservation-form">
        <ErrorAlert error={error} />
        <h4>Edit</h4>
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="reservationFirstNameInput">First Name</label>
            <input
              value={reservation.first_name}
              className="form-control"
              id="reservationFirstNameInput"
              placeholder="first name"
              required
              onChange={(update) =>
                setReservation({
                  ...reservation,
                  first_name: update.target.value,
                })
              }
            />
            <label htmlFor="reservationLastNameInput">Last Name</label>
            <input
              value={reservation.last_name}
              className="form-control"
              id="reservationLastNameInput"
              placeholder="last name"
              required
              onChange={(update) =>
                setReservation({
                  ...reservation,
                  last_name: update.target.value,
                })
              }
            />
            <label htmlFor="reservationMobileNumberInput">Mobile Number</label>
            <input
              value={reservation.mobile_number}
              className="form-control"
              id="reservationMobileNumberInput"
              placeholder="phone number"
              maxLength="12"
              required
              onChange={(update) => {
                const formattedPhoneNumber = formatPhoneNumber(
                  update.target.value
                );
                setReservation({
                  ...reservation,
                  mobile_number: formattedPhoneNumber,
                });
              }}
            />
            <label htmlFor="reservationDateInput">Date</label>
            <input
              type="date"
              value={reservation.reservation_date.slice(0, 10)}
              className="form-control"
              placeholder="YYYY-MM-DD"
              min={today()}
              pattern="\d{4}-\d{2}-\d{2}"
              required
              onChange={(update) => {
                setReservation({
                  ...reservation,
                  reservation_date: update.target.value,
                });
              }}
            />
            <label htmlFor="reservationTimeInput">Time</label>
            <input
              value={reservation.reservation_time}
              type="time"
              className="form-control"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]{2}"
              required
              onChange={(update) => {
                setReservation({
                  ...reservation,
                  reservation_time: `${update.target.value}:00`,
                });
              }}
            />
            <label htmlFor="reservationNumberOfPeopleInput">
              Number of people attending
            </label>
            <input
              value={reservation.people || 1}
              type="number"
              disabled1={true}
              className="form-control"
              max="30"
              min="1"
              onChange={(update) => {
                setReservation({
                  ...reservation,
                  people: Number(update.target.value),
                });
              }}
            />
          </div>
          <button className="btn bottom-button">Submit</button>
          <button
            type="button"
            className="btn bottom-button-cancel"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }
  return (
    <div>{Object.keys(reservation).length ? editForm() : "loading..."}</div>
  );
}

export default EditReservation;
