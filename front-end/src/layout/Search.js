import React, { useEffect, useState } from "react";
import { searchReservationsWithPhone } from "../utils/api";
import ListReservations from "./ListReservations";
import ErrorAlert from "./ErrorAlert";

function Search() {
  const [number, setNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  function submitHandler(event) {
    event.preventDefault();
    setReservations([]);
    setError("");
    const abortController = new AbortController();
    searchReservationsWithPhone(number, abortController.signal)
      .then(setReservations)
      .catch(setError);

    return () => abortController.abort();
  }

  function formatPhoneNumber(value) {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  }

  return (
    <div>
      <h2>Search for reservation by number:</h2>
      <form onSubmit={submitHandler}>
        <label>Number:</label>
        <input
          placeHolder="Enter a customer's phone number"
          className="form-control"
          maxLength="12"
          value={number}
          onChange={(update) => {
            const formattedPhoneNumber = formatPhoneNumber(update.target.value);
            setNumber(formattedPhoneNumber);
          }}
        />
        <button className="btn btn-primary">Find</button>
      </form>
      <ErrorAlert error={error} />
      {reservations && <ListReservations data={reservations} show={true} />}
    </div>
  );
}

export default Search;
