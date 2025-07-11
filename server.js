const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const FILE = path.join(__dirname, 'data.json');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Get reservations
app.get('/reservations', (req, res) => {
  const data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : [];
  res.json(data);
});

// Add a reservation
app.post('/reserve', (req, res) => {
  const newRes = req.body;

  // Validate input
  if (!newRes.name || !newRes.phone || !newRes.date || !newRes.time) {
    return res.status(400).json({ message: 'Missing data' });
  }

  const data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : [];

  const newStart = new Date(`${newRes.date}T${newRes.time}`);
  const newEnd = new Date(newStart.getTime() + 90 * 60000); // 1h30

  const conflict = data.some(r => {
    const rStart = new Date(`${r.date}T${r.time}`);
    const rEnd = new Date(rStart.getTime() + 90 * 60000);
    return (newStart < rEnd && newEnd > rStart);
  });

  if (conflict) {
    return res.status(409).json({ message: 'Slot already reserved' });
  }

  data.push(newRes);
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  res.status(201).json({ message: 'Reservation saved' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
