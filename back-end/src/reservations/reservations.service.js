const { where } = require("../db/connection");
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

function list() {
  return knex("reservations")
    .select("reservation_date")
    .orderBy("reservation_date")
    .distinct();
}

module.exports = {
  read,
  create,
  list,
};
