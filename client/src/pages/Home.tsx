import { useLocation } from "wouter";
import { GraduationCap, ArrowLeft, BookOpen, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0b3f86 0%, #0f5bb7 50%, #1762c6 100%)" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                            radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-2xl text-center text-white">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))" }}
          >
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
          مركز الأمجاد
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-2">
          للغات والتدريب
        </p>
        <p className="text-sm md:text-base text-white/60 mb-8">
          نظام إدارة الطلبات والتسجيلات
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 my-12 mb-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-xs md:text-sm text-white/70">دورات متنوعة</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-xs md:text-sm text-white/70">مدربون محترفون</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-xs md:text-sm text-white/70">شهادات معتمدة</p>
          </div>
        </div>

        {/* Login Button */}
        <Button
          onClick={() => navigate("/admin/login")}
          className="h-12 px-8 text-base font-bold gap-2 shadow-lg hover:shadow-xl transition-all"
          style={{
            background: "linear-gradient(90deg, #ffffff, #f0f0f0)",
            color: "#0b3f86",
          }}
        >
          <span>تسجيل الدخول</span>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Footer Text */}
        <p className="text-xs text-white/50 mt-8">
          © 2026 مركز الأمجاد للغات والتدريب. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
