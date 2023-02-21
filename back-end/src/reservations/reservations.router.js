/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/all").get(controller.list).all(methodNotAllowed);

router.route("/new").post(controller.create).all(methodNotAllowed);

router.route("/").get(controller.readByDate).all(methodNotAllowed);

router
  .route("/:reservationID")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

module.exports = router;
