import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// In-memory data store
let bankAccounts = [
  { id: "b1", bankName: "BSI", accountNumber: "714-839-4444", accountHolder: "Yasnawa", iconType: "bank", isActive: true },
  { id: "q1", bankName: "QRIS", accountNumber: "-", accountHolder: "Yasnawa", iconType: "qris", isActive: true }
];
let donationsList: any[] = [];
let newsReports = [
  { id: "news-1", title: "Penyaluran Zakat Tahap 1", summary: "Zakat telah disalurkan ke 100 asnaf.", date: "1 Januari 2026", category: "Penyaluran", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400" }
];
let systemNotifications = [
  { id: "notif-1", title: "Selamat Datang di Lazisna", content: "Platform Ziswaf Terpercaya.", type: "info", createdAt: new Date().toISOString() }
];
let programsState = [
  { id: "p-infaq", title: "Infaq Rutin", category: "Infaq", icon: "Wallet", description: "Infaq untuk operasional yayasan.", collectedAmount: 15000000, targetAmount: 50000000, donorsCount: 150, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "p-zakat", title: "Zakat Maal", category: "Zakat", icon: "Calculator", description: "Zakat penghasilan.", collectedAmount: 20000000, targetAmount: null, donorsCount: 50, color: "text-blue-500", bg: "bg-blue-50" }
];
let ustadzList = [
  { id: 1, name: "Ustadz Hamba Allah", wa: "08123456789", specialization: "Fiqih Zakat", address: "Jakarta", image: "https://ui-avatars.com/api/?name=Ustadz&background=10b981&color=fff", ig: "", yt: "" }
];
let prayerWall: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Auth endpoints
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@lazisna.org" && password === "admin123") {
      res.json({ id: "admin", name: "Administrator", email });
    } else {
      res.json({ id: "user-" + Date.now(), name: email.split("@")[0], email, wa: "-" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    res.json({ id: "user-" + Date.now(), name: name || email.split("@")[0], email, wa: "-" });
  });

  app.post("/api/settings", (req, res) => {
    res.json({ success: true });
  });

  // Data endpoints
  app.get("/api/bank-accounts", (req, res) => res.json(bankAccounts));
  app.post("/api/bank-accounts", (req, res) => {
    const newBank = { id: "bank-" + Date.now(), ...req.body };
    bankAccounts.unshift(newBank);
    res.json(newBank);
  });
  app.put("/api/bank-accounts/:id", (req, res) => {
    const id = req.params.id;
    const index = bankAccounts.findIndex(b => b.id === id);
    if (index > -1) {
      bankAccounts[index] = { ...bankAccounts[index], ...req.body };
      res.json(bankAccounts[index]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });
  app.delete("/api/bank-accounts/:id", (req, res) => {
    bankAccounts = bankAccounts.filter(b => b.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/programs", (req, res) => res.json(programsState));
  app.put("/api/programs/:id", (req, res) => {
    const id = req.params.id;
    const index = programsState.findIndex(p => p.id === id);
    if (index > -1) {
      programsState[index] = { ...programsState[index], ...req.body };
      res.json(programsState[index]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.get("/api/news", (req, res) => res.json(newsReports));
  app.post("/api/news", (req, res) => {
    const newNews = { id: "news-" + Date.now(), ...req.body };
    newsReports.unshift(newNews);
    res.json(newNews);
  });
  app.put("/api/news/:id", (req, res) => {
    const index = newsReports.findIndex(n => n.id === req.params.id);
    if (index > -1) {
      newsReports[index] = { ...newsReports[index], ...req.body };
      res.json(newsReports[index]);
    } else res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/news/:id", (req, res) => {
    newsReports = newsReports.filter(n => n.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/notifications", (req, res) => res.json(systemNotifications));
  app.post("/api/notifications", (req, res) => {
    const newNotif = { id: "notif-" + Date.now(), ...req.body };
    systemNotifications.unshift(newNotif);
    res.json(newNotif);
  });
  app.delete("/api/notifications/:id", (req, res) => {
    systemNotifications = systemNotifications.filter(n => n.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/ustadz", (req, res) => res.json(ustadzList));
  app.post("/api/ustadz", (req, res) => {
    const newUstadz = { id: Date.now(), ...req.body };
    ustadzList.unshift(newUstadz);
    res.json(newUstadz);
  });
  app.put("/api/ustadz/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = ustadzList.findIndex(u => u.id === id);
    if (index > -1) {
      ustadzList[index] = { ...ustadzList[index], ...req.body };
      res.json(ustadzList[index]);
    } else res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/ustadz/:id", (req, res) => {
    const id = parseInt(req.params.id);
    ustadzList = ustadzList.filter(u => u.id !== id);
    res.json({ success: true });
  });

  app.get("/api/donations", (req, res) => res.json(donationsList));
  app.post("/api/donations", (req, res) => {
    const { amount, programId, donorName, paymentMethod, status } = req.body;
    const newDonation = {
      id: "don-" + Date.now(),
      invoiceId: "INV-" + Date.now(),
      amount,
      programId,
      programTitle: programsState.find(p => p.id === programId)?.title || "General",
      donorName,
      paymentMethod,
      date: new Date().toISOString(),
      status: status || "Pending",
      prayer: req.body.prayer
    };
    donationsList.unshift(newDonation);
    if (newDonation.status === "Success") {
      const prog = programsState.find(p => p.id === programId);
      if (prog) {
        prog.collectedAmount += amount;
        prog.donorsCount += 1;
      }
    }
    res.json(newDonation);
  });
  app.put("/api/donations/:id/status", (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const index = donationsList.findIndex(d => d.id === id);
    if (index > -1) {
      const prevStatus = donationsList[index].status;
      donationsList[index].status = status;
      if (prevStatus !== "Success" && status === "Success") {
        const p = programsState.find(x => x.id === donationsList[index].programId);
        if (p) { p.collectedAmount += donationsList[index].amount; p.donorsCount++; }
      } else if (prevStatus === "Success" && status !== "Success") {
        const p = programsState.find(x => x.id === donationsList[index].programId);
        if (p) { p.collectedAmount -= donationsList[index].amount; p.donorsCount--; }
      }
      res.json(donationsList[index]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });
  app.delete("/api/donations/:id", (req, res) => {
    const id = req.params.id;
    const index = donationsList.findIndex(d => d.id === id);
    if (index > -1) {
      const d = donationsList[index];
      if (d.status === "Success") {
        const p = programsState.find(x => x.id === d.programId);
        if (p) { p.collectedAmount -= d.amount; p.donorsCount--; }
      }
      donationsList.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.get("/api/prayers", (req, res) => res.json(prayerWall));
  app.post("/api/prayers", (req, res) => {
    const newPrayer = { id: "pr-" + Date.now(), aminCount: 0, createdAt: new Date().toISOString(), ...req.body };
    prayerWall.unshift(newPrayer);
    res.json(newPrayer);
  });
  app.post("/api/prayers/:id/amin", (req, res) => {
    const p = prayerWall.find(x => x.id === req.params.id);
    if (p) { p.aminCount++; res.json(p); }
    else res.status(404).json({ error: "Not found" });
  });

  // Gemini logic
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const contents = req.body.contents;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      res.json({
        candidates: [
          { content: { parts: [{ text: response.text }] } }
        ]
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
