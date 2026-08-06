const express = require("express");
const path = require("path");
const app = express();

//express know how to handle json
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "..")));

const promo = [
  {
    id: 1,
    categoryKey: "domestic",
    category: "Domestik",
    name: "Exotic Bali 4D3N",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
    hotel: "Grand Inna Kuta (★4)",
    period: "1 Agu - 30 Sep 2026",
    seats: 12,
    price: 3250000,
    itinerary: "D1: Arrival & Uluwatu | D2: Bedugul & Tanah Lot | D3: Nusa Penida | D4: Souvenir & Departure",
    detailLink: "tour-bali.html"
  },
  {
    id: 2,
    categoryKey: "international",
    category: "Mancanegara",
    name: "Japan Autumn in Tokyo 5D4N",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
    hotel: "Sunshine City Prince Hotel (★4)",
    period: "10 Okt - 15 Nov 2026",
    seats: 5,
    price: 14800000,
    itinerary: "D1: Haneda - Asakusa | D2: Mt. Fuji & Lake Kawaguchi | D3: Shibuya & Harajuku | D4: Disneyland | D5: Departure",
    detailLink: "tour-tokyo.html"
  }
];

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

// try api
app.get("/api/promo", (req, res) => {
  res.json(promo);
})

app.get("/api/promo/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const tour = promo.find(item => item.id === id);

  if (!tour) {
    return res.status(404).json({
      message: "Tour not found"
    });
  }

  res.json(tour);
});

app.post("/api/promo", (req, res) => {
  const newTour = req.body;

  promo.push(newTour);

  res.status(201).json({
    message: "Tour created successfully",
    data: newTour
  });
});