const knex = require("../../db/connection");

const tableName = "tables";

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

function read(tableID) {
  return knex("tables").select("*").where({ table_id: tableID }).first();
}

function update(updatedTable) {
  return knex("tables")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable);
}

module.exports = {
  list,
  read,
  update,
};
