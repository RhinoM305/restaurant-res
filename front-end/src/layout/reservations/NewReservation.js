import React, { useState } from "react";
import { createReservation } from "../../utils/api";
import { useHistory } from "react-router-dom";
import { today } from "../../utils/date-time";
import formatPhoneNumber from "../../utils/formatPhoneNumber";
import ErrorAlert from "../ErrorAlert";

import "./Reservations.css";
function NewReservation() {
  const [reservationForm, setReservationForm] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  });
  const [error, setError] = useState("");
  const history = useHistory();

  const submitHandler = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    createReservation({ data: reservationForm }, abortController.signal)
      .then((value) =>
        history.push(`/dashboard?date=${reservationForm.reservation_date}`)
      )
      .catch(setError);
  };

  if (error) console.log(error);

  return (
    <div>
      <ErrorAlert error={error} />
      <h4>New Reservation</h4>
      <form onSubmit={submitHandler} className="reservation-form">
        <div className="form-group">
          <label htmlFor="reservationFirstNameInput">First Name</label>
          <input
            className="form-control"
            id="reservationFirstNameInput"
            placeholder="first name"
            required
            onChange={(update) =>
              setReservationForm({
                ...reservationForm,
                first_name: update.target.value,
              })
            }
          />
          <label htmlFor="reservationLastNameInput">Last Name</label>
          <input
            className="form-control"
            id="reservationLastNameInput"
            placeholder="last name"
            required
            onChange={(update) =>
              setReservationForm({
                ...reservationForm,
                last_name: update.target.value,
              })
            }
          />
          <label htmlFor="reservationMobileNumberInput">Mobile Number</label>
          <input
            className="form-control"
            id="reservationMobileNumberInput"
            placeholder="phone number"
            maxLength="12"
            required
            value={reservationForm.mobile_number}
            onChange={(update) => {
              const formattedPhoneNumber = formatPhoneNumber(
                update.target.value
              );
              setReservationForm({
                ...reservationForm,
                mobile_number: formattedPhoneNumber,
              });
            }}
          />
          <label htmlFor="reservationDateInput">Date</label>
          <input
            type="date"
            className="form-control"
            placeholder="YYYY-MM-DD"
            min={today()}
            pattern="\d{4}-\d{2}-\d{2}"
            required
            onChange={(update) => {
              setReservationForm({
                ...reservationForm,
                reservation_date: update.target.value,
              });
            }}
          />
          <label htmlFor="reservationTimeInput">Time</label>
          <input
            type="time"
            className="form-control"
            placeholder="HH:MM"
            pattern="[0-9]{2}:[0-9]{2}"
            required
            onChange={(update) => {
              setReservationForm({
                ...reservationForm,
                reservation_time: `${update.target.value}:00`,
              });
            }}
          />
          <label htmlFor="reservationNumberOfPeopleInput">
            Number of people attending
          </label>
          <input
            type="number"
            disabled1={true}
            className="form-control"
            max="30"
            min="1"
            value={reservationForm.people || 1}
            onChange={(update) => {
              setReservationForm({
                ...reservationForm,
                people: Number(update.target.value),
              });
            }}
          />
        </div>
        <button className="btn bottom-button">Submit</button>
      </form>
    </div>
  );
}

export default NewReservation;
