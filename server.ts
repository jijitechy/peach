import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp as initializeFirebaseApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

// Initialize Firebase App & Firestore
const firebaseApp = initializeFirebaseApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Helper to protect against Firestore SDK hanging when offline or unprovisioned
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 1500): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Firestore connection timed out (offline/unprovisioned fallback)"));
    }, timeoutMs);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Initialize Gemini API client if key exists
const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (isGeminiAvailable) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory SEED Database State
const SEED_LISTINGS = [
  {
    id: "lst-01",
    title: "iPhone 13 Pro (128GB, Sierra Blue)",
    description: "Highly sought-after, clean, and locally used iPhone 13 Pro. Face ID, TrueTone, and all proximity sensors are working. Battery health is at 88%. This unit has a premium ceramic guard and a complimentary original generic fast charger with a Silicon Case.",
    category: "Electronics",
    condition: "Good",
    location: "Nairobi, Kilimani",
    seller: { id: "sel-01", name: "Amos Mwangi", rating: 4.9, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    startingBid: 58000,
    reservePrice: 65000,
    currentBid: 68500,
    bidsCount: 14,
    endTime: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // Ends in 45 minutes
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none", // none, pending_payment, held_in_escrow, shipped, delivered, funds_released, disputed
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "lst-02",
    title: "Sony PlayStation 5 Console (Disc Edition)",
    description: "Mint-condition PS5 Console with 1 white dual-sense controller. Purchased in the UK, rarely used. Runs extremely cool and silent, loaded with digital extras. Perfect companion for weekend gaming sessions. Delivery available via Peach express for extra safety.",
    category: "Electronics",
    condition: "Like New",
    location: "Mombasa, Nyali",
    seller: { id: "sel-02", name: "Fatma Juma", rating: 4.7, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" },
    startingBid: 45000,
    reservePrice: 52000,
    currentBid: 56000,
    bidsCount: 9,
    endTime: new Date(Date.now() + 1000 * 60 * 180).toISOString(), // Ends in 3 hours
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "lst-03",
    title: "Vintage Cowhide Leather Jacket - MediumSize",
    description: "Thick genuine sheepskin and cowhide leather jacket. Hand-finished vintage brown tone that patinas incredibly over time. Robust silver metal zippers with heavy lining. Fits regular medium perfectly. Authentic streetwear style.",
    category: "Fashion",
    condition: "Good",
    location: "Eldoret, Central",
    seller: { id: "sel-03", name: "Kevin Koech", rating: 4.5, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" },
    startingBid: 4500,
    reservePrice: 6000,
    currentBid: 6800,
    bidsCount: 6,
    endTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // Ended 20 min ago
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "lst-04",
    title: "Yamaha FG800 Acoustic Folk Guitar",
    description: "Superb acoustic sound quality with premium spruce solid top. Ideal for intermediate players and gigging. Warm, robust, resonate tone with low action setup. Strings recently replaced with D'Addario custom lights.",
    category: "Books & Hobbies",
    condition: "Good",
    location: "Nairobi, Westlands",
    seller: { id: "sel-04", name: "Linus Omara", rating: 4.9, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
    startingBid: 12000,
    reservePrice: 15000,
    currentBid: 17500,
    bidsCount: 8,
    endTime: new Date(Date.now() + 1000 * 60 * 1440).toISOString(), // Ends in 24 hours
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "lst-05",
    title: "Professional Event Photography (Half-Day)",
    description: "Service listing: Comprehensive photography for corporate functions, birthdays, or graduations. Includes post-production editing of 150 high-res photos, delivered via online drive link within 3 days. Done by top Nairobi studio.",
    category: "Services",
    condition: "New",
    location: "Nairobi, Lavington",
    seller: { id: "sel-05", name: "Esther Wanjiku", rating: 5.0, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" },
    startingBid: 15000,
    reservePrice: 20000,
    currentBid: 22000,
    bidsCount: 5,
    endTime: new Date(Date.now() + 1000 * 60 * 360).toISOString(), // Ends in 6 hours
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "lst-06",
    title: "Specialized Rockhopper Mountain Bike (Medium)",
    description: "Awesome cross-country trail cruiser bike. Aluminum A1 lightweight frame, SR Suntour shocks, Shimano tourney drivetrain. Mechanically flawless, newly serviced cables and hydraulic caliper checks. Perfect modern bike.",
    category: "Vehicles & Sports",
    condition: "Good",
    location: "Kisumu, Milimani",
    seller: { id: "sel-06", name: "Brian Otieno", rating: 4.6, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" },
    startingBid: 25000,
    reservePrice: 32000,
    currentBid: 29500,
    bidsCount: 3,
    endTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // Ended 2 hours ago
    status: "completed", // already awarded to show demo
    winnerId: "usr-demo", // Simulated user has won this!
    winnerName: "You (Mock Investor)",
    escrowStatus: "held_in_escrow", // Held in escrow payments to show flow
    deliveryOption: "Peach Courier",
    deliveryFee: 650,
    deliveryAddress: "General Post Office (GPO), Nairobi",
    mpesaPhone: "0712345678",
    mpesaReceipt: "MPASA98127391H8",
    trackingCode: "BK-TX-8912",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80"
  }
];

interface ServerBid {
  id: string;
  listingId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  location?: string;
  notes?: string;
}

const SEED_BIDS: ServerBid[] = [
  { id: "bid-1", listingId: "lst-01", bidderName: "Wycliffe", amount: 60000, timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(), location: "Mombasa", notes: "Prefers evening pickup" },
  { id: "bid-2", listingId: "lst-01", bidderName: "Jacinta", amount: 63000, timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), location: "Nairobi", notes: "Delivery via Express" },
  { id: "bid-3", listingId: "lst-01", bidderName: "Wycliffe", amount: 65500, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), location: "Mombasa", notes: "Includes protective case request" },
  { id: "bid-4", listingId: "lst-01", bidderName: "Saitoti", amount: 68500, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), location: "Kajiado", notes: "Needs secure escrow validation" },
  { id: "bid-5", listingId: "lst-02", bidderName: "Siti", amount: 48000, timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), location: "Kisumu", notes: "Ready to purchase asap" },
  { id: "bid-6", listingId: "lst-02", bidderName: "Maina", amount: 56000, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), location: "Nairobi", notes: "Immediate M-Pesa push settlement" },
  { id: "bid-7", listingId: "lst-03", bidderName: "Sifuna", amount: 5000, timestamp: new Date(Date.now() - 1000 * 60 * 100).toISOString(), location: "Eldoret", notes: "Pick up personally" },
  { id: "bid-8", listingId: "lst-03", bidderName: "Njuguna", amount: 6800, timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), location: "Nairobi", notes: "Check physical condition first" },
  { id: "bid-9", listingId: "lst-06", bidderName: "You (Mock Investor)", amount: 29500, timestamp: new Date(Date.now() - 1000 * 60 * 130).toISOString(), location: "Westlands", notes: "Verified buyer escrow" }
];

// Users In-Memory SEED Storage Database
const SEED_USERS = [
  {
    id: "usr-admin",
    username: "admin@gmail.com",
    email: "admin@gmail.com",
    password: "tiktak1",
    name: "System Admin",
    phone: "0799988877",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    balance: 500000,
    role: "admin"
  },
  {
    id: "usr-demo",
    username: "demo@gmail.com",
    email: "demo@gmail.com",
    password: "tiktak1",
    name: "Mock Investor",
    phone: "0712345678",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    balance: 29500,
    role: "buyer"
  },
  {
    id: "usr-joji",
    username: "joji@gmail.com",
    email: "joji@gmail.com",
    password: "tiktak1",
    name: "Joji Techy",
    phone: "0722334400",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    balance: 250000,
    role: "buyer"
  },
  {
    id: "usr-wycliffe",
    username: "wycliffe@gmail.com",
    email: "wycliffe@gmail.com",
    password: "tiktak1",
    name: "Wycliffe Ominde",
    phone: "0722334455",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    balance: 154000,
    role: "buyer"
  },
  {
    id: "usr-jane",
    username: "jane@gmail.com",
    email: "jane@gmail.com",
    password: "tiktak1",
    name: "Jane Mwangi",
    phone: "0701234567",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    balance: 95000,
    role: "seller",
    shopName: "Jane Electronics Hub Ltd",
    nationalId: "33445566",
    kraPin: "A001234567Z"
  }
];

const SEED_ACTIVITIES = [
  { id: "act-1", type: "bid_won", message: "Wycliffe Ominde won the bid for 'iPhone 13 Pro (128GB)' at KES 68,500!", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "act-2", type: "bid_placed", message: "Jacinta placed a competitive bid of KES 63,000 for 'iPhone 13 Pro (128GB)'", timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString() },
  { id: "act-3", type: "listing_created", message: "Amos Mwangi posted 'iPhone 13 Pro (128GB)' in Kilimani, Nairobi", timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: "act-4", type: "bid_placed", message: "Maina placed a bid of KES 56,000 for 'Sony PlayStation 5 Slim'", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: "act-5", type: "listing_created", message: "Jacinta registered a new listing for 'Sony PlayStation 5 Slim' from Westlands", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
];

// Asymmetric Firestore CRUD helpers
async function fetchListings(): Promise<any[]> {
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, "listings")));
    if (querySnapshot.empty) {
      console.log("Firestore listings empty, seeding initial marketplace documents...");
      for (const item of SEED_LISTINGS) {
        await withTimeout(setDoc(doc(db, "listings", item.id), item));
      }
      return SEED_LISTINGS;
    }
    const list: any[] = [];
    querySnapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err) {
    console.error("Failed to fetch listings from Firestore:", err);
    return SEED_LISTINGS;
  }
}

async function saveListing(listing: any): Promise<void> {
  try {
    await withTimeout(setDoc(doc(db, "listings", listing.id), listing));
  } catch (err) {
    console.error("Failed to save listing to Firestore:", err);
  }
}

async function fetchUsers(): Promise<any[]> {
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, "users")));
    if (querySnapshot.empty) {
      console.log("Firestore users empty, seeding default user profiles...");
      for (const u of SEED_USERS) {
        await withTimeout(setDoc(doc(db, "users", u.id), u));
      }
      return SEED_USERS;
    }
    const list: any[] = [];
    querySnapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err) {
    console.error("Failed to fetch users from Firestore:", err);
    return SEED_USERS;
  }
}

async function saveUser(user: any): Promise<void> {
  try {
    await withTimeout(setDoc(doc(db, "users", user.id), user));
  } catch (err) {
    console.error("Failed to save user to Firestore:", err);
  }
}

async function deleteUser(id: string): Promise<void> {
  try {
    await withTimeout(deleteDoc(doc(db, "users", id)));
  } catch (err) {
    console.error("Failed to delete user from Firestore:", err);
  }
}

async function fetchBids(): Promise<any[]> {
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, "bids")));
    if (querySnapshot.empty) {
      console.log("Firestore bids empty, seeding historical bids...");
      for (const b of SEED_BIDS) {
        await withTimeout(setDoc(doc(db, "bids", b.id), b));
      }
      return SEED_BIDS;
    }
    const list: any[] = [];
    querySnapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err) {
    console.error("Failed to fetch bids from Firestore:", err);
    return SEED_BIDS;
  }
}

async function saveBid(bid: any): Promise<void> {
  try {
    await withTimeout(setDoc(doc(db, "bids", bid.id), bid));
  } catch (err) {
    console.error("Failed to save bid to Firestore:", err);
  }
}

async function fetchActivities(): Promise<any[]> {
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, "activities")));
    if (querySnapshot.empty) {
      console.log("Firestore activities empty, seeding initial logs...");
      for (const act of SEED_ACTIVITIES) {
        await withTimeout(setDoc(doc(db, "activities", act.id), act));
      }
      return SEED_ACTIVITIES;
    }
    const list: any[] = [];
    querySnapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.error("Failed to fetch activities from Firestore:", err);
    return SEED_ACTIVITIES;
  }
}

async function addActivity(type: 'bid_placed' | 'bid_won' | 'listing_created' | 'bid_selected' | string, message: string) {
  try {
    const newAct = {
      id: "act-" + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    await withTimeout(setDoc(doc(db, "activities", newAct.id), newAct));
  } catch (err) {
    console.error("Failed to write live activity to Firestore:", err);
  }
}

// Helper: Retrieve current user from auth header
async function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const userId = authHeader.substring(7);
    const dbUsers = await fetchUsers();
    return dbUsers.find(u => u.id === userId) || null;
  }
  return null;
}

// Trigger checker periodically and on API calls
setInterval(checkAndAwardAuctions, 15000);

// Helper: Check and auto-award expired auctions of active status
async function checkAndAwardAuctions() {
  const now = new Date();
  try {
    const currentListings = await fetchListings();
    const currentBids = await fetchBids();
    const currentUsers = await fetchUsers();

    for (const l of currentListings) {
      if (l.status === "active" && new Date(l.endTime) <= now) {
        const listingBids = currentBids.filter(b => b.listingId === l.id);
        if (listingBids.length > 0) {
          // Sort bids descending to get the highest
          const sortedBids = [...listingBids].sort((a, b) => b.amount - a.amount);
          const highestBid = sortedBids[0];
          
          const matchingUser = currentUsers.find(u => u.name === highestBid.bidderName);
          l.status = "completed";
          l.winnerId = matchingUser ? matchingUser.id : (highestBid.bidderName === "You (Mock Investor)" ? "usr-demo" : "usr-unknown");
          l.winnerName = highestBid.bidderName;
          l.escrowStatus = "pending_payment"; // Awaiting checkout/escrow funding

          await saveListing(l);
          await addActivity("bid_won", `${highestBid.bidderName} won the auction for "${l.title}" at KES ${highestBid.amount.toLocaleString()}!`);
        } else {
          l.status = "completed";
          l.winnerId = null;
          l.winnerName = null;
          l.escrowStatus = "none";

          await saveListing(l);
          await addActivity("bid_won", `Auction for "${l.title}" closed with no active bidders.`);
        }
      }
    }
  } catch (err) {
    console.error("Error in checkAndAwardAuctions timer task:", err);
  }
}

// Auth API Endpoints
app.post("/api/auth/signup", async (req, res) => {
  const { username, password, name, phone, role, shopName, nationalId, kraPin } = req.body;
  if (!username || !password || !name || !phone) {
    return res.status(400).json({ error: "Missing required registration parameters (username, password, name, phone)." });
  }

  const currentUsers = await fetchUsers();
  const existing = currentUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Username is already taken by another merchant/bidder." });
  }

  const userType = role || "buyer";
  if (userType === "seller" && (!shopName || !nationalId || !kraPin)) {
    return res.status(400).json({ error: "Sellers must supply a Shop Name, ID Card Number, and KRA PIN." });
  }

  let avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
  if (userType === "seller") {
    avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80";
  } else if (userType === "buyer") {
    avatarUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80";
  }

  const newUser = {
    id: "usr-" + Math.random().toString(36).substr(2, 9),
    username,
    email: username,
    password,
    name,
    phone,
    avatar: avatarUrl,
    balance: userType === "seller" ? 0 : 75000, // starting simulation cash for dynamic bidding explore
    role: userType as 'buyer' | 'seller',
    shopName: userType === "seller" ? shopName : undefined,
    nationalId: userType === "seller" ? nationalId : undefined,
    kraPin: userType === "seller" ? kraPin : undefined
  };

  await saveUser(newUser);
  res.status(201).json({ user: { id: newUser.id, username: newUser.username, name: newUser.name, phone: newUser.phone, avatar: newUser.avatar, balance: newUser.balance, role: newUser.role, shopName: newUser.shopName, nationalId: newUser.nationalId, kraPin: newUser.kraPin } });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Please specify both your username and password." });
  }

  const currentUsers = await fetchUsers();
  const user = currentUsers.find(u => 
    (u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === username.toLowerCase()))
    && u.password === password
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password configuration." });
  }

  res.json({ user: { id: user.id, username: user.username, name: user.name, phone: user.phone, avatar: user.avatar, balance: user.balance, role: user.role, shopName: user.shopName, nationalId: user.nationalId, kraPin: user.kraPin } });
});

app.get("/api/auth/me", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized session state." });
  }
  res.json({ user: { id: user.id, username: user.username, name: user.name, phone: user.phone, avatar: user.avatar, balance: user.balance, role: user.role, shopName: user.shopName, nationalId: user.nationalId, kraPin: user.kraPin } });
});

app.post("/api/auth/deposit", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized user." });
  }
  const { amount } = req.body;
  const depositVal = parseFloat(amount);
  if (isNaN(depositVal) || depositVal <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number." });
  }

  user.balance += depositVal;
  await saveUser(user);
  res.json({ balance: user.balance, message: `Successfully deposited KES ${depositVal.toLocaleString()} via simulated M-Pesa STK push callback authorization.` });
});

// Admin endpoints
app.get("/api/admin/users", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required." });
  }
  const currentUsers = await fetchUsers();
  res.json(currentUsers);
});

app.post("/api/admin/users/create", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required." });
  }
  const { username, password, name, phone, role, balance, avatar } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: "Username, password and name are required." });
  }

  const currentUsers = await fetchUsers();
  const existing = currentUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User already exists with this email/username." });
  }

  const newUser = {
    id: "usr-" + Math.random().toString(36).substr(2, 9),
    username,
    email: username,
    password: password || "tiktak1",
    name,
    phone: phone || "0700000000",
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    balance: parseFloat(balance) || 10000,
    role: role || "buyer"
  };

  await saveUser(newUser);
  await addActivity("listing_created", `Admin registered fresh client proxy profile for "${name}" (${role})`);
  res.json({ success: true, user: newUser });
});

app.post("/api/admin/users/:id/update", async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required." });
  }

  const currentUsers = await fetchUsers();
  const targetUser = currentUsers.find(u => u.id === req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const { balance, name, phone, password, role } = req.body;
  if (balance !== undefined) targetUser.balance = parseFloat(balance);
  if (name !== undefined) targetUser.name = name;
  if (phone !== undefined) targetUser.phone = phone;
  if (password !== undefined) targetUser.password = password;
  if (role !== undefined) targetUser.role = role;

  await saveUser(targetUser);
  res.json({ success: true, user: targetUser });
});

app.post("/api/admin/users/:id/delete", async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required." });
  }

  const currentUsers = await fetchUsers();
  const targetUser = currentUsers.find(u => u.id === req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  if (targetUser.id === authUser.id) {
    return res.status(400).json({ error: "You cannot delete your own admin account!" });
  }

  await deleteUser(targetUser.id);
  res.json({ success: true, message: "User deleted successfully." });
});

app.post("/api/admin/ads/create", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required." });
  }

  const { title, description, category, imageUrl, videoUrl, adTagline, externalLink } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ error: "Title, description and category are required for Ads." });
  }

  const newAd = {
    id: "ad-" + Math.random().toString(36).substr(2, 9),
    title,
    description,
    category,
    condition: "New",
    location: "Sponsored Banner Ads",
    seller: { id: "usr-admin", name: "System Admin Sponsor", rating: 5.0, avatar: user.avatar },
    startingBid: 0,
    reservePrice: 0,
    currentBid: 0,
    bidsCount: 0,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // Ends in 30 days
    status: "active" as const,
    winnerId: null,
    winnerName: null,
    escrowStatus: "none" as const,
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    videoUrl: videoUrl || "",
    isAd: true,
    adTagline: adTagline || "Sponsored Ad",
    isMetaSync: false,
    isTikTokSync: false,
    socialCampaignStats: null
  };

  await saveListing(newAd);
  await addActivity("listing_created", `System Admin published sponsored advertisement: "${title}"`);
  res.json({ success: true, listing: newAd });
});

// Sync Ads/Campaigns to Meta Ads and TikTok Studio
app.post("/api/admin/ads/:id/sync-social", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required." });
  }

  const { syncMeta, syncTikTok, budget } = req.body;
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing/Ad campaign record not found" });
  }

  const listing = currentListings[listingIndex];
  
  if (syncMeta) listing.isMetaSync = true;
  if (syncTikTok) listing.isTikTokSync = true;

  const budgetNum = parseFloat(budget) || 5000;
  const baselineReach = budgetNum * 12.5;
  const baselineClicks = Math.floor(baselineReach * 0.048);

  listing.socialCampaignStats = {
    metaReach: syncMeta ? Math.floor(baselineReach * (0.85 + Math.random() * 0.3)) : (listing.socialCampaignStats?.metaReach || 0),
    tikTokReach: syncTikTok ? Math.floor(baselineReach * 1.6 * (0.8 + Math.random() * 0.45)) : (listing.socialCampaignStats?.tikTokReach || 0),
    metaClicks: syncMeta ? Math.floor(baselineClicks * (0.75 + Math.random() * 0.4)) : (listing.socialCampaignStats?.metaClicks || 0),
    tikTokClicks: syncTikTok ? Math.floor(baselineClicks * 1.45 * (0.7 + Math.random() * 0.4)) : (listing.socialCampaignStats?.tikTokClicks || 0)
  };

  await saveListing(listing);
  await addActivity("ad_sync", `Campaign "${listing.title}" successfully compiled and syndicated live onto ${syncMeta ? 'Meta Ads Platform' : ''} ${syncMeta && syncTikTok ? '&' : ''} ${syncTikTok ? 'TikTok Ads Studio' : ''} with budget KES ${budgetNum.toLocaleString()}`);

  res.json({ success: true, listing });
});

// API Endpoints
app.get("/api/listings", async (req, res) => {
  await checkAndAwardAuctions();
  const currentListings = await fetchListings();
  res.json(currentListings);
});

// Fetch Real-time Activity Feeds

// Fetch Real-time Activity Feeds
app.get("/api/activities", async (req, res) => {
  const currentActivities = await fetchActivities();
  res.json(currentActivities);
});

app.get("/api/listings/:id", async (req, res) => {
  await checkAndAwardAuctions();
  const currentListings = await fetchListings();
  const listing = currentListings.find(l => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  const currentBids = await fetchBids();
  const listingBids = currentBids.filter(b => b.listingId === req.params.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ ...listing, bidHistory: listingBids });
});

// Create Item Marketplace Listing
app.post("/api/listings", async (req, res) => {
  const { title, description, category, condition, location, startingBid, reservePrice, durationHours, imageUrl, videoUrl, brand, specs, size, warranty, minIncrement, allowBidding } = req.body;
  if (!title || !category || !condition || !location || !startingBid) {
    return res.status(400).json({ error: "Missing required listing parameters" });
  }

  const user = await getAuthUser(req);
  const sellerId = user ? user.id : "usr-demo";
  const sellerName = user ? (user.shopName || user.name) : "You (Mock Investor)";
  const sellerAvatar = user ? user.avatar : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";

  const hours = parseFloat(durationHours) || 24;
  const newListing = {
    id: "lst-" + Math.random().toString(36).substr(2, 9),
    title,
    description: description || `A high quality ${title} based out of ${location} in ${condition} condition.`,
    category,
    condition,
    location,
    seller: { id: sellerId, name: sellerName, rating: 5.0, avatar: sellerAvatar },
    startingBid: parseFloat(startingBid),
    reservePrice: parseFloat(reservePrice) || parseFloat(startingBid),
    currentBid: parseFloat(startingBid),
    bidsCount: 0,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * hours).toISOString(),
    status: "active" as const,
    winnerId: null,
    winnerName: null,
    escrowStatus: "none" as const,
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    videoUrl: videoUrl || "",
    brand: brand || "",
    specs: specs || "",
    size: size || "",
    warranty: warranty || "",
    minIncrement: parseFloat(minIncrement) || 500,
    allowBidding: allowBidding !== undefined ? allowBidding : true
  };

  await saveListing(newListing);
  await addActivity("listing_created", `${sellerName} posted a listing for "${title}" in "${location}" (${allowBidding !== false ? 'Auction' : 'Fixed Buy-Now Price'}) starting at KES ${parseFloat(startingBid).toLocaleString()}`);
  res.status(201).json(newListing);
});

// Place Bid
app.post("/api/listings/:id/bid", async (req, res) => {
  await checkAndAwardAuctions();
  
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = currentListings[listingIndex];
  if (listing.status !== "active") {
    return res.status(400).json({ error: "This auction is closed for bidding" });
  }

  const { amount, bidderName, location, notes, autoBidLimit } = req.body;
  const bidAmount = parseFloat(amount);
  
  const user = await getAuthUser(req);
  const nameOfBidder = user ? user.name : (bidderName || "You (Mock Investor)");
  const currentUserId = user ? user.id : "usr-guest";

  if (isNaN(bidAmount) || bidAmount <= 0) {
    return res.status(400).json({ error: `Please supply a valid numeric bid amount.` });
  }

  if (user && user.balance < bidAmount) {
    return res.status(400).json({ error: `Your balance (KES ${user.balance.toLocaleString()}) list is insufficient. Please deposit funds first.` });
  }

  const parsedLimit = autoBidLimit ? parseFloat(autoBidLimit) : null;
  if (parsedLimit !== null && parsedLimit < bidAmount) {
    return res.status(400).json({ error: `Maximum auto-bid limit must meet or exceed your bid of KES ${bidAmount.toLocaleString()}` });
  }

  // Check if someone else has an active auto-bid limit on this listing
  let triggerAutoBid = false;
  let autoBidAmount = 0;
  let autoBidderName = "";
  let autoBidderId = "";
  let autoBidderLocation = "";

  if (listing.autoBidLimit && listing.autoBidderId !== currentUserId) {
    if (bidAmount < listing.autoBidLimit) {
      triggerAutoBid = true;
      const minInc = listing.minIncrement || 1000;
      autoBidAmount = Math.min(listing.autoBidLimit, bidAmount + minInc);
      autoBidderName = listing.autoBidderName || "System AutoBidder";
      autoBidderId = listing.autoBidderId;
      autoBidderLocation = listing.autoBidLocation || "Nairobi";
    } else {
      // Outbid! Clear existing auto bidder on listing
      const oldBidder = listing.autoBidderName || "Previous AutoBidder";
      listing.autoBidLimit = null;
      listing.autoBidderId = null;
      listing.autoBidderName = null;
      listing.autoBidLocation = null;
      await addActivity("bid_placed", `⚠️ ${oldBidder}'s automatic bid limit was exceeded by ${nameOfBidder}'s higher bid.`);
    }
  }

  // Create new manual bid
  const newBid = {
    id: "bid-" + Math.random().toString(36).substr(2, 9),
    listingId: listing.id,
    bidderName: nameOfBidder,
    amount: bidAmount,
    timestamp: new Date().toISOString(),
    location: location || "Nairobi",
    notes: notes || "Immediate purchase option"
  };

  await saveBid(newBid);

  // Update listing max/current bid
  listing.currentBid = Math.max(listing.currentBid, bidAmount);
  listing.bidsCount = listing.bidsCount + 1;
  listing.winnerId = currentUserId;
  listing.winnerName = nameOfBidder;

  // Save auto-bid config of current user if they specified one
  if (parsedLimit !== null) {
    listing.autoBidLimit = parsedLimit;
    listing.autoBidderId = currentUserId;
    listing.autoBidderName = nameOfBidder;
    listing.autoBidLocation = location || "Nairobi";
  }

  await saveListing(listing);
  await addActivity("bid_placed", `${nameOfBidder} placed a bid of KES ${bidAmount.toLocaleString()} for "${listing.title}" from "${location || 'Nairobi'}"`);

  // If auto-bid is triggered, create resulting auto-bid
  let resultingBid = newBid;
  if (triggerAutoBid) {
    const autoBidObj = {
      id: "bid-" + Math.random().toString(36).substr(2, 9),
      listingId: listing.id,
      bidderName: autoBidderName,
      amount: autoBidAmount,
      timestamp: new Date().toISOString(),
      location: autoBidderLocation,
      notes: "🤖 Secure Proxy Auto-Bid System"
    };
    await saveBid(autoBidObj);

    listing.currentBid = autoBidAmount;
    listing.bidsCount = listing.bidsCount + 1;
    listing.winnerId = autoBidderId;
    listing.winnerName = autoBidderName;
    await saveListing(listing);

    await addActivity("bid_placed", `🤖 System Auto-Bid: ${autoBidderName} automatically outbid opposition at KES ${autoBidAmount.toLocaleString()} for "${listing.title}"`);
    resultingBid = autoBidObj;
  }

  res.status(201).json({ listing, bid: resultingBid });
});

// Buyer select winning bid manually (Reverse Auction style or Instant buy decision)
app.post("/api/listings/:id/award-bid", async (req, res) => {
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const { bidId } = req.body;
  if (!bidId) {
    return res.status(400).json({ error: "Please specify a valid bid ID to select." });
  }

  const listing = currentListings[listingIndex];
  if (listing.status !== "active") {
    return res.status(400).json({ error: "This listing is already awarded or closed." });
  }

  const currentBids = await fetchBids();
  const targetBid = currentBids.find(b => b.id === bidId && b.listingId === listing.id);
  if (!targetBid) {
    return res.status(404).json({ error: "The selected bid was not found on this listing." });
  }

  const user = await getAuthUser(req);
  const currentUsers = await fetchUsers();
  const matchingUser = currentUsers.find(u => u.name === targetBid.bidderName);

  listing.status = "completed";
  listing.currentBid = targetBid.amount;
  listing.winnerId = matchingUser ? matchingUser.id : (targetBid.bidderName === "You (Mock Investor)" ? "usr-demo" : "usr-unknown");
  listing.winnerName = targetBid.bidderName;
  listing.escrowStatus = "pending_payment";

  await saveListing(listing);

  await addActivity("bid_selected", `${listing.seller.name} selected ${targetBid.bidderName}'s bid of KES ${targetBid.amount.toLocaleString()} from "${targetBid.location || 'Nairobi'}" as the official winning bid!`);

  res.json({ status: "success", listing });
});

// Simulate M-Pesa STK Push Integration Request for Escrow Deposit
app.post("/api/listings/:id/checkout", async (req, res) => {
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const { phone, deliveryOption, deliveryAddress, deliveryFee } = req.body;
  if (!phone || !deliveryOption || !deliveryAddress) {
    return res.status(400).json({ error: "Missing delivery details or M-Pesa contact phone" });
  }

  const listing = currentListings[listingIndex];
  
  // If the listing doesn't use bidding (direct Buy-Now sale), buy instantly!
  const user = await getAuthUser(req);
  const buyerId = user ? user.id : "usr-demo";
  const buyerName = user ? (user.shopName || user.name) : "You (Mock Investor)";

  if (listing.allowBidding === false) {
    listing.status = "completed";
    listing.winnerId = buyerId;
    listing.winnerName = buyerName;
  }
  
  listing.mpesaPhone = phone;
  listing.deliveryOption = deliveryOption;
  listing.deliveryAddress = deliveryAddress;
  listing.deliveryFee = parseFloat(deliveryFee) || 350;
  listing.escrowStatus = "pending_payment";

  await saveListing(listing);

  res.json({
    status: "stk_push_sent",
    message: `Daraja API STK Push simulated successfully for mobile ${phone}. Awaiting user PIN.`,
    amountToPay: listing.currentBid + (parseFloat(deliveryFee) || 350)
  });
});

// Confirm M-Pesa Checkout & Fund Escrow Account
app.post("/api/listings/:id/confirm-payment", async (req, res) => {
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = currentListings[listingIndex];
  const receiptCode = "MPESA" + Math.random().toString(36).substring(2, 10).toUpperCase() + "K";
  const trackingCode = "BK-TX-" + Math.floor(1000 + Math.random() * 9000);

  // If a registered user is performing this payment simulation, deduct from their balance
  const user = await getAuthUser(req);
  if (user) {
    const totalCost = listing.currentBid + (listing.deliveryFee || 350);
    user.balance = Math.max(0, user.balance - totalCost);
    await saveUser(user);
  }

  // Funds successfully moved to Peach Escrow Vault hold
  listing.escrowStatus = "held_in_escrow";
  listing.mpesaReceipt = receiptCode;
  listing.trackingCode = trackingCode;

  await saveListing(listing);

  res.json({
    status: "success",
    message: "KES payment securely received. Funds are now held in the escrow safety vault until checkout goods delivery is validated.",
    receiptCode,
    trackingCode,
    newBalance: user ? user.balance : undefined
  });
});

// Dispatch Delivery: Move to Sent/Shipped
app.post("/api/listings/:id/dispatch", async (req, res) => {
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = currentListings[listingIndex];
  listing.escrowStatus = "shipped";
  await saveListing(listing);

  res.json({ status: "success", message: "Item successfully picked up by Peach courier and in-transit to buyer." });
});

// Deliver Item (Rider Simulation)
app.post("/api/listings/:id/deliver", async (req, res) => {
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = currentListings[listingIndex];
  listing.escrowStatus = "delivered";
  await saveListing(listing);

  res.json({ status: "success", message: "Rider confirmed successful delivery. Buyer verification needed to unlock funds." });
});

// Release Escrow Vault Funds to Seller (Buyer confirm)
app.post("/api/listings/:id/release-escrow", async (req, res) => {
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = currentListings[listingIndex];
  listing.escrowStatus = "funds_released";
  await saveListing(listing);

  res.json({ 
    status: "success", 
    message: `Escrow funds of KES ${listing.currentBid.toLocaleString()} successfully transferred to seller account! Transaction finalized safely.` 
  });
});

// Dispute Peach Transaction (Escrow Pause)
app.post("/api/listings/:id/dispute", async (req, res) => {
  const currentListings = await fetchListings();
  const listingIndex = currentListings.findIndex(l => l.id === req.params.id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = currentListings[listingIndex];
  listing.escrowStatus = "disputed";
  await saveListing(listing);

  res.json({ status: "success", message: "Transaction disputed. Peach Arbitration Board notified. Funds remain frozen in escrow." });
});

// Gemini Endpoint: Generate Smart Marketplace Description
app.post("/api/gemini/generate-description", async (req, res) => {
  if (!isGeminiAvailable || !ai) {
    return res.json({
      error: "Gemini API key is not configured in secrets. Please set it in Settings > Secrets.",
      description: `Premium, verified locally items. Fully functional, meticulously inspected, ready for bidding in Kenyan shillings.`
    });
  }

  const { title, category, condition, location, image } = req.body;
  const prompt = `You are a professional conversion-rate copywriter for "Peach", a venture-backed auction and instant-checkout marketplace for both new and premium pre-owned items in Kenya.
Write a hyper-compelling, professional, and visually formatted search-engine optimized (SEO) product description for a listing with these details:
- Title: ${title}
- Category: ${category}
- Condition: ${condition}
- Location: ${location}

The description must satisfy these guidelines:
1. Include a short, bold introductory paragraph highlighting the premium value of this item (whether brand new or wonderfully pre-owned).
2. Outline key selling points or specs in bullet points.
3. Call out why bidding on this item is safe due to Peach's secure Escrow vault protection and instant Safaricom M-Pesa convenience.
4. Keep the tone friendly, modern, and trustworthy. Use localized Kenyan vibes appropriately (e.g., Nyali, Kilimani, Westlands).
Write exactly 3 focused sections. Keep it under 250 words total. Do not use markdown tags outside standard bold and bullet points.`;

  try {
    let contents: any = prompt;
    if (image && image.data && image.mimeType) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data
            }
          },
          {
            text: prompt + "\n\nAnalyze the attached image/video of the actual product to draft an even more detailed, highly accurate description of its physical appearance, colors, branding elements, and visual state."
          }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
    });
    const parsedText = response.text || "No response text generated";
    res.json({ description: parsedText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to query Gemini generation" });
  }
});

// Gemini Endpoint: Generate viral social media captions for FB & TikTok with deep links
app.post("/api/gemini/generate-social-caption", async (req, res) => {
  const { title, category, condition, location, price, allowBidding, deepLink, network } = req.body;
  
  // Localized static fallbacks in case Gemini is not available
  if (!isGeminiAvailable || !ai) {
    let caption = "";
    if (network === "facebook") {
      caption = `🔥 AMAZING VALUE ALERT on Peach Kenya! 🔥\n\nLooking for a premium ${title}? We've got you covered! Located in ${location || "Nairobi"}, this item is in ${condition || "Excellent"} condition and is available right now.\n\n💰 Price: KES ${Number(price).toLocaleString()} (${allowBidding !== false ? "Bidding open!" : "Direct Buy Now"})\n🔒 Safe & Guarded P2P Escrow - Your money stay locked until you inspect and approve delivery!\n\n👇 Bid / Buy directly here:\n🔗 ${deepLink || "https://peach.co.ke"}\n\n#PeachMarketplace #KenyaDeals #SecureEscrow #NairobiShopping`;
    } else {
      caption = `[Video cue: Show high-energy close up of the ${title} with some cool music 🎵]\n\n"Weh! Cheki hii crazy deal kwenye Peach! 🤩 This absolute gem is in ${condition || "Superb"} condition! Inapatikana hapa hapa ${location || "Nairobi"}. Form ni gani? Bidding starts at just KES ${Number(price).toLocaleString()}! 🚀"\n\n[Video cue: Tap on the phone to show fast Safaricom M-Pesa secure escrow transaction]\n\nCaption:\nLooking for high aura deals? 🤫 Skip the drama and trade with 100% Peach Escrow protection! Fast shipping countrywide. Link in bio! 📲\n🔗 ${deepLink || "https://peach.co.ke"}\n\n#TikTokKenya #PeachEscrow #Chonjo #Aura #SafeShopping #KenyaFinest`;
    }
    return res.json({ caption });
  }

  const prompt = network === "tiktok" 
    ? `You are a viral TikTok video content director and scriptwriter for Peach, a secure venture-backed peer-to-peer marketplace in Kenya.
Write a highly energetic viral TikTok caption and video storyboard prompt for this item:
- Title: ${title}
- Category: ${category}
- Condition: ${condition}
- Bid/Price: KES ${Number(price).toLocaleString()} (${allowBidding !== false ? "Starting Auction Bid" : "Direct Fixed Price"})
- Location: ${location}
- Bio link: ${deepLink}

Guidelines:
1. Provide a funny/hype, trending short video caption full of relevant emojis.
2. Include video script / scene cue ideas, e.g. '[Video cue: Camera zooms on ${title} showing pristine detail...]'.
3. Use cool local Kenyan slang/trends (sheng like 'Mbogi', 'Chonjo', 'Form ni gani', 'Kuwaka', 'Inaweza', 'Odi', 'Riaaa') to make it fun and youth-focused.
4. Mention clearly that they can buy securely with deep link or link in bio: '${deepLink}'.
5. Include trending hashtags like #TikTokKenya #PeachEscrow #Chonjo #Aura #SafeAuction.
6. Keep the style short, visual, and highly dynamic. Output only the caption writeup directly without extra explanations.`
    : `You are a professional conversion-rate social media Manager for Peach, the premium escrow-backed peer-to-peer marketplace in Kenya.
Write a lively, highly engaging Facebook post/caption to promote this item:
- Title: ${title}
- Category: ${category}
- Condition: ${condition}
- Bid/Price: KES ${Number(price).toLocaleString()} (${allowBidding !== false ? "Bidding starts at" : "Direct Buy Now Price"})
- Location: ${location}
- Bid link: ${deepLink}

Guidelines:
1. Craft a punchy opening line that hooks the user immediately using exciting emojis.
2. Highlight that the transaction is 100% secure with Peach Escrow Protection (funds held safely in escrow until delivery is verified by buyer).
3. Frame the item as an incredible deal in Kenya. Include local community references (like Nairobi, Mombasa, Westlands, Kilimani, Kisumu) to make it highly relatable.
4. Integrate the provided direct deep link clearly: '${deepLink}'.
5. Add relevant hashtags (e.g., #PeachMarketplace, #NairobiDeals, #SafeEscrow) so it looks polished and professional.
6. Keep it friendly, modern, and trustworthy. Keep it under 180 words. Output only the caption writeup directly without extra descriptions or side commentaries.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    const parsedText = response.text || "No caption text generated by AI";
    res.json({ caption: parsedText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to query Gemini generation" });
  }
});

// Gemini Endpoint: Evaluate pricing and produce venture-grade insights
app.post("/api/gemini/evaluate-item", async (req, res) => {
  if (!isGeminiAvailable || !ai) {
    // Elegant fallback simulation
    const estimatedNew = 85000;
    const recommendedStart = 45000;
    return res.json({
      estimatedNewPrice: estimatedNew,
      recommendedStartingBid: recommendedStart,
      estimatedEscrowFee: 250,
      marketVibe: "High Demand",
      expertOpinion: "Electronics of this scale sell rapidly in Lavington and Kilimani. Set your starting bid lower to encourage bidding wars, as premium items (both new and pre-owned) with a reserve usually fetch up to 30% more on Peach!",
      brand: "HP",
      specs: "Core i7 Quad-Core, 16GB Dual-Channel DDR4 RAM, 512GB NVMe M.2 SSD",
      size: "14.0 Inch Full HD IPS Screen, 1.48 kg Weight",
      warranty: "12 Months Official Provider Warranty",
      suggestedIncrement: 1000
    });
  }

  const { title, category, condition } = req.body;
  const prompt = `You are an expert marketplace valuation officer, pricing strategist, and cataloger for Kenya's thriving e-commerce economy (spanning both new and pre-owned premium assets).
Evaluate a listing item for Kenya's marketplace:
- Title: "${title}"
- Category: "${category}"
- Condition: "${condition}"

Please return a JSON response with pricing suggestions in KES (Kenyan Shillings) alongside catalog details (brand, specs, size, warranty, minimum bidding increment) and localized strategic market feedback. 
Ensure the output matches exactly this json structure:
{
  "estimatedNewPrice": <number (price in KES for buying this brand-new in Kenya, e.g. 100000)>,
  "recommendedStartingBid": <number (price in KES to start the auction, e.g. 55000)>,
  "estimatedEscrowFee": <number (calculated as 1.5% of recommended start or 250, whichever is higher)>,
  "marketVibe": "<string describing demand, e.g. 'Extremely High', 'Moderate', 'Niche'>",
  "expertOpinion": "<string under 120 words with strategic advice on pricing in Kenya for the new or pre-loved premium marketplace to maximize buyer friction and bidding traction>",
  "brand": "<string Suggesting the brand name, e.g. 'HP', 'Sony', 'Apple', 'Nike', 'Samsung'>",
  "specs": "<string Strategic tech specs or hardware/material features of this item, e.g. 'Core i7, 16GB RAM, 512GB SSD' or '100% Breathable cotton, double-stitched joints'>",
  "size": "<string Preferred standard fashion size or dimensions/weight, e.g. 'Medium / 32W', '14.0\" Screen, 1.4kg', 'Standard PS5 Disc height'>",
  "warranty": "<string Suggest warranty e.g., '12 Months Official Apple Warranty', '6 Months Merchant warranty', or 'None (Sold as seen)' if used/fair>",
  "suggestedIncrement": <number Suggested bidding increment e.g. 500, 1000, or 2000>
}

Return ONLY this parseable JSON block, with no additional markdown block wrapper tags or extra conversational text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textResult = response.text?.trim() || "{}";
    const data = JSON.parse(textResult);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini pricing evaluation error:", error);
    // Robust fallback values
    res.json({
      estimatedNewPrice: 50000,
      recommendedStartingBid: 25000,
      estimatedEscrowFee: 375,
      marketVibe: "Active",
      expertOpinion: `Valuation compiled using automated Nairobi market index. Good demand of ${title} in the local market. Ensure clear pictures of any physical scratches to foster full trust via our escrow verification system.`,
      brand: "Generic",
      specs: "Meticulously inspected premium asset. Ready-to-go setup.",
      size: "Standard size",
      warranty: "None (Sold as seen)",
      suggestedIncrement: 500
    });
  }
});


// Gemini Endpoint: Combined Multi-Modal AI Details Autofill
app.post("/api/gemini/autofill-listing-details", async (req, res) => {
  if (!isGeminiAvailable || !ai) {
    // Dynamic mock fallback based on input
    const title = req.body.title || "Premium Pre-Owned Product";
    const category = req.body.category || "Electronics";
    const condition = req.body.condition || "Good";
    const location = req.body.location || "Nairobi";
    
    return res.json({
      title: title,
      category: category,
      condition: condition,
      description: `Premium, verified locally listed ${title} located near ${location}. Meticulously scrutinized by Peach escrow safety team. Instant purchase or bidding in Kenyan Shillings (KES).`,
      brand: "Generic/Premium",
      specs: "Superb condition, certified by local expert team.",
      size: "Standard Size",
      warranty: "3 Months Warranty",
      recommendedStartingBid: 12000,
      recommendedReservePrice: 13800,
      suggestedIncrement: 500
    });
  }

  const { title, category, condition, location, image } = req.body;
  const prompt = `You are an expert AI marketplace listing officer for "Peach", a secure auction platform in Kenya.
Analyze the provided parameters (Title: "${title || "Not specified"}", Category: "${category || "Not specified"}", Condition: "${condition || "Not specified"}", Location: "${location || "Nairobi"}") and any attached visual image.

If an image is attached, inspect the image to:
1. Identify the product: brand, model, visual state, color. If title is empty, generate an appropriate title.
2. Deduce the most appropriate category (Must be strictly one of: 'Electronics', 'Fashion', 'Books & Hobbies', 'Services', 'Vehicles & Sports').
3. Draft a beautiful, professional market-grade description. Encourage trust by calling out security via Peach Escrow.
4. Estimate logical starting auction value in KES (Kenyan Shillings) appropriate for pre-owned or new items in the local Nairobi market. Recommend reserve, minimum bid increment (usually 500 or 1000), brand, specs, standard size/dimensions, and estimated warranty.

If NO image is attached, use the specified Title/details to generate the complete dataset, filling in all missing fields smartly with realistic marketplace defaults.

Refining guidelines:
- Title must be crisp, descriptive but brief (e.g. "Apple iPhone 12 Pro Max (128GB, Pacific Blue)")
- Description must highlight escrow protection, M-Pesa convenience and include localized Kenyan details.
- Recommended starting bid must be a realistic number in KES (e.g. 50000).
- Recommended reserve price should be around 1.15x starting bid, rounded.
- Category must be one of: "Electronics", "Fashion", "Books & Hobbies", "Services", "Vehicles & Sports"
- Condition must be one of: "New", "Like New", "Good", "Fair".`;

  try {
    let contents: any = prompt;
    if (image && image.data && image.mimeType) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data
            }
          },
          {
            text: prompt + "\n\nAnalyze the attached visual image to compile the accurate detail fields."
          }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, description: "Must be one of: Electronics, Fashion, Books & Hobbies, Services, Vehicles & Sports" },
            condition: { type: Type.STRING, description: "Must be one of: New, Like New, Good, Fair" },
            description: { type: Type.STRING },
            brand: { type: Type.STRING },
            specs: { type: Type.STRING },
            size: { type: Type.STRING },
            warranty: { type: Type.STRING },
            recommendedStartingBid: { type: Type.NUMBER },
            recommendedReservePrice: { type: Type.NUMBER },
            suggestedIncrement: { type: Type.NUMBER }
          },
          required: ["title", "category", "condition", "description", "brand", "specs", "size", "warranty", "recommendedStartingBid", "recommendedReservePrice", "suggestedIncrement"]
        }
      }
    });

    const textResult = response.text?.trim() || "{}";
    const data = JSON.parse(textResult);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini autofill listing details error:", error);
    res.status(500).json({ error: error.message || "Failed to process AI autofill details" });
  }
});


// Express server start
async function startServer() {
  // Vite integration for combined developer preview
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled production assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Peach Fullstack Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
