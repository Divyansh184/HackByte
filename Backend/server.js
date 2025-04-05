const path = require("path");
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

const logFilePath = "C:\\Users\\PARAS AGARWAL\\Desktop\\HackByte\\HackByte\\classified_results.txt";

app.get("/log", (req, res) => {

  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading log file:", err.message);
      return res.status(500).send("Error reading log file.");
    }
    const firstLine = data.trim().split("\n")[0];
    res.json({ log: firstLine });
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
