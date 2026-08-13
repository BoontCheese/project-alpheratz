const packageService = require("../services/packageService");

// ==========================================
// GET ALL PACKAGES
// GET /api/packages
// ==========================================

async function getPackages(req, res) {
    try {

        const { type, status } = req.query;

        const packages =
            await packageService.getPackages(
                type,
                status
            );

        res.json(packages);

    } catch (error) {

        console.error(
            "Error fetching packages:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch packages",
            error: error.message
        });
    }
}


// ==========================================
// GET ONE PACKAGE
// GET /api/packages/:id
// ==========================================

async function getPackageById(req, res) {
    try {

        const packageId =
            parseInt(req.params.id);

        if (isNaN(packageId)) {

            return res.status(400).json({
                message: "Invalid package ID"
            });
        }

        const packageData =
            await packageService.getPackageById(
                packageId
            );

        if (!packageData) {

            return res.status(404).json({
                message: "Package not found"
            });
        }

        res.json(packageData);

    } catch (error) {

        console.error(
            "Error fetching package:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch package",
            error: error.message
        });
    }
}

// ==========================================
// UPDATE PACKAGE
// PUT /api/packages/:id
// ==========================================

async function updatePackage(req, res) {
    try {

        const packageId =
            parseInt(req.params.id);

        if (isNaN(packageId)) {

            return res.status(400).json({
                message: "Invalid package ID"
            });
        }

        const packageData = req.body;

        if (
            !packageData ||
            Object.keys(packageData).length === 0
        ) {

            return res.status(400).json({
                message: "No package data provided"
            });
        }

        const updatedPackage =
            await packageService.updatePackage(
                packageId,
                packageData
            );

        if (!updatedPackage) {

            return res.status(404).json({
                message: "Package not found"
            });
        }

        res.json({
            message: "Package updated successfully",
            data: updatedPackage
        });

    } catch (error) {

        console.error(
            "Error updating package:",
            error
        );

        res.status(500).json({
            message: "Failed to update package",
            error: error.message
        });
    }
}

// ==========================================
// UPDATE HOTELS
// PUT /api/packages/:id/hotels
// ==========================================

async function updateHotels(req, res) {

    try {

        const packageId =
            parseInt(req.params.id);


        if (isNaN(packageId)) {

            return res.status(400).json({
                message: "Invalid package ID"
            });

        }


        const { hotels } = req.body;


        if (!Array.isArray(hotels)) {

            return res.status(400).json({
                message:
                    "Hotels data must be an array"
            });

        }


        const updatedPackage =
            await packageService.updateHotels(
                packageId,
                hotels
            );


        if (!updatedPackage) {

            return res.status(404).json({
                message:
                    "Package not found"
            });

        }


        res.json({

            message:
                "Hotels updated successfully",

            data:
                updatedPackage.hotel_options

        });

    } catch (error) {

        console.error(
            "Error updating hotels:",
            error
        );


        res.status(500).json({

            message:
                "Failed to update hotels",

            error:
                error.message

        });

    }

}

// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
    getPackages,
    getPackageById,
    updatePackage,
    updateHotels
};

