const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'challenges.json');

// Helper to read challenges
const readChallenges = () => {
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading data file, using default structure:", error);
    return [];
  }
};

// Helper to write challenges
const writeChallenges = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing data file:", error);
  }
};

// Endpoints
app.get('/api/challenges', (req, res) => {
  const challenges = readChallenges();
  res.json(challenges);
});

app.post('/api/challenges/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['todo', 'inprogress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const challenges = readChallenges();
  const index = challenges.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Challenge not found" });
  }

  challenges[index].status = status;
  writeChallenges(challenges);
  res.json(challenges[index]);
});

app.post('/api/readiness-check', (req, res) => {
  const { 
    databaseBackup, 
    networkBandwidth, 
    staffTraining, 
    legacyFontCleaned, 
    mfaEnabled,
    biometricDevices
  } = req.body;

  // Each true counts for a certain score weight
  let score = 0;
  const details = [];

  if (databaseBackup) {
    score += 20;
    details.push("Database Backup: Completed. SDC sync path verified.");
  } else {
    details.push("Database Backup: MISSING. Critical hazard! Backup all CCTNS 1.0 schemas before proceeding.");
  }

  if (networkBandwidth) {
    score += 15;
    details.push("Network Bandwidth: Adequate (>2Mbps stable links configured).");
  } else {
    details.push("Network Bandwidth: WEAK. Setup regional offline replication server (Local CAS).");
  }

  if (staffTraining) {
    score += 20;
    details.push("Staff Training: Over 75% constables trained on UI/UX changes.");
  } else {
    details.push("Staff Training: LOW. Organize 3-day training module on registration workflow.");
  }

  if (legacyFontCleaned) {
    score += 15;
    details.push("Legacy Fonts: Standardized to UTF-8 Unicode.");
  } else {
    details.push("Legacy Fonts: UNCLEANED. Local fonts (KrutiDev) will corrupt on ingestion. Run the UTF-8 conversion script.");
  }

  if (mfaEnabled) {
    score += 15;
    details.push("MFA & Security: Multi-factor authentication active for officers.");
  } else {
    details.push("MFA & Security: INACTIVE. Risk of credential misuse. Enable JWT + Aadhaar MFA.");
  }

  if (biometricDevices) {
    score += 15;
    details.push("Biometric Hardware: Connected and integrated with logging module.");
  } else {
    details.push("Biometric Hardware: NOT DETECTED. Connect fingerprint/iris scanners.");
  }

  let status = "Critical Risk";
  let color = "#e63946";
  if (score >= 80) {
    status = "Production Ready";
    color = "#2a9d8f";
  } else if (score >= 50) {
    status = "Warning Mode";
    color = "#f4a261";
  }

  res.json({
    score,
    status,
    color,
    details
  });
});

// Mock Chatbot Assistant
app.post('/api/chat-query', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const normalized = query.toLowerCase();
  let answer = "";

  if (normalized.includes("offline") || normalized.includes("sync") || normalized.includes("connectivity")) {
    answer = "CCTNS 2.0 mein offline problems ko control karne ke liye standard UUID primary keys aur local client-side IndexedDB caching ka use kiya jata hai. Connectivity restoring ke baad Service Workers automatically central database server (SDC) se records ko synchronize kar dete hain, bina kisi serial-ID overlap or collision key conflicts ke.";
  } else if (normalized.includes("schema") || normalized.includes("data migration") || normalized.includes("database") || normalized.includes("font") || normalized.includes("krutidev")) {
    answer = "Upgrade karte samay legacy relational databases mein regional character encoding issues hote hain. Solution ke liye, aapko data ingestion pipeline mein mapping scripts ka use karna chahiye jo legacy data ko standard Unicode UTF-8 mein parse karein. Table keys ke liye, purane Serial Int fields ko UUID se replace karein.";
  } else if (normalized.includes("icjs") || normalized.includes("integration") || normalized.includes("court") || normalized.includes("prison")) {
    answer = "CCTNS 2.0 external components (Prisons, Courts, Forensics) se connect karne ke liye integration gateway APIs ka use karta hai. SFTP and flat CSV exports ki jagah, REST web services aur security JWT/OAuth2 mechanisms run hote hain. Temporary connectivity failure ke case mein RabbitMQ background data buffers use kiye jaate hain.";
  } else if (normalized.includes("security") || normalized.includes("audit") || normalized.includes("tamper") || normalized.includes("log")) {
    answer = "Security security breaches aur tampering rokne ke liye, CCTNS 2.0 transaction chains ka calculation karta hai. Har audit log entry pichle log entry ke SHA-256 hash se linked hoti hai, jisse dynamic modification block ho jati hai. Iske alawa, strict API routes, HTTPS TLS 1.3 aur token system access ko secure banate hain.";
  } else if (normalized.includes("training") || normalized.includes("ui") || normalized.includes("ux") || normalized.includes("constable")) {
    answer = "CCTNS 1.0 ke complex, heavy form inputs ko standard stepper/wizards mein update kiya gaya hai. Constables aur field staff ki training ke liye, UI ke andaj me hi interactive tour scripts, regional translation prompts aur real-time verification inputs embed kiye gaye hain.";
  } else {
    answer = "CCTNS 1.0 to 2.0 migration process ke bare mein aap database schema, sync conflict, ICJS APIs, safety protocols aur UI updates se related specific sawaal pooch sakte hain. (e.g. 'Offline sync kaise kaam karta hai?' ya 'Legacy databases ko update kaise karein?') Check output challenges card content visual details.";
  }

  res.json({ answer });
});

app.listen(PORT, () => {
  console.log(`CCTNS API Server running on port ${PORT}`);
});
