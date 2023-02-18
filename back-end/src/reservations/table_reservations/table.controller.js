const service = require("./table.service");
const asyncErrorBoundary = require("../../errors/asyncErrorBoundary");
const reservationService = require("../reservations.service");

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
  if (res.locals.table.reservation_id) {
    next({
      status: 400,
      message: `Table is occupied!`,
    });
  }
  next();
}

function read(req, res) {
  res.json({ data: res.locals.table });
}

async function update(req, res) {
  const { table_id } = req.params;
  const updatedTable = {
    ...req.body.data,
    table_id: res.locals.table.table_id,
  };

  await service.update(updatedTable);

  const data = await service.read(table_id);

  res.json({ data });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  update: [
    tableExists,
    tableHasEnoughSeats,
    tableIsAvailable,
    asyncErrorBoundary(update),
  ],
  read: [tableExists, read],
};
