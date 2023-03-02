import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getSpecificReservation, updateReservation } from "../../utils/api";
import formatPhoneNumber from "../../utils/formatPhoneNumber";
import ErrorAlert from "../ErrorAlert";
import ReservationForm from "./ReservationForm";

import "./Reservations.css";

function EditReservation() {
  const [reservationForm, setReservationForm] = useState({});

  const [error, setError] = useState("");

  const { reservation_id } = useParams();
  const history = useHistory();

  useEffect(loadReservation, [reservation_id]);

  function loadReservation() {
    const abortController = new AbortController();
    setReservationForm({});
    getSpecificReservation(reservation_id, abortController.signal)
      .then(setReservationForm)
      .catch(setError);
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();

    updateReservation(
      { data: reservationForm },
      Number(reservation_id),
      abortController.signal
    )
      .then((value) =>
        history.push(`/dashboard?date=${value.reservation_date.slice(0, 10)}`)
      )
      .catch(setError);
    return () => abortController.abort();
  }

  function editForm() {
    return (
      <div className="reservationForm-form">
        <ErrorAlert error={error} />
        <h4>Edit</h4>
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
  return (
    <div>{Object.keys(reservationForm).length ? editForm() : "loading..."}</div>
  );
}

export default EditReservation;
