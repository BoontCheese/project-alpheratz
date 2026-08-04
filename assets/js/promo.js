/* ==========================================
   1. AUTO INITIALIZE ADMIN MODE (ON LOAD)
========================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in via localStorage
    if (localStorage.getItem('adminMode') === 'true') {
        enableAdminUI();
    }

    // Fallback: Attach direct click listener in case inline 'onclick' fails
    const adminBtn = document.getElementById('adminLoginBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAdminLogin();
        });
    }
});

/* ==========================================
   2. FILTER TOURS (DOMESTIC / INT / ALL)
========================================== */
function filterTours(category, e) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (e && e.target) {
        e.target.classList.add('active');
    }

    const cards = document.querySelectorAll('.promo-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ==========================================
   3. ADMIN SIGN-IN & LOCALSTORAGE LOGIC
========================================== */
function toggleAdminLogin() {
    // If already logged in, prompt user or re-trigger UI setup
    if (localStorage.getItem('adminMode') === 'true') {
        alert("Anda sudah masuk sebagai Admin!");
        enableAdminUI();
        return;
    }

    const password = prompt("Masukkan Kata Sandi Admin (Demo Password: admin123):");
    
    if (password === "admin123") {
        localStorage.setItem('adminMode', 'true');
        enableAdminUI();
        alert("Berhasil masuk sebagai Admin!");
    } else if (password !== null) {
        alert("Password Salah!");
    }
}

function logoutAdmin() {
    localStorage.removeItem('adminMode');
    disableAdminUI();
    syncInputsToDisplay();
    alert("Anda telah keluar dari Admin Mode.");
}

function enableAdminUI() {
    document.body.classList.add('admin-mode');
    
    const adminBar = document.getElementById('adminBar');
    if (adminBar) {
        adminBar.classList.add('active');
        adminBar.style.display = 'flex'; // Explicit inline style force
    }

    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.style.display = 'none';
    }

    syncInputFieldsToText();
}

function disableAdminUI() {
    document.body.classList.remove('admin-mode');
    
    const adminBar = document.getElementById('adminBar');
    if (adminBar) {
        adminBar.classList.remove('active');
        adminBar.style.display = 'none';
    }

    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.style.display = 'inline-flex';
    }
}

/* ==========================================
   4. INLINE EDITING SYNC (CARDS & DETAILS)
========================================== */
function syncInputsToDisplay() {
    const containers = document.querySelectorAll('.promo-card, .tour-detail-container');
    
    containers.forEach(container => {
        const editableParents = container.querySelectorAll('li, p, div, header');
        editableParents.forEach(parent => {
            const textEl = parent.querySelector('.editable-text');
            const inputEl = parent.querySelector('.admin-edit-field');
            if (textEl && inputEl) {
                textEl.textContent = inputEl.value;
            }
        });
    });
}

function syncInputFieldsToText() {
    const inputs = document.querySelectorAll('.admin-edit-field');
    
    inputs.forEach(inputEl => {
        const parent = inputEl.parentElement;
        if (!parent) return;

        const textEl = parent.querySelector('.editable-text');
        if (textEl) {
            inputEl.addEventListener('input', () => {
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
        reader.onload = function(e) {
            const imgWrapper = input.closest('.card-img-wrapper');
            if (imgWrapper) {
                const img = imgWrapper.querySelector('.card-img');
                if (img) img.src = e.target.result;
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}