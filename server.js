const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Define file path for saving appointments
const filePath = path.join(__dirname, 'appointments.json');

// Check if the file exists, if not, create an empty file
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([])); // Start with an empty array
}

// Endpoint to book an appointment
app.post('/book-appointment', (req, res) => {
  const { name, email, phoneNumber, date, startTime, duration } = req.body;

  // Read the current appointments data from the file
  const appointments = JSON.parse(fs.readFileSync(filePath));

  // Create a new appointment object
  const newAppointment = {
    name,
    email,
    phoneNumber,
    date,
    startTime,
    duration,
  };

  // Push the new appointment to the array
  appointments.push(newAppointment);

  // Write the updated appointments array back to the file
  fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));

  // Respond with a success message
  res.status(200).json({ message: "Appointment booked successfully!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
