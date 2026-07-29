document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       0. UTILITY FUNCTIONS
    ========================================== */
    /**
     * Closes the mobile navigation menu if it is currently open.
     */
    function closeMobileMenu() {
        const mobileMenu = document.querySelector(".mobile-menu");
        const menuIcon = document.querySelector(".menu-toggle i");
        if (mobileMenu && mobileMenu.classList.contains("active")) {
            mobileMenu.classList.remove("active");
            document.body.classList.remove("menu-open");
            if (menuIcon) {
                menuIcon.classList.remove("fa-xmark");
                menuIcon.classList.add("fa-bars");
            }
        }
    }

    /* ==========================================
       1. TAB SWITCHING (NAVBAR & WIDGET TABS)
    ========================================== */
    const tabs = document.querySelectorAll(".tab");
    const forms = document.querySelectorAll(".booking-form");
    const navTabLinks = document.querySelectorAll("[data-tab]");

    /**
     * Activates a specific tab and form panel
     * @param {string} tabName - 'flight', 'hotel', 'tour', or 'car'
     */
    function switchTab(tabName) {
        tabs.forEach(tab => tab.classList.remove("active"));
        forms.forEach(form => form.classList.remove("active"));

        const targetTab = document.querySelector(`.tab[data-form="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add("active");
        }

        const targetForm = document.getElementById(`${tabName}-form`);
        if (targetForm) {
            targetForm.classList.add("active");
        }
    }

    // Click handler for tab buttons inside widget
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const tabName = tab.getAttribute("data-form");
            if (tabName) switchTab(tabName);
        });
    });

    // Click handler for Navbar links
    navTabLinks.forEach(link => {
        link.addEventListener("click", () => {
            const tabName = link.getAttribute("data-tab");
            if (tabName) {
                switchTab(tabName);

                const bookingWidget = document.querySelector(".booking-widget");
                if (bookingWidget) {
                    bookingWidget.scrollIntoView({ behavior: "smooth", block: "start" });
                }

                closeMobileMenu();
            }
        });
    });

    /* ==========================================
       2. REVERSIBLE / SWAP DESTINATION
    ========================================== */
    function setupSwap(buttonId, fromInputId, toInputId) {
        const swapBtn = document.getElementById(buttonId);
        const fromInput = document.getElementById(fromInputId);
        const toInput = document.getElementById(toInputId);

        if (swapBtn && fromInput && toInput) {
            swapBtn.addEventListener("click", () => {
                const tempVal = fromInput.value;
                fromInput.value = toInput.value;
                toInput.value = tempVal;

                swapBtn.style.transform = "scale(0.9) rotate(180deg)";
                setTimeout(() => {
                    swapBtn.style.transform = "";
                }, 200);
            });
        }
    }

    setupSwap("swap-flight-btn", "flight-from", "flight-to");
    setupSwap("swap-car-btn", "car-from", "car-to");

    /* ==========================================
       3. INTERSECTION OBSERVER (REVEAL ANIMATIONS)
    ========================================== */
    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(".service-grid, .destination-grid, .youtube-grid, .contact-grid").forEach((grid) => {
        const children = grid.querySelectorAll(".reveal");
        children.forEach((child, index) => {
            child.style.transitionDelay = `${index * 80}ms`;
        });
    });

    document.querySelectorAll(".reveal").forEach((section) => {
        observer.observe(section);
    });

    /* ==========================================
       4. MOBILE MENU TOGGLE
    ========================================== */
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const menuIcon = document.querySelector(".menu-toggle i");

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("active");
            document.body.classList.toggle("menu-open");

            if (mobileMenu.classList.contains("active")) {
                menuIcon.classList.remove("fa-bars");
                menuIcon.classList.add("fa-xmark");
            } else {
                menuIcon.classList.remove("fa-xmark");
                menuIcon.classList.add("fa-bars");
            }
        });

        document.querySelectorAll(".mobile-menu a").forEach((link) => {
            link.addEventListener("click", () => {
                closeMobileMenu();
            });
        });
    }

    /* ==========================================
       5. PASSENGER COUNTERS
    ========================================== */
    const counters = document.querySelectorAll(".passenger-counter");
    counters.forEach((counter) => {
        const minus = counter.querySelector(".minus");
        const plus = counter.querySelector(".plus");
        const value = counter.querySelector(".counter-value");
        const hiddenInput = counter.querySelector('input[type="hidden"]');

        let count = Number(value.textContent);
        const min = Number(value.dataset.min);
        const max = Number(value.dataset.max);

        function updateButtons() {
            minus.disabled = count === min;
            plus.disabled = count === max;
            if (hiddenInput) hiddenInput.value = count;
        }

        updateButtons();

        plus.addEventListener("click", () => {
            if (count < max) {
                count++;
                value.textContent = count;
                updateButtons();
            }
        });

        minus.addEventListener("click", () => {
            if (count > min) {
                count--;
                value.textContent = count;
                updateButtons();
            }
        });
    });

    /* ==========================================
       6. DATE LIMITS & SYNCING
    ========================================== */
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split("T")[0];

    dateInputs.forEach(input => {
        input.min = today;
    });

    function syncDates(startId, endId) {
        const startDate = document.getElementById(startId);
        const endDate = document.getElementById(endId);

        if (!startDate || !endDate) return;

        startDate.addEventListener("change", () => {
            endDate.min = startDate.value;
            if (endDate.value && endDate.value < startDate.value) {
                endDate.value = startDate.value;
            }
        });
    }

    syncDates("flight-departure", "flight-return");
    syncDates("hotel-checkin", "hotel-checkout");
    syncDates("car-start", "car-end");

    /* ==========================================
       7. SMOOTH SCROLL TO CONTACT
    ========================================== */
    const contactLinks = document.querySelectorAll('a[href="#contact"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            closeMobileMenu();
        });
    });

    /* ==========================================
       8. VALIDATION & SUBMISSION LOGIC
    ========================================== */
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.add('error');
        
        let errorEl = formGroup.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            formGroup.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.remove('error');
        const errorEl = formGroup.querySelector('.error-message');
        if (errorEl) {
            errorEl.remove();
        }
    }

    forms.forEach(form => {
        form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => clearError(input));
            input.addEventListener('change', () => clearError(input));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;
            
            const inputs = form.querySelectorAll('input:not([type="hidden"]), select');
            inputs.forEach(input => {
                clearError(input);
                if (!input.value.trim()) {
                    showError(input, 'Bidang ini wajib diisi.');
                    isValid = false;
                }
            });

            if (isValid) {
                if (form.id === 'flight-form') {
                    const depInput = form.querySelector('#flight-departure');
                    const retInput = form.querySelector('#flight-return');
                    if (depInput && retInput && retInput.value) {
                        const dep = new Date(depInput.value);
                        const ret = new Date(retInput.value);
                        if (ret < dep) {
                            showError(retInput, 'Tanggal kembali tidak boleh sebelum tanggal berangkat.');
                            isValid = false;
                        }
                    }
                } else if (form.id === 'hotel-form') {
                    const checkinInput = form.querySelector('#hotel-checkin');
                    const checkoutInput = form.querySelector('#hotel-checkout');
                    if (checkinInput && checkoutInput) {
                        const checkin = new Date(checkinInput.value);
                        const checkout = new Date(checkoutInput.value);
                        if (checkout <= checkin) {
                            showError(checkoutInput, 'Tanggal check-out harus setelah check-in.');
                            isValid = false;
                        }
                    }
                } else if (form.id === 'car-form') {
                    const startInput = form.querySelector('#car-start');
                    const endInput = form.querySelector('#car-end');
                    if (startInput && endInput) {
                        const start = new Date(startInput.value);
                        const end = new Date(endInput.value);
                        if (end < start) {
                            showError(endInput, 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
                            isValid = false;
                        }
                    }
                }
            }

            if (!isValid) return;

            const bookingData = {
                category: form.id.replace('-form', ''),
                fields: {}
            };

            const allInputs = form.querySelectorAll('input, select');
            allInputs.forEach(input => {
                if (input.name) {
                    bookingData.fields[input.name] = input.value;
                }
            });

            localStorage.setItem('bookingSearchData', JSON.stringify(bookingData));

            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('active');
            }

            setTimeout(() => {
                window.location.href = 'result.html';
            }, 1500);
        });
    });
});