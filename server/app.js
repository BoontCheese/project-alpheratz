const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


// ==========================================
// ROUTES
// ==========================================

const packageRoutes =
    require("./routes/packageRoutes");

app.use("/api/packages", packageRoutes);


// ==========================================
// DATABASE TEST
// ==========================================

const db = require("./config/db");

app.get("/api/test-db", async (req, res) => {

    try {

        const [rows] =
            await db.query("SELECT 1 AS Result");

        res.json({
            message: "Database connected successfully",
            data: rows
        });

    } catch (error) {

        console.error(
            "Database connection error:",
            error
        );

        res.status(500).json({
            message: "Database Connection Failed",
            error: error.message
        });
    }
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});