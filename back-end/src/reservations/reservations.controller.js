/**
 * List handler for reservation resources
 */
const formatDateNow = require("../utils/format-date");
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

// as the name of the function sugests here we use a function (hasProperties) to verify that the listed properties
// are included in the created reservation
const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time"
);

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
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

async function reservationExist(req, res, next) {
  let date = req.query.date;
  console.log(date);
  if (!date) {
    date = formatDateNow();
  }

  const reservations = await service.read(date);
  if (reservations[0]) {
    res.locals.reservations = reservations;
    next();
  } else {
    next({
      status: 404,
      message: "No reservations found for given date.",
    });
  }
}

async function create(req, res) {
  const newCreation = await service.create(req.body.data);
  res.status(201).json({ newCreation });
}

async function read(req, res) {
  res.json({
    data: res.locals.reservations,
  });
}

module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExist), asyncErrorBoundary(read)],
};
