const service = require("./table.service");
const asyncErrorBoundary = require("../../errors/asyncErrorBoundary");
const reservationService = require("../reservations.service");
const hasProperties = require("../../errors/hasProperties");

const knex = require("../../db/connection");

const hasRequiredProperties = hasProperties("table_name", "capacity");

const VALID_PROPERTIES = [
  "table_name",
  "capacity",
  "reservation_id",
  "table_id",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  console.log(data);
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }

  next();
}

async function list(req, res) {
  res.json({ data: await service.list() });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  return next({
    status: 404,
    message: `Table cannot be found`,
  });
}

async function tableHasEnoughSeats(req, res, next) {
  const { reservation_id } = req.body.data;

  if (reservation_id == null) {
    return next();
  }

  const { people } = await reservationService.read(reservation_id);

  if (res.locals.table.capacity < people) {
    next({
      status: 400,
      message: `Too many people in reservation for this table.`,
    });
  }
  return next();
}

async function tableIsAvailable(req, res, next) {
  const { reservation_id } = req.body.data;
  if (res.locals.table.reservation_id) {
    next({
      status: 400,
      message: `Table is occupied!`,
    });
  }
  next();
}

function isTableNull(req, res, next) {
  if (res.locals.table.reservation_id === null) {
    next({
      status: 400,
      message: `Table is already empty!`,
    });
  }
  next();
}

function read(req, res) {
  res.json({ data: res.locals.table });
}

async function update(req, res, next) {
  const updatedTable = {
    ...res.locals.table,
    reservation_id: req.body.data.reservation_id,
  };

  res.locals.updatedTable = updatedTable;
  // Im leaving this update function here for possible implementation
  // of update tables isolated from reservation. AKA table edit feature or
  // something similair.
  next();
}

async function updateReservationStatus(req, res, next) {
  const { reservation_id, status } = req.body.data;
  const reservation = await reservationService.read(reservation_id);
  res.locals.reservation = { ...reservation, status: status };
  next();
}

async function destroy(req, res) {
  const { table_id } = req.params;
  const updatedTable = { ...res.locals.table, reservation_id: null };
  await service.destroy(updatedTable);
  res.sendStatus(204);
}

async function create(req, res) {
  const newCreation = await service.create(req.body.data);
  console.log(newCreation);
  res.status(201).json({ newCreation });
}
async function transaction(req, res, next) {
  console.log(res.locals.updatedTable);
  knex.transaction((trx) => {
    service
      .update(res.locals.updatedTable)
      .transacting(trx)
      .then(() =>
        reservationService.update(res.locals.reservation).transacting(trx)
      )
      .then(() => {
        trx.commit();
        res.send({ data: "Update Success!!!" });
      })
      .catch((err) => {
        trx.rollback();
        next({
          status: 500,
          message: err.message,
        });
      });
  });
}
//Note to self:
//you might be confused later on as to why I didnt need to call
//the update method from the controller to validate the reservation
//data. Since we are grabbing straight from the database and NOT,
//from the client NO validation is necessary as the database can be
//trusted.

module.exports = {
  list: [asyncErrorBoundary(list)],
  update: [
    tableExists,
    tableHasEnoughSeats,
    tableIsAvailable,
    updateReservationStatus,
    update,
    transaction,
  ],
  read: [tableExists, read],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    asyncErrorBoundary(create),
  ],
  delete: [tableExists, isTableNull, asyncErrorBoundary(destroy)],
};
