const service = require("./table.service");
const asyncErrorBoundary = require("../../errors/asyncErrorBoundary");
const reservationService = require("../reservations.service");
const hasProperties = require("../../errors/hasProperties");

const knex = require("../../db/connection");

const hasRequiredProperties = hasProperties("table_name", "capacity");
const hasRequiredPropsForSeat = hasProperties("reservation_id");

const VALID_PROPERTIES = [
  "table_name",
  "capacity",
  "reservation_id",
  "first_name",
  "table_id",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
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
    message: `${table_id}`,
  });
}

async function reservationStatus(req, res, next) {
  const { reservation_id } = req.body.data;

  const reservation = await reservationService.read(reservation_id);

  res.locals.reservation = reservation;

  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: "seated",
    });
  } else if (reservation.status === "finished") {
    return next({
      status: 400,
      message: "finished",
    });
  } else {
    next();
  }
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;

  const reservation = await reservationService.read(reservation_id);
  if (reservation) {
    return next();
  } else {
    return next({
      status: 404,
      message: `${reservation_id}`,
    });
  }
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
      message: `capacity`,
    });
  }
  return next();
}

async function tableIsAvailable(req, res, next) {
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
      message: `not occupied!`,
    });
  }
  next();
}

function validName(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    next({
      status: 400,
      message: `table_name`,
    });
  } else {
    next();
  }
}

function validCapacity(req, res, next) {
  const { capacity } = req.body.data;

  if (Number.isInteger(capacity)) {
    next();
  } else {
    next({
      status: 400,
      message: `capacity`,
    });
  }
}

function read(req, res) {
  res.json({ data: res.locals.table });
}

async function update(req, res, next) {
  const { reservation_id } = req.body.data;

  const { first_name } = await reservationService.read(reservation_id);

  const updatedTable = {
    ...res.locals.table,
    reservation_id: req.body.data.reservation_id,
    first_name: first_name,
  };

  res.locals.updatedTable = updatedTable;
  // Im leaving this update function here for possible implementation
  // of update tables isolated from reservation. AKA table edit feature or
  // something similair.
  next();
}

async function destroy(req, res) {
  const updatedTable = { ...res.locals.table, reservation_id: null, first_name: null };

  const reservation = await reservationService.read(
    res.locals.table.reservation_id
  );

  const updatedReservation = {
    ...reservation,
    status: "finished",
  };

  // Change status of reservtion locally.

  await reservationService.update(updatedReservation);

  await service.destroy(updatedTable);
  res.status(200).json("finished");
}

async function create(req, res) {
  const newCreation = await service.create(req.body.data);
  res.status(201).json({ data: newCreation });
}

async function transaction(req, res, next) {
  knex.transaction((trx) => {
    service
      .update(res.locals.updatedTable)
      .transacting(trx)
      .then(() =>
        reservationService
          .update({ ...res.locals.reservation, status: "seated" })
          .transacting(trx)
      )
      .then(() => {
        trx.commit();
        res.status(200).send({ data: "Update Success!!!" });
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
    hasRequiredPropsForSeat,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(reservationStatus),
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(tableHasEnoughSeats),
    asyncErrorBoundary(tableIsAvailable),
    asyncErrorBoundary(update),
    asyncErrorBoundary(transaction),
  ],
  read: [tableExists, read],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    validName,
    validCapacity,
    asyncErrorBoundary(create),
  ],
  delete: [
    asyncErrorBoundary(tableExists),
    isTableNull,
    asyncErrorBoundary(destroy),
  ],
};
