const express = require("express");
const router = express.Router();
const ecgController = require("../controllers/patient/ecgController");
const upload = require("../middlewares/multerConfig");

router.post(
  "/submit",
  upload.single("ecgFile"),
  ecgController.submitEcgData
);

router.get(
  "/:patientId",
  ecgController.getEcgHistory
);

router.get(
  "/report/:recordId",
  ecgController.downloadEcgReport
);

module.exports = router;