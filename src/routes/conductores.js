const { getConductores, postViaje } = require("../controllers/conductores");

const router = require("express").Router();

router.get("/", getConductores);

module.exports = router;
