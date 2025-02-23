// Import the required modules
const express = require("express");
const fs = require("fs");
const path = require('path');
const { v4: uuidv4 } = require("uuid");


// Create an instance of an Express application
const app = express();

// Define the port the server will listen on
const PORT = 5002;

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

// Define path to the data file
const dataFilePath = path.join(__dirname, "data.json");


// Function to read data from the JSON file
const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};

// Function to write data to the JSON file
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Handle GET request at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
// Handle GET request to retrieve stored data
app.get("/data", (req, res) => {
  const data = readData();
  res.json(data);
});

// Handle POST request to save new data with a unique ID
app.post("/data", (req, res) => {
  const newData = { id: uuidv4(), ...req.body};
  const currentData = readData();
  currentData.push(newData);
  writeData(currentData);
  res.json({ message: "Task saved successfully", data: newData});
});

// Handle POST request at the /echo route
app.post("/echo", (req, res) => {
  // Respond with the same data that was received in the request body
  res.json({ received: req.body });
});

app.delete("/data/:id", (req, res) => {
  const { id } = req.params;  // Get the task ID from the request URL
  const currentData = readData();  // Read the current data (assuming it's an array)

  // Find the index of the task to be deleted
  const taskIndex = currentData.findIndex(task => task.id === id);

  if (taskIndex !== -1) {
    // If the task is found, remove it from the array
    currentData.splice(taskIndex, 1);

    // Save the updated data back to storage
    writeData(currentData);

    // Send a success response back to the client
    res.json({ message: "Task deleted successfully" });
  } else {
    // If the task is not found, send a 404 error
    res.status(404).json({ message: "Task not found" });
  }
});

// Handle put request for updating data 
app.put("/data/:id", (req, res) => {
  const { id } = req.params;
  const { description } = req.body; // Get the updated description

  const currentData = readData();
  const taskIndex = currentData.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Update the task's description
  currentData[taskIndex].description = description;
  writeData(currentData); // Save the updated data

  res.json({ message: "Task updated successfully", data: currentData[taskIndex] });
});


// Wildcard route to handle undefined routes
app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
