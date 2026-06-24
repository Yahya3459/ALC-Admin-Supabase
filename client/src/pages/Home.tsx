import { GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0b3f86, #0f5bb7)" }}
    >
      <div className="text-center text-white">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">مركز الأمجاد للغات والتدريب</h1>
        <p className="mt-2 text-white/70">نظام إدارة الطلبات</p>
      </div>
    </div>
  );
}
