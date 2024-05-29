exports.up = function (knex) {
  return knex.schema.createTable("tables", (table) => {
    table.increments("table_id").primary();
    table.integer("reservation_id").unsigned();
    table
      .foreign("reservation_id")
      .references("reservation_id")
      .inTable("reservations")
      .onDelete("cascade");
    table.string("first_name").unsigned();
    table.string("table_name").notNullable();
    table.integer("capacity").defaultTo(1);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tables");
};

//tables
//reservation id
//reservation customer name
//table_name
//capacity this table has