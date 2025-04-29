const express = require('express');
const fs = require('fs');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const app = express();
const bodyParser = require('body-parser');

// Body parser middleware
app.use(bodyParser.json());

// GitHub authentication
const octokit = new Octokit({
  auth: process.env.GITHUB_SECRET, // Replace with your personal GitHub token
});

const owner = process.env.USERNAME; // GitHub username
const repo = 'appointments-data'; // GitHub repo name
const filePath = 'appointments.json'; // Path to the JSON file in the repo

// Appointment route (POST)
app.post('/book-appointment', async (req, res) => {
  const appointmentData = req.body; // { name, email, phone, date, time, duration }

  try {
    // Fetch the existing appointments from GitHub
    const { data: fileContent } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    // Decode the file content from Base64
    const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
    let appointments = JSON.parse(content) || [];

    // Add the new appointment
    appointments.push(appointmentData);

    // Encode the updated data to Base64
    const updatedContent = Buffer.from(JSON.stringify(appointments, null, 2)).toString('base64');

    // Commit the new data to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: 'Add new appointment',
      content: updatedContent,
      sha: fileContent.sha, // Use the current file's SHA to update it
    });

    res.status(200).json({ message: 'Appointment booked successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save appointment data' });
  }
});

// Default route (for testing)
app.get('/', (req, res) => {
  res.send('Hello, Appointment API is running!');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
