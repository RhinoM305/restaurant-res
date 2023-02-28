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

async function reservationsExistUsingDateOrPhone(req, res, next) {
  // this method of pulling reservation uses the data rather than ID to fetch the reservations,
  // the reason behind that is because I used the data in params to filter out the reservations,
  // for the specifc date, this method of validation will also be diffrent because it will pull multiple reservations,
  // rather than just one reservation like the other simlair middleware function.
  let { mobile_phone, date } = req.query;

  let reservations = null;

  if (mobile_phone) {
    reservations = await service.readByPhone(mobile_phone);
    if (reservations[0]) {
      res.locals.reservations = reservations;
      next();
    } else {
      next({
        status: 404,
        message: "No reservations found for given phone number.",
      });
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
        message: "No reservations found for given date.",
      });
    }
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
    if (date.getDay() + 1 == 2) {
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

  const easternTimeSubmitted = new Date(
    `${data.reservation_date} ${data.reservation_time}`
  );

  const ifToday = () => {
    const today = new Date("2023-2-27").toJSON().slice(0, 10);

    if (today === data.reservation_date) {
      return true;
    }
  };
  //ifToday checks if reservation date is equal to todays date.

  // the store opens at 10:30am but since we converted to UTC time
  // the store opens at 3:30pm since UTC is 5 hours ahead of eastern timezone.

  // the store closes at 10:30pm but since we converted to UTC time
  // the store closes at 3:30am since UTC is 5 hours ahead of eastern timezone.

  // CANNOT MAKE RESERVATIONS WITHIN 1 HOUR OF CLOSING!!!!

  // 1530 10:30AM/3:30PM UTC OPEN
  // 0230 9:30PM/2:30AM UTC RESERVATION CUTOFF
  // 0330 10:30PM/3:30AM UTC CLOSE
  // 0500 12:00AM/5:00AM UTC MIDNIGHT

  //Checks if after midnight but before opening
  if (reservationTime < "15:30:00" && reservationTime > "05:00:00") {
    next({
      status: 400,
      message: `We open at 10:30am!!!`,
    });
    //Checks if after cutoff but before closing
  } else if (reservationTime > "02:30:00" && reservationTime < "03:30:00") {
    next({
      status: 400,
      message: `Sorry, we are not allowed to schedule a reservation within an hour before closing!`,
    });
    //Checks after closing but before midnight
  } else if (reservationTime > "03:30:00" && reservationTime <= "05:00:00") {
    next({
      status: 400,
      message: `Sorry, but we are closed at that time!`,
    });
    //Finally if it is today we compare real time with reservation time
  } else if (ifToday()) {
    if (easternTimeSubmitted < new Date()) {
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

async function reservationExistsUsingReservationID(req, res, next) {
  const { reservationID } = req.params;

  const reservation = await service.read(reservationID);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  return next({
    status: 404,
    message: "Reservation not found",
  });
}

async function create(req, res) {
  const newCreation = await service.create(req.body.data);
  res.status(201).json({ newCreation });
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
  const { reservationID } = req.params;

  res.json({ data: await service.read(reservationID) });
}

async function update(req, res) {
  const { reservationID } = req.params;
  const updatedReservation = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };

  await service.update(updatedReservation);

  const data = await service.read(reservationID);

  res.json({ data });
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
    asyncErrorBoundary(reservationsExistUsingDateOrPhone),
    asyncErrorBoundary(readByDateOrPhone),
  ],
  update: [reservationExistsUsingReservationID, asyncErrorBoundary(update)],
  read: [reservationExistsUsingReservationID, read],
};
