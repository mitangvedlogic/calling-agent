const express = require('express');
const axios = require('axios');

const app = express();
const port = 3001; // Separate port for Dialogflow webhook

app.use(express.json());

// Dialogflow webhook route
app.post('/dialogflow-webhook', async (req, res) => {
  const agent = req.body.queryResult.intent.displayName;

  // Check which intent is called
  if (agent === 'Book Appointment') {
    // Extract the required details from the Dialogflow response
    const { name, email, phoneNumber, date, startTime, duration } = req.body.queryResult.parameters;

    // Call the backend API to save the appointment
    try {
      const response = await axios.post('http://localhost:3000/book-appointment', {
        name,
        email,
        phoneNumber,
        date,
        startTime,
        duration,
      });

      res.json({
        fulfillmentText: `Your appointment has been successfully booked for ${date} at ${startTime}.`,
      });
    } catch (error) {
      res.json({
        fulfillmentText: 'There was an error booking your appointment. Please try again later.',
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Dialogflow Webhook is running at http://localhost:${port}`);
});
