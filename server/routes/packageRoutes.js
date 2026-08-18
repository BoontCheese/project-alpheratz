const express = require("express");

const router = express.Router();

const packageController = require("../controllers/packageController");

console.log("CONTROLLER:", packageController);

console.log(
    "GET PACKAGES:",
    typeof packageController.getPackages
);

console.log(
    "GET PACKAGE BY ID:",
    typeof packageController.getPackageById
);

console.log(
    "UPDATE PACKAGE:",
    typeof packageController.updatePackage
);


// ==========================================
// GET ALL PACKAGES
// GET /api/packages
// ==========================================

router.get(
    "/",
    packageController.getPackages
);


// ==========================================
// GET PACKAGE BY ID
// GET /api/packages/:id
// ==========================================

router.get(
    "/:id",
    packageController.getPackageById
);

// ==========================================
// UPDATE HOTELS
// PUT /api/packages/:id/hotels
// ==========================================

router.put(
    "/:id/hotels",
    packageController.updateHotels
);

// ==========================================
// UPDATE ITINERARIES
// PUT /api/packages/:id/itineraries
// ==========================================

router.put(
    "/:id/itineraries",
    packageController.updateItineraries
);

// ==========================================
// UPDATE ITINERARY DESTINATIONS
// PUT /api/packages/:id/itineraries/destinations
// ==========================================

router.put(
    "/:id/itineraries/destinations",
    packageController.updateDestinations
);

// ==========================================
// UPDATE ITINERARY ACTIVITIES
// PUT /api/packages/:id/itineraries/activities
// ==========================================

router.put(
    "/:id/itineraries/activities",
    packageController.updateActivities
);

// ==========================================
// UPDATE PACKAGE
// PUT /api/packages/:id
// ==========================================

router.put(
    "/:id",
    packageController.updatePackage
);


module.exports = router;