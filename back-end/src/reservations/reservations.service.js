const knex = require("../db/connection");

const tableName = "reservations";

function read(date) {
  return knex("reservations as r")
    .where({ "r.reservation_date": date })
    .select("r.*");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

module.exports = {
  read,
  create,
};
