import React from "react";
import { Link } from "react-router-dom";

function ListReservations({ data, show = false }) {
  // show is set to default value which is used to hyde the reservations
  // with a status of "finished", primarily used for the dashboard list.
  //
  return data.map((reservation) => {
    if (reservation.status === "finished" && !show) {
      return;
    }

    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Reservation: {reservation.first_name}</h5>
          <p>Last Name: {reservation.last_name}</p>
          <p>Mobile Number: {reservation.mobile_number}</p>
          <p>Date: {reservation.reservation_date}</p>
          <p>Time: {reservation.reservation_time}</p>
          <p>People: {reservation.people}</p>
          <p>Status: {reservation.status}</p>
          {reservation.status === "booked" && (
            <Link
              to={`/reservations/${reservation.reservation_id}/seat`}
              className="btn btn-primary"
            >
              Seat
            </Link>
          )}
        </div>
      </div>
    );
  });
}

export default ListReservations;
