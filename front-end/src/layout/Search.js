import React, { useEffect, useState } from "react";
import { searchReservationsWithPhone } from "../utils/api";
import ListReservations from "./ListReservations";
import ErrorAlert from "./ErrorAlert";
import formatPhoneNumber from "./formatPhoneNumber";

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
