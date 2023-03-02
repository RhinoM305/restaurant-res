exports.seed = function (knex) {
  return knex("reservations").insert([
    {
      first_name: "Ryan",
      last_name: "Moreno",
      mobile_number: "210-428-8300",
      reservation_date: "2026-12-30",
      reservation_time: "19:00",
      created_at: "2020-12-10T08:31:32.326Z",
      updated_at: "2020-12-10T08:31:32.326Z",
    },
  ]);
};
