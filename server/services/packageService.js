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

  const [rows] = await db.query(sql, params);

  return rows;
}

// ==========================================
// GET ONE PACKAGE BY ID
// ==========================================

async function getPackageById(packageId) {
  // ------------------------------------------
  // Get package information
  // ------------------------------------------

  const [packageRows] = await db.query(
    `
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
        `,
    [packageId],
  );

  if (packageRows.length === 0) {
    return null;
  }

  const packageData = packageRows[0];

  // ------------------------------------------
  // Get hotel options + prices
  // ------------------------------------------

  const [hotelRows] = await db.query(
    `
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
        `,
    [packageId],
  );

  // ------------------------------------------
  // Build hotel options
  // ------------------------------------------

  const hotelOptions = [];

  for (const row of hotelRows) {
    let option = hotelOptions.find((item) => item.option_id === row.option_id);

    if (!option) {
      option = {
        option_id: row.option_id,
        option_name: row.option_name,
        description: row.option_description,
        prices: [],
      };

      hotelOptions.push(option);
    }

    if (row.price_id) {
      option.prices.push({
        price_id: row.price_id,

        occupancy_type_id: row.occupancy_type_id,

        occupancy_code: row.occupancy_code,

        occupancy_name: row.occupancy_name,

        price: row.price,

        currency: row.currency,
      });
    }
  }

  // ------------------------------------------
  // Get itineraries
  // ------------------------------------------

  const [itineraryRows] = await db.query(
    `
            SELECT
                itinerary_id,
                day_number,
                title,
                description

            FROM package_itineraries

            WHERE package_id = ?

            ORDER BY day_number
        `,
    [packageId],
  );

  // ------------------------------------------
  // Get activities
  // ------------------------------------------

  const [activityRows] = await db.query(
    `
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
        `,
    [packageId],
  );

  // ------------------------------------------
  // Get destinations
  // ------------------------------------------

  const [destinationRows] = await db.query(
    `
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
        `,
    [packageId],
  );

  // ------------------------------------------
  // Build itinerary structure
  // ------------------------------------------

  const itineraries = itineraryRows.map((itinerary) => {
    const activities = activityRows
      .filter((activity) => activity.itinerary_id === itinerary.itinerary_id)
      .map((activity) => ({
        activity_id: activity.activity_id,

        activity_sequence: activity.activity_sequence,

        activity_name: activity.activity_name,

        activity_type: activity.activity_type,

        description: activity.description,

        is_optional: activity.is_optional,

        additional_cost: activity.additional_cost,

        currency: activity.currency,

        cost_unit: activity.cost_unit,
      }));

    const destinations = destinationRows
      .filter(
        (destination) => destination.itinerary_id === itinerary.itinerary_id,
      )
      .map((destination) => ({
        itinerary_destination_id: destination.itinerary_destination_id,

        destination_id: destination.destination_id,

        visit_sequence: destination.visit_sequence,

        destination_name: destination.destination_name,

        destination_type: destination.destination_type,

        description: destination.description,
      }));

    return {
      itinerary_id: itinerary.itinerary_id,

      day_number: itinerary.day_number,

      title: itinerary.title,

      description: itinerary.description,

      activities,

      destinations,
    };
  });

  return {
    ...packageData,

    hotel_options: hotelOptions,

    itineraries,
  };
}

// ==========================================
// UPDATE PACKAGE
// ==========================================

async function updatePackage(packageId, packageData) {
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
    "status",
  ];

  // ------------------------------------------
  // Build UPDATE dynamically
  // ------------------------------------------

  const updates = [];
  const params = [];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(packageData, field)) {
      updates.push(`${field} = ?`);

      params.push(packageData[field]);
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

  const [result] = await db.query(
    `
                UPDATE tour_packages

                SET
                    ${updates.join(", ")}

                WHERE package_id = ?
            `,
    params,
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

  return await getPackageById(packageId);
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
    [packageId],
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
      [hotel.option_id, packageId],
    );

    if (optionRows.length === 0) {
      continue;
    }

    // --------------------------------------
    // Update hotel description
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(hotel, "description")) {
      await db.query(
        `
                    UPDATE package_hotel_options
                    SET description = ?
                    WHERE option_id = ?
                      AND package_id = ?
                `,
        [hotel.description, hotel.option_id, packageId],
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

        const [priceRows] = await db.query(
          `
                            SELECT price_id
                            FROM package_prices
                            WHERE price_id = ?
                              AND option_id = ?
                        `,
          [price.price_id, hotel.option_id],
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
          [price.price, price.price_id, hotel.option_id],
        );
      }
    }
  }

  // ------------------------------------------
  // Return updated package
  // ------------------------------------------

  return await getPackageById(packageId);
}

// ==========================================
// UPDATE ITINERARIES
// ==========================================

async function updateItineraries(packageId, itineraries) {
  // ------------------------------------------
  // Validate itinerary data
  // ------------------------------------------

  if (!Array.isArray(itineraries)) {
    throw new Error("Invalid itinerary data");
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
    [packageId],
  );

  if (packageRows.length === 0) {
    return null;
  }

  // ------------------------------------------
  // Update each itinerary
  // ------------------------------------------

  for (const itinerary of itineraries) {
    if (!itinerary.itinerary_id) {
      continue;
    }

    // --------------------------------------
    // Make sure itinerary belongs
    // to this package
    // --------------------------------------

    const [itineraryRows] = await db.query(
      `
                SELECT itinerary_id
                FROM package_itineraries
                WHERE itinerary_id = ?
                  AND package_id = ?
            `,
      [itinerary.itinerary_id, packageId],
    );

    if (itineraryRows.length === 0) {
      continue;
    }

    // --------------------------------------
    // Update title + description
    // --------------------------------------

    const updates = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(itinerary, "title")) {
      updates.push("title = ?");
      params.push(itinerary.title);
    }

    if (Object.prototype.hasOwnProperty.call(itinerary, "description")) {
      updates.push("description = ?");
      params.push(itinerary.description);
    }

    if (updates.length === 0) {
      continue;
    }

    // --------------------------------------
    // Add itinerary ID + package ID
    // --------------------------------------

    params.push(itinerary.itinerary_id);
    params.push(packageId);

    // --------------------------------------
    // Execute UPDATE
    // --------------------------------------

    await db.query(
      `
                UPDATE package_itineraries
                SET ${updates.join(", ")}
                WHERE itinerary_id = ?
                  AND package_id = ?
            `,
      params,
    );
  }

  // ------------------------------------------
  // Return updated package
  // ------------------------------------------

  return await getPackageById(packageId);
}

// ==========================================
// CREATE ITINERARY
// ==========================================
// POST /api/packages/:id/itineraries
// ==========================================

async function createItinerary(packageId, itineraryData) {
  // ------------------------------------------
  // Validate package
  // ------------------------------------------

  const [packageRows] = await db.query(
    `
            SELECT package_id
            FROM tour_packages
            WHERE package_id = ?
        `,
    [packageId],
  );

  if (packageRows.length === 0) {
    return null;
  }

  // ------------------------------------------
  // Get itinerary data
  // ------------------------------------------

  const { day_number, title, description } = itineraryData;

  // ------------------------------------------
  // Validate required day number
  // ------------------------------------------

  if (day_number === undefined || day_number === null || day_number === "") {
    throw new Error("Day number is required");
  }

  // ------------------------------------------
  // Insert itinerary
  // ------------------------------------------

  const [result] = await db.query(
    `
            INSERT INTO package_itineraries
            (
                package_id,
                day_number,
                title,
                description
            )
            VALUES (?, ?, ?, ?)
        `,
    [packageId, day_number, title || null, description || null],
  );

  // ------------------------------------------
  // Return newly created itinerary
  // ------------------------------------------

  const [rows] = await db.query(
    `
            SELECT
                itinerary_id,
                package_id,
                day_number,
                title,
                description,
                created_at
            FROM package_itineraries
            WHERE itinerary_id = ?
        `,
    [result.insertId],
  );

  return rows[0];
}

// ==========================================
// CREATE ITINERARY DESTINATION
// ==========================================
// POST /api/packages/:id/itineraries/destinations
// ==========================================

async function createDestination(packageId, destinationData) {
  // ------------------------------------------
  // Validate package
  // ------------------------------------------

  const [packageRows] = await db.query(
    `
            SELECT package_id
            FROM tour_packages
            WHERE package_id = ?
        `,
    [packageId],
  );

  if (packageRows.length === 0) {
    return null;
  }

  // ------------------------------------------
  // Get destination data
  // ------------------------------------------

  const {
    itinerary_id,
    visit_sequence,
    destination_name,
    destination_type,
    description,
    city_id,
  } = destinationData;

  // ------------------------------------------
  // Validate required fields
  // ------------------------------------------

  if (
    itinerary_id === undefined ||
    itinerary_id === null ||
    itinerary_id === ""
  ) {
    throw new Error("Itinerary ID is required");
  }

  if (
    visit_sequence === undefined ||
    visit_sequence === null ||
    visit_sequence === ""
  ) {
    throw new Error("Visit sequence is required");
  }

  if (!destination_name || destination_name.trim() === "") {
    throw new Error("Destination name is required");
  }

  // ------------------------------------------
  // Make sure itinerary belongs
  // to this package
  // ------------------------------------------

  const [itineraryRows] = await db.query(
    `
            SELECT
                itinerary_id
            FROM package_itineraries
            WHERE itinerary_id = ?
              AND package_id = ?
        `,
    [itinerary_id, packageId],
  );

  if (itineraryRows.length === 0) {
    throw new Error("Itinerary does not belong to this package");
  }

  // ------------------------------------------
  // Create master destination
  // ------------------------------------------

  const [destinationResult] = await db.query(
    `
                INSERT INTO destinations
                (
                    city_id,
                    destination_name,
                    destination_type,
                    description
                )
                VALUES (?, ?, ?, ?)
            `,
    [
      city_id || null,
      destination_name,
      destination_type || null,
      description || null,
    ],
  );

  const destinationId = destinationResult.insertId;

  // ------------------------------------------
  // Attach destination to itinerary
  // ------------------------------------------

  const [assignmentResult] = await db.query(
    `
                INSERT INTO
                    package_itinerary_destinations
                (
                    itinerary_id,
                    destination_id,
                    visit_sequence
                )
                VALUES (?, ?, ?)
            `,
    [itinerary_id, destinationId, visit_sequence],
  );

  // ------------------------------------------
  // Return created destination
  // ------------------------------------------

  const [rows] = await db.query(
    `
            SELECT
                pid.itinerary_destination_id,
                pid.itinerary_id,
                pid.destination_id,
                pid.visit_sequence,

                d.destination_name,
                d.destination_type,
                d.description

            FROM package_itinerary_destinations pid

            INNER JOIN destinations d
                ON pid.destination_id =
                   d.destination_id

            WHERE
                pid.itinerary_destination_id = ?
        `,
    [assignmentResult.insertId],
  );

  return rows[0];
}

// ==========================================
// CREATE ITINERARY ACTIVITY
// ==========================================
// POST /api/packages/:id/itineraries/activities
// ==========================================

async function createActivity(packageId, activityData) {
  // ------------------------------------------
  // Validate package
  // ------------------------------------------

  const [packageRows] = await db.query(
    `
            SELECT package_id
            FROM tour_packages
            WHERE package_id = ?
        `,
    [packageId],
  );

  if (packageRows.length === 0) {
    return null;
  }

  // ------------------------------------------
  // Get activity data
  // ------------------------------------------

  const {
    itinerary_id,
    activity_sequence,
    activity_name,
    activity_type,
    description,
    is_optional,
    additional_cost,
    currency,
    cost_unit,
  } = activityData;

  // ------------------------------------------
  // Validate itinerary ID
  // ------------------------------------------

  if (
    itinerary_id === undefined ||
    itinerary_id === null ||
    itinerary_id === ""
  ) {
    throw new Error("Itinerary ID is required");
  }

  // ------------------------------------------
  // Validate activity name
  // ------------------------------------------

  if (!activity_name || activity_name.trim() === "") {
    throw new Error("Activity name is required");
  }

  // ------------------------------------------
  // Make sure itinerary belongs
  // to this package
  // ------------------------------------------

  const [itineraryRows] = await db.query(
    `
            SELECT itinerary_id
            FROM package_itineraries
            WHERE itinerary_id = ?
              AND package_id = ?
        `,
    [itinerary_id, packageId],
  );

  if (itineraryRows.length === 0) {
    throw new Error("Itinerary does not belong to this package");
  }

  // ------------------------------------------
  // Determine activity sequence
  // ------------------------------------------

  let sequence = activity_sequence;

  if (sequence === undefined || sequence === null || sequence === "") {
    const [sequenceRows] = await db.query(
      `
                    SELECT
                        COALESCE(
                            MAX(activity_sequence),
                            0
                        ) + 1 AS next_sequence

                    FROM package_itinerary_activities

                    WHERE itinerary_id = ?
                `,
      [itinerary_id],
    );

    sequence = sequenceRows[0].next_sequence;
  }

  // ------------------------------------------
  // Insert activity
  // ------------------------------------------

  const [result] = await db.query(
    `
            INSERT INTO
                package_itinerary_activities
            (
                itinerary_id,
                activity_sequence,
                activity_name,
                activity_type,
                description,
                is_optional,
                additional_cost,
                currency,
                cost_unit
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
    [
      itinerary_id,
      sequence,
      activity_name,
      activity_type || null,
      description || null,
      is_optional !== undefined ? is_optional : 0,
      additional_cost !== undefined ? additional_cost : null,
      currency || null,
      cost_unit || null,
    ],
  );

  // ------------------------------------------
  // Get created activity
  // ------------------------------------------

  const [rows] = await db.query(
    `
            SELECT
                activity_id,
                itinerary_id,
                activity_sequence,
                activity_name,
                activity_type,
                description,
                is_optional,
                additional_cost,
                currency,
                cost_unit

            FROM package_itinerary_activities

            WHERE activity_id = ?
        `,
    [result.insertId],
  );

  return rows[0];
}

// ==========================================
// UPDATE ITINERARY DESTINATIONS
// ==========================================

async function updateDestinations(packageId, destinations) {
  // ------------------------------------------
  // Validate destination data
  // ------------------------------------------

  if (!Array.isArray(destinations)) {
    throw new Error("Invalid destination data");
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
    [packageId],
  );

  if (packageRows.length === 0) {
    return null;
  }

  // ------------------------------------------
  // Update each destination
  // ------------------------------------------

  for (const destination of destinations) {
    if (!destination.itinerary_destination_id) {
      continue;
    }

    // --------------------------------------
    // Make sure destination belongs
    // to this package
    // --------------------------------------

    const [destinationRows] = await db.query(
      `
                SELECT
                    pid.itinerary_destination_id
                FROM package_itinerary_destinations pid

                INNER JOIN package_itineraries pi
                    ON pid.itinerary_id = pi.itinerary_id

                WHERE pid.itinerary_destination_id = ?
                  AND pi.package_id = ?
            `,
      [destination.itinerary_destination_id, packageId],
    );

    if (destinationRows.length === 0) {
      continue;
    }

    // --------------------------------------
    // Find actual destination ID
    // --------------------------------------

    const [destinationIdRows] = await db.query(
      `
                SELECT destination_id
                FROM package_itinerary_destinations
                WHERE itinerary_destination_id = ?
            `,
      [destination.itinerary_destination_id],
    );

    if (destinationIdRows.length === 0) {
      continue;
    }

    const destinationId = destinationIdRows[0].destination_id;

    // --------------------------------------
    // Update destination name
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(destination, "destination_name")) {
      await db.query(
        `
                    UPDATE destinations
                    SET destination_name = ?
                    WHERE destination_id = ?
                `,
        [destination.destination_name, destinationId],
      );
    }
  }

  // ------------------------------------------
  // Return updated package
  // ------------------------------------------

  return await getPackageById(packageId);
}

// ==========================================
// UPDATE ITINERARY ACTIVITIES
// ==========================================
// PUT /api/packages/:id/itineraries/activities
// ==========================================

async function updateActivities(packageId, activities) {
  // ------------------------------------------
  // Validate activity data
  // ------------------------------------------

  if (!Array.isArray(activities)) {
    throw new Error("Invalid activity data");
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
    [packageId],
  );

  if (packageRows.length === 0) {
    return null;
  }

  // ------------------------------------------
  // Update each activity
  // ------------------------------------------

  for (const activity of activities) {
    // --------------------------------------
    // Skip activity if no ID
    // --------------------------------------

    if (!activity.activity_id) {
      continue;
    }

    // --------------------------------------
    // Make sure activity belongs
    // to this package
    // --------------------------------------

    const [activityRows] = await db.query(
      `
                SELECT
                    pia.activity_id
                FROM package_itinerary_activities pia

                INNER JOIN package_itineraries pi
                    ON pia.itinerary_id = pi.itinerary_id

                WHERE pia.activity_id = ?
                  AND pi.package_id = ?
            `,
      [activity.activity_id, packageId],
    );

    if (activityRows.length === 0) {
      continue;
    }

    // --------------------------------------
    // Build dynamic UPDATE
    // --------------------------------------

    const updates = [];
    const params = [];

    // --------------------------------------
    // Activity name
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(activity, "activity_name")) {
      updates.push("activity_name = ?");
      params.push(activity.activity_name);
    }

    // --------------------------------------
    // Activity type
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(activity, "activity_type")) {
      updates.push("activity_type = ?");
      params.push(activity.activity_type);
    }

    // --------------------------------------
    // Description
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(activity, "description")) {
      updates.push("description = ?");
      params.push(activity.description);
    }

    // --------------------------------------
    // Optional status
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(activity, "is_optional")) {
      updates.push("is_optional = ?");
      params.push(activity.is_optional);
    }

    // --------------------------------------
    // Additional cost
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(activity, "additional_cost")) {
      updates.push("additional_cost = ?");
      params.push(activity.additional_cost);
    }

    // --------------------------------------
    // Currency
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(activity, "currency")) {
      updates.push("currency = ?");
      params.push(activity.currency);
    }

    // --------------------------------------
    // Cost unit
    // --------------------------------------

    if (Object.prototype.hasOwnProperty.call(activity, "cost_unit")) {
      updates.push("cost_unit = ?");
      params.push(activity.cost_unit);
    }

    // --------------------------------------
    // Nothing to update
    // --------------------------------------

    if (updates.length === 0) {
      continue;
    }

    // --------------------------------------
    // Add activity ID
    // --------------------------------------

    params.push(activity.activity_id);

    // --------------------------------------
    // Execute UPDATE
    // --------------------------------------

    await db.query(
      `
                UPDATE package_itinerary_activities

                SET
                    ${updates.join(", ")}

                WHERE activity_id = ?
            `,
      params,
    );
  }

  // ------------------------------------------
  // Return updated package
  // ------------------------------------------

  return await getPackageById(packageId);
}

// ==========================================
// EXPORT SERVICE FUNCTIONS
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
