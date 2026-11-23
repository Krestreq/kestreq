import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api";
import { requestLogger, errorHandler, notFound } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// ——— Middleware ———
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ——— Routes ———
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 200,
    data: {
      name: "Krestreq Backend",
      version: "0.1.0",
      description: "Mock API server for Krestreq API testing app",
    },
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRoutes);

// ——— 404 Handler ———
app.use(notFound);

// ——— Error Handler ———
app.use(errorHandler);

// ——— Start Server ———
app.listen(PORT, () => {
  console.log(`🚀 Krestreq Backend running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});

export default app;
