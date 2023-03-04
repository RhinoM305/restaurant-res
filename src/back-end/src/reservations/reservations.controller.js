/**
 * List handler for reservation resources
 */
const formatDateNow = require("../utils/format-date");
const moment = require("moment");
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
  "reservation_time",
  "people"
);

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
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

async function reservationsExistUsingDateOrPhone(req, res, next) {
  // this method of pulling reservation uses the data rather than ID to fetch the reservations,
  // the reason behind that is because I used the data in params to filter out the reservations,
  // for the specifc date, this method of validation will also be diffrent because it will pull multiple reservations,
  // rather than just one reservation like the other simlair middleware function.
  let { mobile_number, date } = req.query;

  const queryParam = req.query;
  let reservations = null;

  if (Object.keys(queryParam)[0] === "mobile_number") {
    reservations = await service.readByPhone(mobile_number);
    if (reservations[0]) {
      res.locals.reservations = reservations;
      next();
    } else {
      res.json({ data: [] });
    }
  } else {
    if (!date) {
      date = formatDateNow();
    }

    reservations = await service.readByDate(date);
    if (reservations[0]) {
      res.locals.reservations = reservations;
      next();
    } else {
      next({
        status: 404,
        message: `No reservations found for given date.`,
      });
    }
  }
}

function hasValidDate(req, res, next) {
  const { data = {} } = req.body;

  let date = new Date(`${data.reservation_date}`).toJSON().slice(0, 10);

  let today = moment().format().slice(0, 10);

  if (date >= today) {
    if (moment(date).format("dddd") === "Tuesday") {
      next({
        status: 400,
        message: "closed",
      });
    } else next();
  } else {
    next({
      status: 400,
      message: `future`,
    });
  }
}

function hasValidTime(req, res, next) {
  const { data = {} } = req.body;
  //formatting time to always be in 00:00:00 format
  const reservationTime = () => {
    if (data.reservation_time.length === 5) {
      return `${data.reservation_time}:00`;
    } else {
      return data.reservation_time;
    }
  };
  const today = moment().format().slice(0, 10);
  const reservationDate = data.reservation_date;
  const currentTime = moment().format(`hh:mm:ss`);
  console.log(reservationTime());

  // 1030 10:30AM OPEN
  // 2130 9:30PM RESERVATION CUTOFF
  // 1030 10:30PM CLOSE
  // 0000 12:00AM MIDNIGHT

  //Checks if before open but after midnight

  if (reservationTime() < "10:30:00" && reservationTime() > "00:00:00") {
    next({
      status: 400,
      message: `We open at 10:30am!!!`,
    });
    //Checks if after cutoff but before closing
  } else if (
    reservationTime() >= "21:30:00" &&
    reservationTime() < "22:30:00"
  ) {
    next({
      status: 400,
      message: `Sorry, we are not allowed to schedule a reservation within an hour before closing!`,
    });
    //Checks after closing but before midnight
  } else if (
    (reservationTime() > "22:30:00" && reservationTime() < "24:00:00") ||
    reservationTime() === "00:00:00"
  ) {
    next({
      status: 400,
      message: `Sorry, but we are closed at that time!`,
    });
    //Finally if it is today we compare real time with reservation time
  } else if (today === reservationDate) {
    if (reservationTime() < currentTime) {
      next({
        status: 400,
        message: `Sorry, this time is no longer available.`,
      });
    } else {
      return next();
    }
  } else {
    next();
  }
}

function hasDate(req, res, next) {
  const { reservation_date } = req.body.data;

  const date = new Date(reservation_date);

  if (isNaN(date.getDate())) {
    next({
      status: 400,
      message: `reservation_date`,
    });
  } else {
    next();
  }
}

function hasTime(req, res, next) {
  let { reservation_time } = req.body.data;
  if (reservation_time.length === 5) {
    reservation_time = `${reservation_time}:00`;
  }

  var timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

  if (timeRegex.test(reservation_time)) {
    next();
  } else {
    next({
      status: 400,
      message: `reservation_time`,
    });
  }
}

function peopleNum(req, res, next) {
  let { people } = req.body.data;

  if (Number.isInteger(people)) {
    next();
  } else if (people === 0) {
    next({
      status: 400,
      message: "people",
    });
  } else {
    next({
      status: 400,
      message: "people",
    });
  }
}

async function reservationExistsUsingReservationID(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  return next({
    status: 404,
    message: `${reservation_id}`,
  });
}

async function checkStatus(req, res, next) {
  const { status } = req.body.data;
  const { reservation_id } = req.params;

  const reservation = await service.read(reservation_id);
  if (reservation.status === "finished") {
    next({
      status: 400,
      message: "finished",
    });
  } else if (status === "unknown") {
    next({
      status: 400,
      message: "unknown",
    });
  } else {
    next();
  }
}

function validStatus(req, res, next) {
  const reservation = req.body.data;

  if (reservation.status) {
    if (reservation.status === "seated") {
      next({ status: 400, message: "seated" });
    } else if (reservation.status === "finished") {
      next({ status: 400, message: "finished" });
    } else {
      next();
    }
  } else {
    next();
  }
}

async function create(req, res) {
  const newCreation = await service.create(req.body.data);
  res.status(201).send({ data: newCreation });
}

async function readByDateOrPhone(req, res) {
  res.json({
    data: res.locals.reservations,
  });
}

async function list(req, res) {
  res.json({ data: await service.list() });
}

async function read(req, res) {
  const { reservation_id } = req.params;

  res.json({ data: await service.read(reservation_id) });
}

async function statusUpdate(req, res) {
  const { status } = req.body.data;

  const reservation = res.locals.reservation;
  const updatedStatus = { ...reservation, status: status };
  await service.update(updatedStatus);

  res.status(200).json({ data: updatedStatus });
}

async function update(req, res) {
  const { reservation_id } = req.params;
  const updatedReservation = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };

  await service.update(updatedReservation);

  const data = await service.read(reservation_id);

  res.json({ data });
}
module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasDate,
    hasTime,
    peopleNum,
    validStatus,
    hasValidDate,
    hasValidTime,
    asyncErrorBoundary(create),
  ],
  readByDate: [
    asyncErrorBoundary(reservationsExistUsingDateOrPhone),
    asyncErrorBoundary(readByDateOrPhone),
  ],
  update: [
    asyncErrorBoundary(reservationExistsUsingReservationID),
    hasRequiredProperties,
    peopleNum,
    hasTime,
    hasDate,
    asyncErrorBoundary(update),
  ],
  read: [
    asyncErrorBoundary(reservationExistsUsingReservationID),
    asyncErrorBoundary(read),
  ],
  statusUpdate: [
    asyncErrorBoundary(reservationExistsUsingReservationID),
    asyncErrorBoundary(checkStatus),
    asyncErrorBoundary(statusUpdate),
  ],
};
