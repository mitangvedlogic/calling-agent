const express = require('express');
const { Octokit } = require("@octokit/rest");
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// GitHub API setup
const octokit = new Octokit({
  auth: process.env.GITHUB_SECRET, // GitHub Personal Access Token
});

const owner = process.env.GITHUB_USERNAME; // e.g., 'mitangvedlogic'
const repo = process.env.GITHUB_REPO;       // e.g., 'appointments-data'
const filePath = 'appointments.json';
const branch = 'main';

// Appointment route
app.post('/book-appointment', async (req, res) => {
  const appointmentData = req.body; // { name, email, phone, date, time, duration }

  let fileContent;
  let appointments = [];

  try {
    // Try fetching the current file
    fileContent = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });

    const content = Buffer.from(fileContent.data.content, 'base64').toString('utf-8');
    appointments = JSON.parse(content);
  } catch (err) {
    if (err.status === 404) {
      console.log('appointments.json not found. Creating a new one.');
    } else {
      console.error('GitHub API error:', err);
      return res.status(500).json({ error: 'Failed to read data from GitHub' });
    }
  }

  // Add new appointment
  appointments.push(appointmentData);

  // Encode updated data
  const updatedContent = Buffer.from(JSON.stringify(appointments, null, 2)).toString('base64');

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Add appointment for ${appointmentData.name || 'User'}`,
      content: updatedContent,
      ...(fileContent && { sha: fileContent.data.sha }), // only include SHA if file existed
      branch,
    });

    return res.status(200).json({ message: 'Appointment booked successfully!' });
  } catch (err) {
    console.error('GitHub Write Error:', err);
    return res.status(500).json({ error: 'Failed to save appointment data' });
  }
});

// Root test route
app.get('/', (req, res) => {
  res.send('Hello! Appointment API is running.');
});

// Start the server (for local use)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
