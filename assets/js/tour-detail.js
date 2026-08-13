/* ==========================================
   TOUR DETAIL PAGE
   LOAD PACKAGE FROM DATABASE
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  initializeAdminMode();
  loadTourDetail();
});

/* ==========================================
   1. GET PACKAGE ID FROM URL
   ========================================== */

function getPackageId() {
  const params = new URLSearchParams(window.location.search);

  return params.get("id");
}

/* ==========================================
   2. LOAD PACKAGE
   ========================================== */

async function loadTourDetail() {
  const packageId = getPackageId();

  const loadingMessage = document.getElementById("loadingMessage");

  const errorMessage = document.getElementById("errorMessage");

  const tourDetail = document.getElementById("tourDetail");

  if (!packageId) {
    if (loadingMessage) {
      loadingMessage.style.display = "none";
    }

    if (errorMessage) {
      errorMessage.style.display = "block";

      errorMessage.textContent = "ID paket tidak tersedia.";
    }

    return;
  }

  try {
    console.log(`Loading package ID: ${packageId}`);

    const response = await fetch(`/api/packages/${packageId}`);

    console.log("API response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const pkg = await response.json();

    console.log("PACKAGE DETAIL RECEIVED:", pkg);

    renderPackage(pkg);

    if (loadingMessage) {
      loadingMessage.style.display = "none";
    }

    if (errorMessage) {
      errorMessage.style.display = "none";
    }

    if (tourDetail) {
      tourDetail.style.display = "block";
    }

    // Reconnect admin fields
    syncInputFieldsToText();
  } catch (error) {
    console.error("Error loading package detail:", error);

    if (loadingMessage) {
      loadingMessage.style.display = "none";
    }

    if (tourDetail) {
      tourDetail.style.display = "none";
    }

    if (errorMessage) {
      errorMessage.style.display = "block";

      errorMessage.innerHTML = `
                <h2>Gagal memuat detail paket.</h2>
                <p>
                    ${escapeHtml(error.message)}
                </p>
            `;
    }
  }
}

/* ==========================================
   3. RENDER PACKAGE
   ========================================== */

function renderPackage(pkg) {
  // ------------------------------------------
  // HEADER
  // ------------------------------------------

  const packageName = document.getElementById("packageName");

  const packageNameInput = document.getElementById("packageNameInput");

  if (packageName) {
    packageName.textContent = pkg.package_name || "";
  }

  if (packageNameInput) {
    packageNameInput.value = pkg.package_name || "";
  }

  // ------------------------------------------
  // PRICE
  // ------------------------------------------

  const packagePrice = document.getElementById("packagePrice");

  const packagePriceInput = document.getElementById("packagePriceInput");

  if (packagePrice) {
    packagePrice.textContent = "Harga lihat detail";
  }

  if (packagePriceInput) {
    packagePriceInput.value = "Harga lihat detail";
  }

  // ------------------------------------------
  // PACKAGE CODE
  // ------------------------------------------

  const packageCode = document.getElementById("packageCode");

  const packageCodeInput = document.getElementById("packageCodeInput");

  if (packageCode) {
    packageCode.textContent = pkg.package_code || "";
  }

  if (packageCodeInput) {
    packageCodeInput.value = pkg.package_code || "";
  }

  // ------------------------------------------
  // PACKAGE TYPE
  // ------------------------------------------

  const packageType = document.getElementById("packageType");

  const packageTypeInput = document.getElementById("packageTypeInput");

  if (packageType) {
    packageType.textContent = pkg.package_type || "";
  }

  if (packageTypeInput) {
    packageTypeInput.value = pkg.package_type || "";
  }

  // ------------------------------------------
  // DURATION
  // ------------------------------------------

  const duration = `${pkg.duration_days} Hari / ${pkg.duration_nights} Malam`;

  const packageDuration = document.getElementById("packageDuration");

  const packageDurationInput = document.getElementById("packageDurationInput");

  if (packageDuration) {
    packageDuration.textContent = duration;
  }

  if (packageDurationInput) {
    packageDurationInput.value = duration;
  }

  // ------------------------------------------
  // PERIOD
  // ------------------------------------------

  const validPeriod = formatPeriod(pkg.valid_from, pkg.valid_until);

  const packagePeriod = document.getElementById("packagePeriod");

  const packagePeriodInput = document.getElementById("packagePeriodInput");

  if (packagePeriod) {
    packagePeriod.textContent = validPeriod;
  }

  if (packagePeriodInput) {
    packagePeriodInput.value = validPeriod;
  }

  // ------------------------------------------
  // STATUS
  // ------------------------------------------

  const packageStatus = document.getElementById("packageStatus");

  const packageStatusInput = document.getElementById("packageStatusInput");

  if (packageStatus) {
    packageStatus.textContent = pkg.status || "";
  }

  if (packageStatusInput) {
    packageStatusInput.value = pkg.status || "";
  }

  // ------------------------------------------
  // DESCRIPTION
  // ------------------------------------------

  const packageDescription = document.getElementById("packageDescription");

  const packageDescriptionInput = document.getElementById(
    "packageDescriptionInput",
  );

  const description = pkg.description || "";

  if (packageDescription) {
    packageDescription.textContent = description || "Tidak ada deskripsi.";
  }

  if (packageDescriptionInput) {
    packageDescriptionInput.value = description;
  }

  // ------------------------------------------
  // SIDEBAR
  // ------------------------------------------

  const sidebarCode = document.getElementById("sidebarCode");

  const sidebarDuration = document.getElementById("sidebarDuration");

  const sidebarPeriod = document.getElementById("sidebarPeriod");

  if (sidebarCode) {
    sidebarCode.textContent = pkg.package_code || "";
  }

  if (sidebarDuration) {
    sidebarDuration.textContent = duration;
  }

  if (sidebarPeriod) {
    sidebarPeriod.textContent = validPeriod;
  }

  // ------------------------------------------
  // HOTEL OPTIONS
  // ------------------------------------------

  const hotelContainer = document.getElementById("hotelOptions");

  if (hotelContainer) {
    hotelContainer.innerHTML = renderHotelOptions(pkg.hotel_options || []);
  }

  // ------------------------------------------
  // ITINERARY
  // ------------------------------------------

  const itineraryContainer = document.getElementById("itineraryList");

  if (itineraryContainer) {
    itineraryContainer.innerHTML = renderItineraries(pkg.itineraries || []);
  }

  // ------------------------------------------
  // WHATSAPP
  // ------------------------------------------

  const whatsapp = document.getElementById("whatsappBooking");

  if (whatsapp) {
    whatsapp.href = createWhatsAppLink(pkg);
  }
}

/* ==========================================
   4. RENDER HOTEL OPTIONS
   ========================================== */

function renderHotelOptions(options) {
    if (!options.length) {
        return `
            <p class="empty-data">
                Belum ada pilihan hotel.
            </p>
        `;
    }

    return options
        .map((option) => {
            const prices = option.prices || [];

            return `
                <div
                    class="hotel-option"
                    data-option-id="${option.option_id}"
                >

                    <div class="hotel-option-name">

                        <i class="fa-solid fa-bed"></i>

                        ${escapeHtml(
                            option.option_name
                        )}

                    </div>


                    <div class="hotel-option-description">

                        <p class="editable-text">
                            ${escapeHtml(
                                option.description || ""
                            )}
                        </p>

                        <textarea
                            class="admin-edit-field hotel-description-input"
                            placeholder="Masukkan nama/informasi hotel"
                        >${escapeHtml(
                            option.description || ""
                        )}</textarea>

                    </div>


                    ${
                        prices.length
                            ? prices
                                .map(
                                    (price) => `
                                    
                                    <div
                                        class="hotel-price"
                                        data-price-id="${price.price_id}"
                                    >

                                        <span>
                                            ${escapeHtml(
                                                price.occupancy_name ||
                                                price.occupancy_code ||
                                                "Harga"
                                            )}
                                        </span>

                                        <strong class="editable-text">
                                            ${formatPrice(
                                                price.price,
                                                price.currency
                                            )}
                                        </strong>

                                        <input
                                            type="number"
                                            class="admin-edit-field hotel-price-input"
                                            value="${price.price ?? ""}"
                                            min="0"
                                            step="500"
                                        >

                                    </div>

                                `
                                )
                                .join("")
                            : `
                                <p>
                                    Harga belum tersedia.
                                </p>
                            `
                    }

                </div>
            `;
        })
        .join("");
}

/* ==========================================
   5. RENDER ITINERARIES
   ========================================== */

function renderItineraries(itineraries) {
  if (!itineraries || !itineraries.length) {
    return `
            <div class="empty-data">
                <i class="fa-solid fa-route"></i>
                <p>Itinerary belum tersedia.</p>
            </div>
        `;
  }

  return `
        <div class="itinerary-container">

            ${itineraries
              .map((day) => {
                const destinations = day.destinations || [];

                const activities = day.activities || [];

                return `
                    <article class="itinerary-day">

                        <!-- DAY HEADER -->
                        <div class="itinerary-day-header">

                            <div class="day-number">
                                DAY ${day.day_number}
                            </div>

                            <div class="day-title-wrapper">

                                <h3>
                                    ${escapeHtml(
                                      day.title ||
                                        `Perjalanan Hari ${day.day_number}`,
                                    )}
                                </h3>

                                ${
                                  day.description
                                    ? `
                                        <p class="day-description">
                                            ${escapeHtml(day.description)}
                                        </p>
                                    `
                                    : ""
                                }

                            </div>

                        </div>


                        <!-- DESTINATIONS -->
                        ${
                          destinations.length
                            ? `
                                <div class="itinerary-destinations">

                                    ${destinations
                                      .map(
                                        (destination) => `

                                        <div class="destination-card">

                                            <div class="destination-card-title">

                                                <i class="fa-solid fa-location-dot"></i>

                                                <strong>
                                                    ${escapeHtml(
                                                      destination.destination_name,
                                                    )}
                                                </strong>

                                            </div>

                                            ${
                                              destination.destination_type
                                                ? `
                                                    <span class="destination-badge">
                                                        ${escapeHtml(
                                                          destination.destination_type,
                                                        )}
                                                    </span>
                                                `
                                                : ""
                                            }

                                        </div>

                                    `,
                                      )
                                      .join("")}

                                </div>
                            `
                            : ""
                        }


                        <!-- ACTIVITIES -->
                        ${
                          activities.length
                            ? `
                                <div class="itinerary-activities">

                                    ${activities
                                      .map(
                                        (activity) => `

                                        <div class="activity-item">

                                            <div class="activity-marker">
                                                <i class="fa-solid fa-circle"></i>
                                            </div>

                                            <div class="activity-content">

                                                <div class="activity-title">

                                                    <strong>
                                                        ${escapeHtml(
                                                          activity.activity_name,
                                                        )}
                                                    </strong>

                                                    ${
                                                      activity.activity_type
                                                        ? `
                                                            <span class="activity-type">
                                                                ${escapeHtml(
                                                                  activity.activity_type,
                                                                )}
                                                            </span>
                                                        `
                                                        : ""
                                                    }

                                                    ${
                                                      activity.is_optional
                                                        ? `
                                                            <span class="activity-optional">
                                                                Optional
                                                            </span>
                                                        `
                                                        : ""
                                                    }

                                                </div>

                                                ${
                                                  activity.description
                                                    ? `
                                                        <p>
                                                            ${escapeHtml(
                                                              activity.description,
                                                            )}
                                                        </p>
                                                    `
                                                    : ""
                                                }

                                            </div>

                                        </div>

                                    `,
                                      )
                                      .join("")}

                                </div>
                            `
                            : ""
                        }

                    </article>
                `;
              })
              .join("")}

        </div>
    `;
}

/* ==========================================
   6. FORMAT PERIOD
   ========================================== */

function formatPeriod(from, until) {
  if (!from || !until) {
    return "Periode belum ditentukan";
  }

  const fromDate = new Date(from);

  const untilDate = new Date(until);

  if (isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
    return `${from} - ${until}`;
  }

  return `
        ${formatDate(fromDate)}
        -
        ${formatDate(untilDate)}
    `
    .replace(/\s+/g, " ")
    .trim();
}

/* ==========================================
   7. FORMAT DATE
   ========================================== */

function formatDate(date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ==========================================
   8. FORMAT PRICE
   ========================================== */

function formatPrice(price, currency) {
  if (price === null || price === undefined) {
    return "Harga belum tersedia";
  }

  const numericPrice = Number(price);

  if (isNaN(numericPrice)) {
    return `${currency || ""} ${price}`;
  }

  if (currency === "IDR" || currency === "Rp") {
    return `Rp ${numericPrice.toLocaleString("id-ID")}`;
  }

  return `
        ${currency || ""}
        ${numericPrice.toLocaleString("id-ID")}
    `.trim();
}

/* ==========================================
   9. WHATSAPP LINK
   ========================================== */

function createWhatsAppLink(pkg) {
  const message = `Halo Admin, saya ingin pesan paket ${pkg.package_name} (${pkg.package_code})`;

  return `
        https://wa.me/6282199812234?text=${encodeURIComponent(message)}
    `;
}

/* ==========================================
   10. ADMIN MODE
   ========================================== */

function initializeAdminMode() {
  if (localStorage.getItem("adminMode") === "true") {
    enableAdminUI();
  }

  const adminBtn = document.getElementById("adminLoginBtn");

  if (adminBtn) {
    adminBtn.addEventListener("click", (event) => {
      event.preventDefault();

      toggleAdminLogin();
    });
  }
}

function toggleAdminLogin() {
  if (localStorage.getItem("adminMode") === "true") {
    alert("Anda sudah masuk sebagai Admin!");

    enableAdminUI();

    return;
  }

  const password = prompt(
    "Masukkan Kata Sandi Admin (Demo Password: admin123):",
  );

  if (password === "admin123") {
    localStorage.setItem("adminMode", "true");

    enableAdminUI();

    alert("Berhasil masuk sebagai Admin!");
  } else if (password !== null) {
    alert("Password Salah!");
  }
}

function logoutAdmin() {
  localStorage.removeItem("adminMode");

  disableAdminUI();

  alert("Anda telah keluar dari Admin Mode.");
}

function enableAdminUI() {
  document.body.classList.add("admin-mode");

  const adminBar = document.getElementById("adminBar");

  if (adminBar) {
    adminBar.classList.add("active");

    adminBar.style.display = "flex";
  }

  const adminLoginBtn = document.getElementById("adminLoginBtn");

  if (adminLoginBtn) {
    adminLoginBtn.style.display = "none";
  }

  syncInputFieldsToText();
}

function disableAdminUI() {
  document.body.classList.remove("admin-mode");

  const adminBar = document.getElementById("adminBar");

  if (adminBar) {
    adminBar.classList.remove("active");

    adminBar.style.display = "none";
  }

  const adminLoginBtn = document.getElementById("adminLoginBtn");

  if (adminLoginBtn) {
    adminLoginBtn.style.display = "inline-flex";
  }

  const saveButton = document.getElementById("savePackageBtn");

  if (saveButton) {
    saveButton.disabled = false;

    saveButton.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Simpan Perubahan
        `;
  }
}

/* ==========================================
   11. ADMIN FIELD SYNC
   ========================================== */

function syncInputFieldsToText() {
  const inputs = document.querySelectorAll(".admin-edit-field");

  inputs.forEach((input) => {
    if (input.dataset.syncAttached === "true") {
      return;
    }

    input.dataset.syncAttached = "true";

    input.addEventListener("input", () => {
      const parent = input.parentElement;

      if (!parent) return;

      const textElement = parent.querySelector(".editable-text");

      if (textElement) {
        textElement.textContent = input.value;
      }
    });
  });
}

/* ==========================================
   12. SAVE PACKAGE + HOTELS
   PUT /api/packages/:id
   PUT /api/packages/:id/hotels
   ========================================== */

async function savePackage() {

    const packageId = getPackageId();

    if (!packageId) {

        alert("ID paket tidak ditemukan.");

        return;
    }


    const saveButton =
        document.getElementById(
            "savePackageBtn"
        );


    // ==========================================
    // GET PACKAGE FIELDS
    // ==========================================

    const packageName =
        document
            .getElementById("packageNameInput")
            ?.value
            .trim();

    const packageCode =
        document
            .getElementById("packageCodeInput")
            ?.value
            .trim();

    const packageType =
        document
            .getElementById("packageTypeInput")
            ?.value
            .trim();

    const packageDuration =
        document
            .getElementById("packageDurationInput")
            ?.value
            .trim();

    const packagePeriod =
        document
            .getElementById("packagePeriodInput")
            ?.value
            .trim();

    const packageStatus =
        document
            .getElementById("packageStatusInput")
            ?.value
            .trim();

    const packageDescription =
        document
            .getElementById("packageDescriptionInput")
            ?.value
            .trim();


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!packageName) {

        alert(
            "Nama paket tidak boleh kosong."
        );

        return;
    }


    if (!packageCode) {

        alert(
            "Kode paket tidak boleh kosong."
        );

        return;
    }


    // ==========================================
    // PARSE DURATION
    // ==========================================

    const durationMatch =
        packageDuration.match(
            /(\d+)\s*Hari\s*\/\s*(\d+)\s*Malam/i
        );


    if (!durationMatch) {

        alert(
            "Format durasi harus seperti: 4 Hari / 3 Malam"
        );

        return;
    }


    const durationDays =
        Number(durationMatch[1]);

    const durationNights =
        Number(durationMatch[2]);


    // ==========================================
    // PARSE PERIOD
    // ==========================================

    const periodDates =
        parsePeriod(packagePeriod);


    if (!periodDates) {

        alert(
            "Format periode tidak dikenali. Contoh: 01 Jul 2026 - 31 Oct 2026"
        );

        return;
    }


    // ==========================================
    // PACKAGE PAYLOAD
    // ==========================================

    const payload = {

        package_code:
            packageCode,

        package_name:
            packageName,

        package_type:
            packageType,

        duration_days:
            durationDays,

        duration_nights:
            durationNights,

        valid_from:
            periodDates.from,

        valid_until:
            periodDates.until,

        description:
            packageDescription,

        status:
            packageStatus
    };


    // ==========================================
    // COLLECT HOTEL CHANGES
    // ==========================================

    const hotelChanges = [];


    document
        .querySelectorAll(
            "#hotelOptions .hotel-option"
        )
        .forEach((optionElement) => {

            const optionId =
                optionElement.dataset.optionId;


            if (!optionId) {

                console.warn(
                    "Hotel option has no option ID:",
                    optionElement
                );

                return;
            }


            // --------------------------------------
            // HOTEL DESCRIPTION
            // --------------------------------------

            const descriptionInput =
                optionElement.querySelector(
                    ".hotel-description-input"
                );


            // --------------------------------------
            // HOTEL PRICES
            // --------------------------------------

            const prices = [];


            optionElement
                .querySelectorAll(
                    ".hotel-price"
                )
                .forEach((priceElement) => {

                    const priceId =
                        priceElement.dataset.priceId;


                    const priceInput =
                        priceElement.querySelector(
                            ".hotel-price-input"
                        );


                    if (
                        !priceId ||
                        !priceInput
                    ) {

                        return;
                    }


                    prices.push({

                        price_id:
                            Number(priceId),

                        price:
                            Number(
                                priceInput.value
                            )
                    });

                });


            // --------------------------------------
            // ADD HOTEL CHANGE
            // --------------------------------------

            hotelChanges.push({

                option_id:
                    Number(optionId),

                description:
                    descriptionInput
                        ? descriptionInput.value.trim()
                        : "",

                prices:
                    prices

            });

        });


    console.log(
        "HOTEL CHANGES:",
        hotelChanges
    );


    console.log(
        "HOTEL CHANGES JSON:",
        JSON.stringify(
            hotelChanges,
            null,
            2
        )
    );


    console.log(
        "PACKAGE PAYLOAD:",
        payload
    );


    // ==========================================
    // DISABLE SAVE BUTTON
    // ==========================================

    if (saveButton) {

        saveButton.disabled = true;

        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Menyimpan...
        `;
    }


    // ==========================================
    // SAVE
    // ==========================================

    try {

        // ======================================
        // 1. SAVE PACKAGE
        // ======================================

        console.log(
            "Updating package:",
            packageId
        );


        const response =
            await fetch(
                `/api/packages/${packageId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const result =
            await response.json();


        console.log(
            "PACKAGE UPDATE RESPONSE:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Gagal menyimpan perubahan paket."
            );
        }


        // ======================================
        // 2. SAVE HOTELS
        // ======================================

        console.log(
            "Updating hotels:",
            packageId
        );


        const hotelResponse =
            await fetch(
                `/api/packages/${packageId}/hotels`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            hotels:
                                hotelChanges
                        })
                }
            );


        const hotelResult =
            await hotelResponse.json();


        console.log(
            "HOTEL UPDATE RESPONSE:",
            hotelResult
        );


        if (!hotelResponse.ok) {

            throw new Error(
                hotelResult.message ||
                "Gagal menyimpan perubahan hotel."
            );
        }


        // ======================================
        // SUCCESS
        // ======================================

        alert(
            "Perubahan paket dan hotel berhasil disimpan!"
        );


        // ======================================
        // RELOAD FROM DATABASE
        // ======================================

        await loadTourDetail();


    } catch (error) {

        console.error(
            "Error saving package:",
            error
        );


        alert(
            `Gagal menyimpan perubahan:\n${error.message}`
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Simpan Perubahan
            `;
        }
    }
}

/* ==========================================
   13. PARSE PERIOD
   ========================================== */

function parsePeriod(value) {
  if (!value) {
    return null;
  }

  const parts = value.split(/\s+-\s+/);

  if (parts.length !== 2) {
    return null;
  }

  const from = parseIndonesianDate(parts[0].trim());

  const until = parseIndonesianDate(parts[1].trim());

  if (!from || !until) {
    return null;
  }

  return {
    from,
    until,
  };
}

/* ==========================================
   14. PARSE INDONESIAN DATE
   ========================================== */

function parseIndonesianDate(value) {
  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    Mei: 4,
    Jun: 5,
    Jul: 6,
    Agu: 7,
    Sep: 8,
    Okt: 9,
    Nov: 10,
    Des: 11,
  };

  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);

  const monthName = match[2];

  const year = Number(match[3]);

  const month = monthMap[monthName];

  if (month === undefined) {
    return null;
  }

  const date = new Date(Date.UTC(year, month, day));

  return date.toISOString().split("T")[0];
}

/* ==========================================
   15. IMAGE PREVIEW
   ========================================== */

function updateDetailImage(input) {
  if (!input.files || !input.files[0]) {
    return;
  }

  const file = input.files[0];

  const reader = new FileReader();

  reader.onload = function (event) {
    const wrapper = input.closest(".detail-banner-wrapper");

    if (!wrapper) return;

    const placeholder = wrapper.querySelector(".detail-banner-placeholder");

    if (placeholder) {
      placeholder.outerHTML = `

                    <img
                        src="${event.target.result}"
                        class="detail-banner"
                        alt="Package Banner"
                    >

                `;
    }
  };

  reader.readAsDataURL(file);
}

/* ==========================================
   16. HTML ESCAPING
   ========================================== */

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
