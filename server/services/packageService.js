const db = require("../config/db");

// ==========================================
// GET ALL PACKAGES
// ==========================================

async function getPackages(type, status) {

    let sql = `
        SELECT
            package_id,
            package_code,
            package_name,
            package_type,
            duration_days,
            duration_nights,
            valid_from,
            valid_until,
            description,
            status
        FROM tour_packages
        WHERE 1 = 1
    `;

    const params = [];

    if (type) {
        sql += ` AND package_type = ?`;
        params.push(type);
    }

    if (status) {
        sql += ` AND status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY package_id`;

    const [rows] =
        await db.query(sql, params);

    return rows;
}


// ==========================================
// GET ONE PACKAGE BY ID
// ==========================================

async function getPackageById(packageId) {

    // ------------------------------------------
    // Get package information
    // ------------------------------------------

    const [packageRows] =
        await db.query(`
            SELECT
                package_id,
                package_code,
                package_name,
                package_type,
                duration_days,
                duration_nights,
                valid_from,
                valid_until,
                description,
                status
            FROM tour_packages
            WHERE package_id = ?
        `, [packageId]);


    if (packageRows.length === 0) {
        return null;
    }


    const packageData =
        packageRows[0];


    // ------------------------------------------
    // Get hotel options + prices
    // ------------------------------------------

    const [hotelRows] =
        await db.query(`
            SELECT
                pho.option_id,
                pho.option_name,
                pho.description AS option_description,

                pp.price_id,
                pp.price,
                pp.currency,

                rot.occupancy_type_id,
                rot.occupancy_code,
                rot.occupancy_name

            FROM package_hotel_options pho

            LEFT JOIN package_prices pp
                ON pho.option_id = pp.option_id

            LEFT JOIN room_occupancy_types rot
                ON pp.occupancy_type_id =
                   rot.occupancy_type_id

            WHERE pho.package_id = ?

            ORDER BY
                pho.option_id,
                pp.price_id
        `, [packageId]);


    // ------------------------------------------
    // Build hotel options
    // ------------------------------------------

    const hotelOptions = [];


    for (const row of hotelRows) {

        let option =
            hotelOptions.find(
                item =>
                    item.option_id ===
                    row.option_id
            );


        if (!option) {

            option = {
                option_id: row.option_id,
                option_name: row.option_name,
                description:
                    row.option_description,
                prices: []
            };

            hotelOptions.push(option);
        }


        if (row.price_id) {

            option.prices.push({

                price_id: row.price_id,

                occupancy_type_id:
                    row.occupancy_type_id,

                occupancy_code:
                    row.occupancy_code,

                occupancy_name:
                    row.occupancy_name,

                price: row.price,

                currency: row.currency
            });
        }
    }


    // ------------------------------------------
    // Get itineraries
    // ------------------------------------------

    const [itineraryRows] =
        await db.query(`
            SELECT
                itinerary_id,
                day_number,
                title,
                description

            FROM package_itineraries

            WHERE package_id = ?

            ORDER BY day_number
        `, [packageId]);


    // ------------------------------------------
    // Get activities
    // ------------------------------------------

    const [activityRows] =
        await db.query(`
            SELECT
                pia.itinerary_id,
                pia.activity_id,
                pia.activity_sequence,
                pia.activity_name,
                pia.activity_type,
                pia.description,
                pia.is_optional,
                pia.additional_cost,
                pia.currency,
                pia.cost_unit

            FROM package_itinerary_activities pia

            INNER JOIN package_itineraries pi
                ON pia.itinerary_id =
                   pi.itinerary_id

            WHERE pi.package_id = ?

            ORDER BY
                pia.itinerary_id,
                pia.activity_sequence
        `, [packageId]);


    // ------------------------------------------
    // Get destinations
    // ------------------------------------------

    const [destinationRows] =
        await db.query(`
            SELECT
                pid.itinerary_id,
                pid.itinerary_destination_id,
                pid.destination_id,
                pid.visit_sequence,
                d.destination_name,
                d.destination_type,
                d.description

            FROM package_itinerary_destinations pid

            INNER JOIN package_itineraries pi
                ON pid.itinerary_id =
                   pi.itinerary_id

            INNER JOIN destinations d
                ON pid.destination_id =
                   d.destination_id

            WHERE pi.package_id = ?

            ORDER BY
                pid.itinerary_id,
                pid.visit_sequence
        `, [packageId]);


    // ------------------------------------------
    // Build itinerary structure
    // ------------------------------------------

    const itineraries =
        itineraryRows.map(itinerary => {

            const activities =
                activityRows
                    .filter(activity =>
                        activity.itinerary_id ===
                        itinerary.itinerary_id
                    )
                    .map(activity => ({

                        activity_id:
                            activity.activity_id,

                        activity_sequence:
                            activity.activity_sequence,

                        activity_name:
                            activity.activity_name,

                        activity_type:
                            activity.activity_type,

                        description:
                            activity.description,

                        is_optional:
                            activity.is_optional,

                        additional_cost:
                            activity.additional_cost,

                        currency:
                            activity.currency,

                        cost_unit:
                            activity.cost_unit
                    }));


            const destinations =
                destinationRows
                    .filter(destination =>
                        destination.itinerary_id ===
                        itinerary.itinerary_id
                    )
                    .map(destination => ({

                        itinerary_destination_id:
                            destination
                                .itinerary_destination_id,

                        destination_id:
                            destination
                                .destination_id,

                        visit_sequence:
                            destination
                                .visit_sequence,

                        destination_name:
                            destination
                                .destination_name,

                        destination_type:
                            destination
                                .destination_type,

                        description:
                            destination.description
                    }));


            return {

                itinerary_id:
                    itinerary.itinerary_id,

                day_number:
                    itinerary.day_number,

                title:
                    itinerary.title,

                description:
                    itinerary.description,

                activities,

                destinations
            };
        });


    return {

        ...packageData,

        hotel_options:
            hotelOptions,

        itineraries
    };
}


// ==========================================
// UPDATE PACKAGE
// ==========================================

async function updatePackage(
    packageId,
    packageData
) {

    // ------------------------------------------
    // Only allow these fields to be updated
    // ------------------------------------------

    const allowedFields = [
        "package_code",
        "package_name",
        "package_type",
        "duration_days",
        "duration_nights",
        "valid_from",
        "valid_until",
        "description",
        "status"
    ];


    // ------------------------------------------
    // Build UPDATE dynamically
    // ------------------------------------------

    const updates = [];
    const params = [];


    for (const field of allowedFields) {

        if (
            Object.prototype.hasOwnProperty.call(
                packageData,
                field
            )
        ) {

            updates.push(
                `${field} = ?`
            );

            params.push(
                packageData[field]
            );
        }
    }


    // ------------------------------------------
    // Nothing to update
    // ------------------------------------------

    if (updates.length === 0) {

        return null;
    }


    // ------------------------------------------
    // Add package ID
    // ------------------------------------------

    params.push(packageId);


    // ------------------------------------------
    // Execute UPDATE
    // ------------------------------------------

    const [result] =
        await db.query(
            `
                UPDATE tour_packages

                SET
                    ${updates.join(", ")}

                WHERE package_id = ?
            `,
            params
        );


    // ------------------------------------------
    // Package doesn't exist
    // ------------------------------------------

    if (result.affectedRows === 0) {

        return null;
    }


    // ------------------------------------------
    // Return updated package
    // ------------------------------------------

    return await getPackageById(
        packageId
    );
}

// ==========================================
// UPDATE HOTEL OPTIONS + PRICES
// ==========================================

async function updateHotels(packageId, hotels) {

    // ------------------------------------------
    // Validate hotel data
    // ------------------------------------------

    if (!Array.isArray(hotels)) {
        throw new Error("Invalid hotel data");
    }


    // ------------------------------------------
    // Verify package exists
    // ------------------------------------------

    const [packageRows] = await db.query(
        `
            SELECT package_id
            FROM tour_packages
            WHERE package_id = ?
        `,
        [packageId]
    );


    if (packageRows.length === 0) {
        return null;
    }


    // ------------------------------------------
    // Update each hotel option
    // ------------------------------------------

    for (const hotel of hotels) {

        if (!hotel.option_id) {
            continue;
        }


        // --------------------------------------
        // Make sure this hotel belongs
        // to this package
        // --------------------------------------

        const [optionRows] = await db.query(
            `
                SELECT option_id
                FROM package_hotel_options
                WHERE option_id = ?
                  AND package_id = ?
            `,
            [
                hotel.option_id,
                packageId
            ]
        );


        if (optionRows.length === 0) {
            continue;
        }


        // --------------------------------------
        // Update hotel description
        // --------------------------------------

        if (
            Object.prototype.hasOwnProperty.call(
                hotel,
                "description"
            )
        ) {

            await db.query(
                `
                    UPDATE package_hotel_options
                    SET description = ?
                    WHERE option_id = ?
                      AND package_id = ?
                `,
                [
                    hotel.description,
                    hotel.option_id,
                    packageId
                ]
            );

        }


        // --------------------------------------
        // Update hotel prices
        // --------------------------------------

        if (Array.isArray(hotel.prices)) {

            for (const price of hotel.prices) {

                if (!price.price_id) {
                    continue;
                }


                // Make sure price belongs
                // to this hotel option

                const [priceRows] =
                    await db.query(
                        `
                            SELECT price_id
                            FROM package_prices
                            WHERE price_id = ?
                              AND option_id = ?
                        `,
                        [
                            price.price_id,
                            hotel.option_id
                        ]
                    );


                if (priceRows.length === 0) {
                    continue;
                }


                await db.query(
                    `
                        UPDATE package_prices
                        SET price = ?
                        WHERE price_id = ?
                          AND option_id = ?
                    `,
                    [
                        price.price,
                        price.price_id,
                        hotel.option_id
                    ]
                );

            }

        }

    }


    // ------------------------------------------
    // Return updated package
    // ------------------------------------------

    return await getPackageById(
        packageId
    );
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {

    getPackages,

    getPackageById,

    updatePackage,

    updateHotels

};