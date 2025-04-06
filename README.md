# NetShield: Network Log Analysis and Classification

NetShield is a network log analysis and classification system designed to process network logs, classify them as safe or suspicious, and visualize the results through interactive charts. The project includes a backend for processing logs, a frontend for visualization, and machine learning models for classification.

---

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
4. [Usage](#usage)
   - [Running the Application](#running-the-application)
   - [Generating Reports](#generating-reports)
5. [File Descriptions](#file-descriptions)
6. [Technologies Used](#technologies-used)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

- _Log Classification_: Classifies network logs as safe or suspicious using a machine learning model.
- _Visualization_: Displays log activity and protocol/attack statistics.
- _Real-Time Processing_: Processes logs in real-time and updates the frontend dynamically.
- _Redis Integration_: Uses Redis streams for efficient log storage and retrieval, enabling real-time data processing.
- _Report Generation_: Generates PDF reports containing suspicious logs and visualizations.
- _Encrypted Access_: The report file is encrypted to ensure secure access, restricted only to higher officials.
- _Docker Support_: Provides Docker images and Compose files for easy deployment of the application and integration with Redis.

---

## Setup Instructions

### Backend Setup

1. Navigate to the Backend directory:
   bash
   cd Backend

2. Install dependencies:
   bash
   npm install

3. Start the backend server:
   bash
   npm start

   The server will run on http://localhost:3001.

### Frontend Setup

1. Navigate to the `Frontend` directory:
   bash
   cd Frontend

2. Install dependencies:
   bash
   npm install

3. Start the frontend development server:
   bash
   npm start

   The frontend will run on http://localhost:3000.

### Wireshark Setup

1. Download Wireshark from the official website:  
   [https://www.wireshark.org/download.html](https://www.wireshark.org/download.html)

2. Install Wireshark by following the installation instructions for your operating system.

3. Launch Wireshark and configure it to capture network traffic:

   - Select the network interface to monitor.
   - Start capturing packets by clicking the "Start Capturing Packets" button.

4. Save the captured logs for analysis:

   - Stop the capture when needed.
   - Save the logs as a `.pcap` file for further processing.

---

### Redis Setup

1. Download and install Redis:

   - For Windows: Use [Memurai](https://www.memurai.com/) or [Redis for Windows](https://github.com/microsoftarchive/redis/releases).
   - For macOS: Use Homebrew:
     bash
     brew install redis

   - For Linux: Use your package manager, e.g.:
     bash
     sudo apt update
     sudo apt install redis

2. Start the Redis server:
   bash
   redis-server

3. Verify that Redis is running:
   bash
   redis-cli ping

   You should see the response: `PONG`.

4. Configure Redis for the application:

   - Update the Redis configuration file (`redis.conf`) if needed.
   - Ensure the Redis server is accessible from the backend.

5. Monitor Redis streams:

   - Use the Redis CLI to inspect streams and data:
     bash
     redis-cli

## Usage

### Running the Application

1. Start the backend server as described in the [Backend Setup](#backend-setup).
2. Start the frontend server as described in the [Frontend Setup](#frontend-setup).
3. Ensure Redis is running in the background as described in the [Redis Setup](#redis-setup).
4. Start Wireshark in the background to capture live network traffic:

- Launch Wireshark and select the appropriate network interface.
- Start capturing packets.
- Save the logs as `.pcap` files for analysis if needed.

5. Access the application at [http://localhost:3000](http://localhost:3000).

### Running with Docker

1. Build the Docker images for the backend and frontend:
   bash
   docker-compose build

2. Start the application using Docker Compose:
   bash
   docker-compose up

3. Access the application at [http://localhost:3000](http://localhost:3000).

### Generating Reports

1. Use the "Generate Report" button in the frontend to create a PDF report.
2. The report will include:

- Suspicious logs.
- Log activity over time.
- Protocol and attack charts.

3. The generated report will be encrypted for secure access.

## File Descriptions

### Python Files

- **autoencoder.py**: Implements the autoencoder model for anomaly detection.
- **classifier.py**: Processes and classifies network logs into normal and suspicious categories.
- **filter_non_normal.py**: Filters out non-normal records from the dataset.
- **main.py**: Main script for processing logs and interacting with the Redis stream.
- **network_logger.py**: Captures network logs and pushes them to Redis streams.
- **view_stream.py**: Reads and processes logs from Redis streams for real-time analysis.
- **preprocess.py**: Preprocessing utilities for scaling and transforming data.

### Backend

- **server.js**: Express.js server for serving classified logs to the frontend.

### Frontend

- **Home.jsx**: Main component for displaying logs and charts.
- **LogActivityChart.jsx**: Displays log activity over time using a line chart.
- **ProtocolAndAttackCharts.jsx**: Displays protocol usage and attack type frequency using bar and pie charts.

### Data Files

- **classified_results.txt**: Stores the results of log classification.
- **suspicious_records.txt**: Contains filtered suspicious records.
- **saved_model.h5**: Pre-trained machine learning model for classification.
- **scaler.pkl**: Scaler object for normalizing data.
- **threshold.json**: Threshold values for classification.
- **readme.txt**: Encrypted file containing sensitive project details, accessible only to higher officials.

## Technologies Used

- **Frontend**: React.js, Material-UI, Recharts
- **Backend**: Node.js, Express.js
- **Machine Learning**: TensorFlow/Keras
- **Data Processing**: Python (Pandas, NumPy)
- **Redis**: Used for real-time log storage and retrieval
- **Visualization**: Recharts, jsPDF, html2canvas
- **Encryption**: Ensures secure access to sensitive files like the readme.

## Contributing

We welcome contributions to NetShield! To contribute, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix:
   bash
   git checkout -b feature-name

3. Make your changes and commit them with clear and concise commit messages:
   bash
   git commit -m "Add feature description"

4. Push your changes to your fork:
   bash
   git push origin feature-name

5. Open a pull request to the main repository and provide a detailed description of your changes.

### Guidelines

- Ensure your code follows the project's coding standards and conventions.
- Write clear and concise documentation for any new features or changes.
- Test your changes thoroughly before submitting a pull request.
- Be respectful and constructive in code reviews and discussions.

Thank you for contributing to NetShield!
