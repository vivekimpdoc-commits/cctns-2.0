const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'challenges.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// In-memory OTP storage: { email: { otp, expires } }
const otps = {};

// Helper to read/write challenges
const readChallenges = () => {
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading data file:", error);
    return [];
  }
};

const writeChallenges = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing data file:", error);
  }
};

// Helper to read/write users database
const readUsers = () => {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading users file, returning empty array:", e);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error("Error writing users file:", e);
  }
};

// ================= AUTH & REGISTRATION ENDPOINTS =================

// Register User/Admin
app.post('/api/auth/register', (req, res) => {
  const { name, email, role } = req.body;
  
  if (!name || !email || !role) {
    return res.status(400).json({ error: "Sabhi fields (Name, Email, Role) required hain." });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: "Sahi email format enter karein." });
  }

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: "Invalid role value." });
  }

  const users = readUsers();
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    return res.status(400).json({ error: "Yeh Email ID pehle se registered hai. Kripya login karein." });
  }

  // Create new pending user
  const newUser = {
    email: email.toLowerCase().trim(),
    name: name.trim(),
    role: role,
    status: 'pending' // Enforce validation
  };

  users.push(newUser);
  writeUsers(users);

  res.json({ message: "Registration request send ho gayi hai. Login karne se pehle Admin approval ki zarurat hai." });
});

// Send OTP (Enforces registration checks)
app.post('/api/auth/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Kripya sahi email address enter karein." });
  }

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(400).json({ error: "Yeh Email ID registered nahi hai. Kripya pehle register karein." });
  }

  if (user.status === 'pending') {
    return res.status(400).json({ error: "Aapka account admin verification ke liye pending hai. Approval ke baad hi OTP generate hoga." });
  }

  if (user.status === 'rejected') {
    return res.status(400).json({ error: "Aapka account validation request reject ho gaya hai. System administrator se contact karein." });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

  otps[email] = { otp, expires };

  console.log(`\n==========================================`);
  console.log(`[SIMULATED EMAIL] OTP Sent to: ${email}`);
  console.log(`Your CCTNS login verification code is: ${otp}`);
  console.log(`==========================================\n`);

  res.json({ 
    message: "OTP successfully dispatched to email.", 
    simulatedOtp: otp 
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email aur verification OTP required hai." });
  }

  const record = otps[email];
  if (!record) {
    return res.status(400).json({ error: "Session invalid ya expire ho chuka hai. Kripya naya OTP request karein." });
  }

  if (Date.now() > record.expires) {
    delete otps[email];
    return res.status(400).json({ error: "OTP expired ho chuka hai. Naya code request karein." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: "Galat OTP! Kripya code check karke firse enter karein." });
  }

  // OTP verified, clear it
  delete otps[email];

  // Fetch full details from database
  const users = readUsers();
  const profile = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!profile || profile.status !== 'approved') {
    return res.status(400).json({ error: "Authentication status checks failed. Contact admin." });
  }

  const mockToken = `cctns-token-${Buffer.from(JSON.stringify(profile)).toString('base64')}`;

  res.json({
    message: "OTP verify ho gaya hai.",
    token: mockToken,
    user: profile
  });
});


// ================= ADMIN AUDIT & APPROVAL ENDPOINTS =================

// Get all pending users
app.get('/api/admin/pending-users', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: "Access Denied: Is panel ko access karne ke liye admin credentials chahiye." });
  }

  const users = readUsers();
  const pending = users.filter(u => u.status === 'pending');
  res.json(pending);
});

// Approve/Reject registration request
app.post('/api/admin/approve-user', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: "Access Denied: Is action ke liye admin levels authorize hona chahiye." });
  }

  const { email, action } = req.body;
  if (!email || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: "Invalid registration parameters." });
  }

  const users = readUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (index === -1) {
    return res.status(404).json({ error: "User profile found nahi hui." });
  }

  // Set status
  users[index].status = action === 'approve' ? 'approved' : 'rejected';
  writeUsers(users);

  res.json({ message: `Account request successfully ${action}ed.` });
});


// ================= CORE DATA ENDPOINTS =================

app.get('/api/challenges', (req, res) => {
  const challenges = readChallenges();
  res.json(challenges);
});

// Role-protected update status
app.post('/api/challenges/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userRole = req.headers['x-user-role'];
  
  if (userRole !== 'admin') {
    return res.status(403).json({ error: "Access Denied: Is action ke liye admin permissions (admin@cctns.gov.in) ki aavashyakta hai." });
  }

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
    details.push("Network Bandwidth: Adequate (&gt;2Mbps stable links configured).");
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
