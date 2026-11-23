import { Router, Request, Response } from "express";
import type { HealthResponse, ApiResponse } from "@/types";

const router = Router();

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  const health: HealthResponse = {
    status: "ok",
    uptime: process.uptime(),
    version: "0.1.0",
  };
  res.json({
    success: true,
    status: 200,
    data: health,
    timestamp: new Date().toISOString(),
  });
});

// Echo endpoint — useful for testing the API client
router.post("/echo", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    status: 200,
    data: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// Mock users endpoint
router.get("/users", (_req: Request, res: Response) => {
  const users = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
  ];
  res.json({
    success: true,
    status: 200,
    data: users,
    timestamp: new Date().toISOString(),
  });
});

// Mock single user endpoint
router.get("/users/:id", (req: Request, res: Response) => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const user = { id, name: "Alice Johnson", email: "alice@example.com" };

  if (id > 3) {
    res.status(404).json({
      success: false,
      status: 404,
      error: `User with id ${id} not found`,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.json({
    success: true,
    status: 200,
    data: user,
    timestamp: new Date().toISOString(),
  });
});

// Mock create user endpoint
router.post("/users", (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({
      success: false,
      status: 400,
      error: "Name and email are required",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const newUser = { id: 4, name, email };
  res.status(201).json({
    success: true,
    status: 201,
    data: newUser,
    timestamp: new Date().toISOString(),
  });
});

export default router;
