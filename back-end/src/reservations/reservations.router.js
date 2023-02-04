/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/all").get(controller.list);
router.route("/new").post(controller.create);
router.route("/").get(controller.read);

module.exports = router;
