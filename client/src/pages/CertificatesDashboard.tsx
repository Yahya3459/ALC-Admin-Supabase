import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Eye,
  Download,
  Zap,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────
const CERT_STATUS_MAP = {
  pending:    { label: "قيد الانتظار",   color: "status-pending",   icon: Clock },
  processing: { label: "قيد المعالجة",   color: "status-processing", icon: Zap },
  completed:  { label: "مكتمل",         color: "status-enrolled",  icon: CheckCircle },
  rejected:   { label: "مرفوض",         color: "status-rejected",  icon: XCircle },
} as const;

type CertStatusKey = keyof typeof CERT_STATUS_MAP;

function CertStatusBadge({ status }: { status: CertStatusKey }) {
  const cfg = CERT_STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Certificate Details Modal ────────────────────────────────────────────────
function CertificateDetailsModal({
  cert,
  onClose,
}: {
  cert: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>تفاصيل الطلب #{cert.id}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الاسم (عربي)</p>
              <p className="font-semibold">{cert.fullNameAr}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الاسم (إنجليزي)</p>
              <p className="font-semibold">{cert.fullNameEn}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الدورة</p>
              <p className="font-semibold">{cert.courseName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الهاتف</p>
              <p className="font-mono text-sm" dir="ltr">{cert.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مكان الميلاد</p>
              <p className="font-semibold">{cert.birthPlace}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
              <p className="font-semibold">{cert.birthDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الجنس</p>
              <p className="font-semibold">{cert.gender === "male" ? "ذكر" : "أنثى"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الحالة</p>
              <CertStatusBadge status={cert.status as CertStatusKey} />
            </div>
          </div>

          {cert.idCardUrl && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">صورة الهوية/جواز السفر</p>
              <a
                href={cert.idCardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                عرض الصورة
              </a>
            </div>
          )}

          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>تاريخ الطلب: {new Date(cert.createdAt).toLocaleString("ar-SA")}</p>
            <p>آخر تحديث: {new Date(cert.updatedAt).toLocaleString("ar-SA")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Certificates Dashboard ──────────────────────────────────────────────
export default function CertificatesDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  const utils = trpc.useUtils();

  // Fetch certificates
  const { data: certs, isLoading, refetch } = trpc.admin.getCertificateRequests.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Mutations
  const updateStatus = trpc.admin.updateCertificateStatus.useMutation({
    onSuccess: () => {
      utils.admin.getCertificateRequests.invalidate();
      toast.success("تم تحديث الحالة");
    },
    onError: () => toast.error("فشل تحديث الحالة"),
  });

  const deleteCert = trpc.admin.deleteCertificateRequest.useMutation({
    onSuccess: () => {
      utils.admin.getCertificateRequests.invalidate();
      setDeleteId(null);
      toast.success("تم حذف الطلب");
    },
    onError: () => toast.error("فشل حذف الطلب"),
  });

  // Filter certificates
  const filteredCerts = certs?.filter((cert) => {
    const matchesSearch =
      cert.fullNameAr.includes(search) ||
      cert.fullNameEn.includes(search) ||
      cert.phone.includes(search) ||
      cert.courseName.includes(search);
    
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Stats
  const stats = {
    total: certs?.length || 0,
    pending: certs?.filter((c) => c.status === "pending").length || 0,
    processing: certs?.filter((c) => c.status === "processing").length || 0,
    completed: certs?.filter((c) => c.status === "completed").length || 0,
    rejected: certs?.filter((c) => c.status === "rejected").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">الإجمالي</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">قيد الانتظار</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">قيد المعالجة</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">مكتمل</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">مرفوض</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-lg">طلبات الشهادات</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الهاتف أو الدورة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-9">
                <SelectValue placeholder="فلترة بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : !filteredCerts.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>لا توجد طلبات مطابقة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="text-right font-semibold w-12">#</TableHead>
                    <TableHead className="text-right font-semibold">الاسم (عربي)</TableHead>
                    <TableHead className="text-right font-semibold hidden md:table-cell">الدورة</TableHead>
                    <TableHead className="text-right font-semibold">الهاتف</TableHead>
                    <TableHead className="text-right font-semibold">الحالة</TableHead>
                    <TableHead className="text-right font-semibold hidden sm:table-cell">التاريخ</TableHead>
                    <TableHead className="text-right font-semibold w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.map((cert) => (
                    <TableRow key={cert.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-mono text-sm text-muted-foreground">{cert.id}</TableCell>
                      <TableCell className="font-semibold">{cert.fullNameAr}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{cert.courseName}</TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">{cert.phone}</TableCell>
                      <TableCell>
                        <Select
                          value={cert.status}
                          onValueChange={(v) =>
                            updateStatus.mutate({ id: cert.id, status: v as CertStatusKey })
                          }
                        >
                          <SelectTrigger className="h-8 w-40 border-0 p-0 focus:ring-0 bg-transparent">
                            <CertStatusBadge status={cert.status as CertStatusKey} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="processing">قيد المعالجة</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="rejected">مرفوض</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(cert.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setSelectedCert(cert)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(cert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedCert && (
        <CertificateDetailsModal
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteCert.mutate({ id: deleteId })}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
