import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { registerUploadRoutes } from "../server/upload";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic, setupVite } from "../server/_core/vite";

async function createServerApp() {
  const app = express();
  
  // Configure body parser with larger size limit for file uploads
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "trpc-accept", "x-filename"],
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerUploadRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    // We only need setupVite for local development
    // In Vercel, we'll serve static files from the dist directory
  } else {
    serveStatic(app);
  }

  return app;
}

// Export for Vercel
let app: any;
export default async (req: any, res: any) => {
  if (!app) {
    app = await createServerApp();
  }
  return app(req, res);
};

// Also keep the standalone server for local development/other platforms
if (process.env.NODE_ENV !== "production") {
  async function startServer() {
    const app = await createServerApp();
    const server = createServer(app);
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }
  startServer().catch(console.error);
}
