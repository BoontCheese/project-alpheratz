/* ==========================================
   1. AUTO INITIALIZE ADMIN MODE (ON LOAD)
========================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in via localStorage
  if (localStorage.getItem("adminMode") === "true") {
    enableAdminUI();
  }

  // Fallback: Attach direct click listener in case inline 'onclick' fails
  const adminBtn = document.getElementById("adminLoginBtn");
  if (adminBtn) {
    adminBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleAdminLogin();
    });
  }
});

/* ==========================================
   2. FILTER TOURS (DOMESTIC / INT / ALL)
========================================== */
function filterTours(category, e) {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  if (e && e.target) {
    e.target.classList.add("active");
  }

  const cards = document.querySelectorAll(".promo-card");
  cards.forEach((card) => {
    if (category === "all" || card.dataset.category === category) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

/* ==========================================
   3. ADMIN SIGN-IN & LOCALSTORAGE LOGIC
========================================== */
function toggleAdminLogin() {
  // If already logged in, prompt user or re-trigger UI setup
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
  syncInputsToDisplay();
  alert("Anda telah keluar dari Admin Mode.");
}

function enableAdminUI() {
  document.body.classList.add("admin-mode");

  const adminBar = document.getElementById("adminBar");
  if (adminBar) {
    adminBar.classList.add("active");
    adminBar.style.display = "flex"; // Explicit inline style force
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
}

/* ==========================================
   4. INLINE EDITING SYNC (CARDS & DETAILS)
========================================== */
function syncInputsToDisplay() {
  const containers = document.querySelectorAll(
    ".promo-card, .tour-detail-container",
  );

  containers.forEach((container) => {
    const editableParents = container.querySelectorAll("li, p, div, header");
    editableParents.forEach((parent) => {
      const textEl = parent.querySelector(".editable-text");
      const inputEl = parent.querySelector(".admin-edit-field");
      if (textEl && inputEl) {
        textEl.textContent = inputEl.value;
      }
    });
  });
}

function syncInputFieldsToText() {
  const inputs = document.querySelectorAll(".admin-edit-field");

  inputs.forEach((inputEl) => {
    const parent = inputEl.parentElement;
    if (!parent) return;

    const textEl = parent.querySelector(".editable-text");
    if (textEl) {
      inputEl.addEventListener("input", () => {
        textEl.textContent = inputEl.value;
      });
    }
  });
}

/* ==========================================
   5. IMAGE UPLOADER
========================================== */
function updateCardImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgWrapper = input.closest(".card-img-wrapper");
      if (imgWrapper) {
        const img = imgWrapper.querySelector(".card-img");
        if (img) img.src = e.target.result;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

/* ==========================================
   6. LOAD TOUR PACKAGES FROM DATABASE API
   ========================================== */

const promoGrid = document.getElementById("promoGrid");

async function loadTourPackages() {
  if (!promoGrid) {
    console.error("promoGrid element not found.");
    return;
  }

  try {
    const response = await fetch("/api/packages");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const packages = await response.json();

    // Clear existing static cards
    promoGrid.innerHTML = "";

    packages.forEach((pkg) => {
      const categoryKey =
        pkg.package_type === "INTERNATIONAL" ? "international" : "domestic";

      const categoryLabel =
        pkg.package_type === "INTERNATIONAL" ? "Mancanegara" : "Domestik";

      const formattedPrice = "Harga lihat detail";

      const formatDate = (dateString) => {
        if (!dateString) return null;

        const date = new Date(dateString);

        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      const validPeriod =
        pkg.valid_from && pkg.valid_until
          ? `${formatDate(pkg.valid_from)} - ${formatDate(pkg.valid_until)}`
          : "Periode belum ditentukan";

      promoGrid.innerHTML += `
                <article
                    class="promo-card"
                    data-category="${categoryKey}"
                    data-package-id="${pkg.package_id}"
                >

                    <div class="card-img-wrapper">

                        <span class="badge-category">
                            ${categoryLabel}
                        </span>

                        <div class="card-img-placeholder">
                            <i class="fa-solid fa-plane-departure"></i>
                        </div>

                        <label class="admin-img-upload">
                            <i class="fa-solid fa-camera"></i>
                            Ubah Gambar
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onchange="updateCardImage(this)"
                            >
                        </label>

                    </div>

                    <div class="card-body">

                        <span class="editable-text destination-title">
                            ${pkg.package_name}
                        </span>

                        <input
                            type="text"
                            class="admin-edit-field"
                            value="${pkg.package_name}"
                        >

                        <div class="info-item">
                            <i class="fa-solid fa-hashtag"></i>

                            <span class="editable-text">
                                Kode Paket: ${pkg.package_code}
                            </span>

                            <input
                                type="text"
                                class="admin-edit-field"
                                value="Kode Paket: ${pkg.package_code}"
                            >
                        </div>

                        <div class="info-item">
                            <i class="fa-solid fa-calendar-days"></i>

                            <span class="editable-text">
                                Periode: ${validPeriod}
                            </span>

                            <input
                                type="text"
                                class="admin-edit-field"
                                value="Periode: ${validPeriod}"
                            >
                        </div>

                        <div class="info-item">
                            <i class="fa-solid fa-moon"></i>

                            <span class="editable-text">
                                ${pkg.duration_days} Hari /
                                ${pkg.duration_nights} Malam
                            </span>

                            <input
                                type="text"
                                class="admin-edit-field"
                                value="${pkg.duration_days} Hari / ${pkg.duration_nights} Malam"
                            >
                        </div>

                        <div class="price-tag">
                            <span class="editable-text">
                                ${formattedPrice}
                            </span>

                            <input
                                type="text"
                                class="admin-edit-field"
                                value="${formattedPrice}"
                            >
                        </div>

                        <div class="itinerary-preview">

                            <strong>Deskripsi Paket:</strong>

                            <p class="editable-text">
                                ${pkg.description || "Tidak ada deskripsi."}
                            </p>

                            <textarea class="admin-edit-field">${pkg.description || ""}</textarea>

                        </div>

                        <div class="card-actions">

                            <a
                                href="/pages/tour-detail.html?id=${pkg.package_id}"
                                class="btn-detail"
                            >
                                Lihat Detail Paket
                            </a>

                        </div>

                    </div>

                </article>
            `;
    });

    // Reconnect admin editing listeners
    syncInputFieldsToText();

    // Re-apply current filter if necessary
    const activeButton = document.querySelector(".tab-btn.active");

    if (activeButton) {
      const category = activeButton.dataset.category;

      if (category) {
        filterTours(category);
      }
    }
  } catch (error) {
    console.error("Error fetching tour packages:", error);

    promoGrid.innerHTML = `
            <div class="api-error">
                <p>Gagal memuat data paket tour.</p>
                <small>${error.message}</small>
            </div>
        `;
  }
}

// Load packages when page is ready
document.addEventListener("DOMContentLoaded", loadTourPackages);
