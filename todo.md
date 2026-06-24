# مشروع نظام إدارة طلبات مركز الأمجاد

## المهام

- [x] تحديث schema قاعدة البيانات: جدول registrations
- [x] تطبيق migration SQL على قاعدة البيانات
- [x] إضافة query helpers في server/db.ts
- [x] بناء tRPC procedures: submitRegistration (public) + admin procedures (protected)
- [x] نظام مصادقة Admin بـ username/password (JWT) مستقل عن Manus OAuth
- [x] صفحة تسجيل الدخول للوحة التحكم (/admin/login)
- [x] لوحة التحكم الرئيسية (/admin) - عرض الطلبات مع فلترة وبحث
- [x] تغيير حالة الطلبات (pending / contacted / enrolled / rejected)
- [x] تصدير الطلبات كملف Excel
- [x] إرسال إشعار بريد إلكتروني تلقائي عند كل طلب جديد
- [x] تحديث صفحة العروض (offers.html) لترسل البيانات إلى API
- [x] تحديث تصميم index.css وثيمة التطبيق
- [x] كتابة Vitest tests
- [ ] checkpoint نهائي
