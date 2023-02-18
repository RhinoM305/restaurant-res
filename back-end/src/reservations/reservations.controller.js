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
  if (!date) {
    date = formatDateNow();
  }

  const reservations = await service.readByDate(date);
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

function hasValidDate(req, res, next) {
  const { data = {} } = req.body;
  // the date variable holds the date from the client and converts the date to be,
  // UTC that way it can be compaired. If this is not done we will be compairing a date,
  // from EST time which is 5 hours behind UTC with UTC which is ahead.
  let date = new Date(`${data.reservation_date} 00:00:00 UTC`);
  // today is set to 00:00:00 or the start of that day to make it level with
  // the date from the client. I was running into incossitent compairsons with,
  // dates because the client was returning a EST timezone date while the server,
  // is on UTC.
  let today = new Date(`${formatDateNow()} 00:00:00 UTC`);
  //we are assuming that the store closes at midnight. or 12am est
  if (date >= today) {
    // date + 1 to allign date with western hemisphere date, if confused lookup getDay() returns wrong value
    if (date + 1 == 2) {
      next({
        status: 400,
        message: `We are not open on tuesdays!`,
      });
    } else next();
  } else {
    next({
      status: 400,
      message: `This is in the past!!! ${data.reservation_date}`,
    });
  }
}

function hasValidTime(req, res, next) {
  const { data = {} } = req.body;

  const reservationTime = new Date(
    `${data.reservation_date} ${data.reservation_time}`
  )
    .toJSON()
    .slice(11, 19);
  const todayTime = new Date().toJSON().slice(11, 19);
  // the store opens at 10:30am but since we converted to UTC time
  // the store opens at 3:30pm since UTC is 5 hours ahead of eastern timezone.

  // the store closes at 10:30pm but since we converted to UTC time
  // the store closes at 3:30am since UTC is 5 hours ahead of eastern timezone.

  // CANNOT MAKE RESERVATIONS WITHIN 1 HOUR OF CLOSING!!!!

  // 1530 10:30AM/3:30PM UTC OPEN
  // 0230 9:30PM/2:30AM UTC RESERVATION CUTOFF
  // 0330 10:30PM/3:30AM UTC CLOSE
  // 0500 12:00AM/5:00AM UTC MIDNIGHT

  if (reservationTime < "15:30:00" && reservationTime > "05:00:00") {
    next({
      status: 400,
      message: `We open at 10:30am!!!`,
    });
  } else if (reservationTime > "02:30:00" && reservationTime < "03:30:00") {
    next({
      status: 400,
      message: `Sorry, we are not allowed to schedule a reservation within an hour before closing!`,
    });
  } else if (reservationTime > "03:30:00" && reservationTime <= "05:00:00") {
    next({
      status: 400,
      message: `Sorry, but we are closed at that time!`,
    });
  } else if (reservationTime < todayTime) {
    next({
      status: 400,
      message: `Sorry, that time is no longer available!`,
    });
  } else {
    next();
  }
}

async function create(req, res) {
  const newCreation = await service.create(req.body.data);
  res.status(201).json({ newCreation });
}

async function readByDate(req, res) {
  res.json({
    data: res.locals.reservations,
  });
}

async function list(req, res) {
  res.json({ data: await service.list() });
}
module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidDate,
    hasValidTime,
    asyncErrorBoundary(create),
  ],
  readByDate: [
    asyncErrorBoundary(reservationExist),
    asyncErrorBoundary(readByDate),
  ],
};
