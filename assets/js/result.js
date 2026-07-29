document.addEventListener('DOMContentLoaded', () => {
    const rawData = localStorage.getItem('bookingSearchData');
    const container = document.getElementById('results-card');

    if (!rawData) {
        window.location.href = 'index.html';
        return;
    }

    const data = JSON.parse(rawData);

    // Map labels to human-readable Indonesian titles
    const labels = {
        from: 'Kota / Lokasi Asal',
        to: 'Kota / Lokasi Tujuan',
        departure_date: 'Tanggal Berangkat',
        return_date: 'Tanggal Kembali',
        checkin_date: 'Tanggal Check-in',
        checkout_date: 'Tanggal Check-out',
        duration: 'Durasi',
        room: 'Jumlah Kamar',
        passenger: 'Penumpang',
        destination: 'Destinasi',
        date: 'Tanggal Liburan',
        adult: 'Dewasa',
        children: 'Anak-anak',
        infant: 'Bayi',
        unit: 'Jenis Kendaraan',
        start: 'Mulai Sewa',
        end: 'Selesai Sewa'
    };

    let detailsHtml = `
        <div class="summary-header">
            <h3>Layanan: ${data.category.toUpperCase()}</h3>
        </div>
        <ul class="summary-list">
    `;

    for (const [key, value] of Object.entries(data.fields)) {
        if (value) {
            const labelName = labels[key] || key;
            detailsHtml += `<li><strong>${labelName}:</strong> ${value}</li>`;
        }
    }

    detailsHtml += `</ul>`;
    container.innerHTML = detailsHtml;
});