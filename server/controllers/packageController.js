const packageService = require("../services/packageService");

// ==========================================
// GET ALL PACKAGES
// GET /api/packages
// ==========================================

async function getPackages(req, res) {
  try {
    const { type, status } = req.query;

    const packages = await packageService.getPackages(type, status);

    res.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);

    res.status(500).json({
      message: "Failed to fetch packages",
      error: error.message,
    });
  }
}

// ==========================================
// GET ONE PACKAGE
// GET /api/packages/:id
// ==========================================

async function getPackageById(req, res) {
  try {
    const packageId = parseInt(req.params.id);

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    const packageData = await packageService.getPackageById(packageId);

    if (!packageData) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    res.json(packageData);
  } catch (error) {
    console.error("Error fetching package:", error);

    res.status(500).json({
      message: "Failed to fetch package",
      error: error.message,
    });
  }
}

// ==========================================
// UPDATE PACKAGE
// PUT /api/packages/:id
// ==========================================

async function updatePackage(req, res) {
  try {
    const packageId = parseInt(req.params.id);

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    const packageData = req.body;

    if (!packageData || Object.keys(packageData).length === 0) {
      return res.status(400).json({
        message: "No package data provided",
      });
    }

    const updatedPackage = await packageService.updatePackage(
      packageId,
      packageData,
    );

    if (!updatedPackage) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    res.json({
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("Error updating package:", error);

    res.status(500).json({
      message: "Failed to update package",
      error: error.message,
    });
  }
}

// ==========================================
// UPDATE HOTELS
// PUT /api/packages/:id/hotels
// ==========================================

async function updateHotels(req, res) {
  try {
    const packageId = parseInt(req.params.id);

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    const { hotels } = req.body;

    if (!Array.isArray(hotels)) {
      return res.status(400).json({
        message: "Hotels data must be an array",
      });
    }

    const updatedPackage = await packageService.updateHotels(packageId, hotels);

    if (!updatedPackage) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    res.json({
      message: "Hotels updated successfully",

      data: updatedPackage.hotel_options,
    });
  } catch (error) {
    console.error("Error updating hotels:", error);

    res.status(500).json({
      message: "Failed to update hotels",

      error: error.message,
    });
  }
}

// ==========================================
// UPDATE ITINERARIES
// PUT /api/packages/:id/itineraries
// ==========================================

async function updateItineraries(req, res) {
  try {
    const packageId = parseInt(req.params.id);

    // --------------------------------------
    // Validate package ID
    // --------------------------------------

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    // --------------------------------------
    // Get itineraries from request body
    // --------------------------------------

    const { itineraries } = req.body;

    // --------------------------------------
    // Validate itinerary data
    // --------------------------------------

    if (!Array.isArray(itineraries)) {
      return res.status(400).json({
        message: "Itineraries data must be an array",
      });
    }

    // --------------------------------------
    // Update itineraries
    // --------------------------------------

    const updatedPackage = await packageService.updateItineraries(
      packageId,
      itineraries,
    );

    // --------------------------------------
    // Package not found
    // --------------------------------------

    if (!updatedPackage) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // --------------------------------------
    // Success response
    // --------------------------------------

    res.json({
      message: "Itineraries updated successfully",

      data: updatedPackage.itineraries,
    });
  } catch (error) {
    console.error("Error updating itineraries:", error);

    res.status(500).json({
      message: "Failed to update itineraries",

      error: error.message,
    });
  }
}

// ==========================================
// CREATE ITINERARY
// POST /api/packages/:id/itineraries
// ==========================================

async function createItinerary(req, res) {
  try {
    // --------------------------------------
    // Get package ID
    // --------------------------------------

    const packageId = parseInt(req.params.id);

    // --------------------------------------
    // Validate package ID
    // --------------------------------------

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    // --------------------------------------
    // Get itinerary data
    // --------------------------------------

    const itineraryData = req.body;

    // --------------------------------------
    // Validate request body
    // --------------------------------------

    if (!itineraryData || Object.keys(itineraryData).length === 0) {
      return res.status(400).json({
        message: "No itinerary data provided",
      });
    }

    // --------------------------------------
    // Create itinerary
    // --------------------------------------

    const newItinerary = await packageService.createItinerary(
      packageId,
      itineraryData,
    );

    // --------------------------------------
    // Package not found
    // --------------------------------------

    if (!newItinerary) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // --------------------------------------
    // Success response
    // --------------------------------------

    res.status(201).json({
      message: "Itinerary created successfully",

      data: newItinerary,
    });
  } catch (error) {
    console.error("Error creating itinerary:", error);

    res.status(500).json({
      message: "Failed to create itinerary",

      error: error.message,
    });
  }
}

// ==========================================
// CREATE ITINERARY DESTINATION
// POST /api/packages/:id/itineraries/destinations
// ==========================================

async function createDestination(req, res) {
  try {
    // --------------------------------------
    // Get package ID
    // --------------------------------------

    const packageId = parseInt(req.params.id);

    // --------------------------------------
    // Validate package ID
    // --------------------------------------

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    // --------------------------------------
    // Get destination data
    // --------------------------------------

    const destinationData = req.body;

    // --------------------------------------
    // Validate request body
    // --------------------------------------

    if (!destinationData || Object.keys(destinationData).length === 0) {
      return res.status(400).json({
        message: "No destination data provided",
      });
    }

    // --------------------------------------
    // Create destination
    // --------------------------------------

    const newDestination = await packageService.createDestination(
      packageId,
      destinationData,
    );

    // --------------------------------------
    // Package not found
    // --------------------------------------

    if (!newDestination) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // --------------------------------------
    // Success response
    // --------------------------------------

    res.status(201).json({
      message: "Destination created successfully",

      data: newDestination,
    });
  } catch (error) {
    console.error("Error creating destination:", error);

    res.status(500).json({
      message: "Failed to create destination",

      error: error.message,
    });
  }
}

// ==========================================
// CREATE ITINERARY ACTIVITY
// POST /api/packages/:id/itineraries/activities
// ==========================================

async function createActivity(req, res) {
  try {
    // --------------------------------------
    // Get package ID
    // --------------------------------------

    const packageId = parseInt(req.params.id);

    // --------------------------------------
    // Validate package ID
    // --------------------------------------

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    // --------------------------------------
    // Get activity data
    // --------------------------------------

    const activityData = req.body;

    // --------------------------------------
    // Validate request body
    // --------------------------------------

    if (!activityData || Object.keys(activityData).length === 0) {
      return res.status(400).json({
        message: "No activity data provided",
      });
    }

    // --------------------------------------
    // Create activity
    // --------------------------------------

    const newActivity = await packageService.createActivity(
      packageId,
      activityData,
    );

    // --------------------------------------
    // Package not found
    // --------------------------------------

    if (!newActivity) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // --------------------------------------
    // Success response
    // --------------------------------------

    res.status(201).json({
      message: "Activity created successfully",

      data: newActivity,
    });
  } catch (error) {
    console.error("Error creating activity:", error);

    res.status(500).json({
      message: "Failed to create activity",

      error: error.message,
    });
  }
}

// ==========================================
// UPDATE ITINERARY DESTINATIONS
// PUT /api/packages/:id/itineraries/destinations
// ==========================================

async function updateDestinations(req, res) {
  try {
    const packageId = parseInt(req.params.id);

    // --------------------------------------
    // Validate package ID
    // --------------------------------------

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    // --------------------------------------
    // Get destinations from request body
    // --------------------------------------

    const { destinations } = req.body;

    // --------------------------------------
    // Validate destination data
    // --------------------------------------

    if (!Array.isArray(destinations)) {
      return res.status(400).json({
        message: "Destinations data must be an array",
      });
    }

    // --------------------------------------
    // Update destinations
    // --------------------------------------

    const updatedPackage = await packageService.updateDestinations(
      packageId,
      destinations,
    );

    // --------------------------------------
    // Package not found
    // --------------------------------------

    if (!updatedPackage) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // --------------------------------------
    // Success response
    // --------------------------------------

    res.json({
      message: "Destinations updated successfully",

      data: updatedPackage.itineraries,
    });
  } catch (error) {
    console.error("Error updating destinations:", error);

    res.status(500).json({
      message: "Failed to update destinations",

      error: error.message,
    });
  }
}

// ==========================================
// UPDATE ITINERARY ACTIVITIES
// PUT /api/packages/:id/itineraries/activities
// ==========================================

async function updateActivities(req, res) {
  try {
    // --------------------------------------
    // Get package ID
    // --------------------------------------

    const packageId = parseInt(req.params.id);

    // --------------------------------------
    // Validate package ID
    // --------------------------------------

    if (isNaN(packageId)) {
      return res.status(400).json({
        message: "Invalid package ID",
      });
    }

    // --------------------------------------
    // Get activities from request body
    // --------------------------------------

    const { activities } = req.body;

    // --------------------------------------
    // Validate activity data
    // --------------------------------------

    if (!Array.isArray(activities)) {
      return res.status(400).json({
        message: "Activities data must be an array",
      });
    }

    // --------------------------------------
    // Update activities
    // --------------------------------------

    const updatedPackage = await packageService.updateActivities(
      packageId,
      activities,
    );

    // --------------------------------------
    // Package not found
    // --------------------------------------

    if (!updatedPackage) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // --------------------------------------
    // Success response
    // --------------------------------------

    res.json({
      message: "Activities updated successfully",

      data: updatedPackage.itineraries,
    });
  } catch (error) {
    console.error("Error updating activities:", error);

    res.status(500).json({
      message: "Failed to update activities",

      error: error.message,
    });
  }
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  getPackages,

  getPackageById,

  updatePackage,

  updateHotels,

  updateItineraries,

  createItinerary,

  createDestination,

  createActivity,

  updateDestinations,

  updateActivities,
};
