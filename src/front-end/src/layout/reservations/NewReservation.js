import React, { useState } from "react";
import { createReservation } from "../../utils/api";
import { useHistory } from "react-router-dom";
import { today } from "../../utils/date-time";
import formatPhoneNumber from "../../utils/formatPhoneNumber";
import ErrorAlert from "../ErrorAlert";
import ReservationForm from "./ReservationForm";

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

  if (error) {
    console.log(error);
  }

  return (
    <div className="new-reservation">
      {reservationForm.reservation_date < today() && error && (
        <ErrorAlert error={{ message: "future" }} />
      )}
      <ErrorAlert error={error} />
      <h4>New Reservation</h4>
      <ReservationForm
        submitHandler={submitHandler}
        setReservationForm={setReservationForm}
        reservationForm={reservationForm}
        formatPhoneNumber={formatPhoneNumber}
        history={history}
      />
    </div>
  );
}

export default NewReservation;
