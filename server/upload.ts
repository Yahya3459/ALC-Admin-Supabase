import express, { Request, Response } from "express";
import { storagePut } from "./storage";

export function registerUploadRoutes(app: express.Application) {
  // معالج رفع الملفات
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      // التحقق من وجود الملف في الطلب
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "لا يوجد ملف في الطلب" });
      }

      // الحصول على البيانات الثنائية من الطلب
      const chunks: Buffer[] = [];
      
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });

      req.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          
          if (buffer.length === 0) {
            return res.status(400).json({ error: "الملف فارغ" });
          }

          // حد أقصى 5 MB
          const MAX_SIZE = 5 * 1024 * 1024;
          if (buffer.length > MAX_SIZE) {
            return res.status(413).json({ error: "حجم الملف يتجاوز 5 MB" });
          }

          // تحديد نوع المحتوى من رؤوس الطلب
          const contentType = req.headers["content-type"] || "application/octet-stream";
          
          // تحديد اسم الملف
          const filename = req.headers["x-filename"] as string || `id-card-${Date.now()}`;
          
          // رفع الملف باستخدام نظام التخزين المدمج
          const result = await storagePut(`certificates/${filename}`, buffer, contentType as string);
          
          return res.json({ 
            success: true, 
            url: result.url,
            key: result.key 
          });
        } catch (error) {
          console.error("[Upload] Storage error:", error);
          return res.status(500).json({ error: "فشل رفع الملف" });
        }
      });

      req.on("error", (error) => {
        console.error("[Upload] Request error:", error);
        res.status(500).json({ error: "خطأ في استقبال الملف" });
      });
    } catch (error) {
      console.error("[Upload] Error:", error);
      res.status(500).json({ error: "خطأ في معالجة الطلب" });
    }
  });
}
