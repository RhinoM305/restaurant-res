const { where } = require("../db/connection");
const knex = require("../db/connection");

const tableName = "reservations";

function readByDate(date) {
  return knex("reservations as r")
    .where({ "r.reservation_date": date })
    .select("r.*");
}

function readByPhone(mobile_number) {
  return knex("reservations")
    .where("mobile_number", "like", `${mobile_number}%`)
    .select("*");
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

function read(reservation_id) {
  return knex("reservations").where({ reservation_id }).select("*").first();
}

function update(updatedReservation) {
  return knex("reservations")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation);
}

module.exports = {
  readByDate,
  readByPhone,
  create,
  list,
  read,
  update,
};
