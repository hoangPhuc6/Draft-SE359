import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../../components/layout/Topbar";
import Loader from "../../components/ui/Loader";
import Badge, { StatusBadge } from "../../components/ui/Badge";
import { incidentApi } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { apiMessage } from "../../lib/api";
import { fmtDateTime } from "../../lib/utils";

const CATEGORY_LABELS = {
  hardware: "Phần cứng",
  network: "Mạng",
  os: "Hệ điều hành",
  software: "Phần mềm",
};

const STATUS_OPTIONS = [
  { value: "open", label: "Mở" },
  { value: "under_review", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "closed", label: "Đã đóng" },
];

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStaff = user?.role === "lab_staff" || user?.role === "system_admin";

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await incidentApi.getById(id);
      setTicket(data);
      setNewStatus(data.status);
    } catch (err) {
      toast.error(apiMessage(err));
      navigate("/incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await incidentApi.updateStatus(id, {
        status: newStatus,
        ...(note.trim() && { resolutionNote: note.trim() }),
      });
      setTicket(updated);
      toast.success("Đã cập nhật trạng thái");
      setNote("");
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <>
        <Topbar title="Chi tiết sự cố" />
        <div className="p-6">
          <Loader />
        </div>
      </>
    );
  if (!ticket) return null;

  return (
    <>
      <Topbar
        title={`Sự cố #${ticket.id}`}
        subtitle={CATEGORY_LABELS[ticket.category] || ticket.category}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-body">
            <Link
              to="/incidents"
              className="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Quay lại
            </Link>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Sự cố #{ticket.id}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge tone="slate">
                    {CATEGORY_LABELS[ticket.category] || ticket.category}
                  </Badge>
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                Mô tả
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </div>

            {ticket.resolution_note && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <div className="text-xs text-emerald-700 mb-1 font-semibold uppercase tracking-wide">
                  Ghi chú xử lý
                </div>
                <p className="text-sm text-emerald-900 whitespace-pre-wrap">
                  {ticket.resolution_note}
                </p>
              </div>
            )}
          </div>

          {isStaff && ticket.status !== "closed" && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-slate-900">
                  Cập nhật trạng thái
                </h3>
              </div>
              <form className="card-body space-y-4" onSubmit={onUpdateStatus}>
                <div>
                  <label className="label">Trạng thái mới</label>
                  <select
                    className="input"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Ghi chú (tùy chọn)</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Mô tả cách xử lý, kết quả..."
                  />
                </div>
                <button className="btn-primary" disabled={saving}>
                  {saving ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : null}
                  Cập nhật
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card card-body">
            <h3 className="font-semibold text-slate-900 mb-3">Thông tin</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Người báo</dt>
                <dd className="font-medium text-slate-900">
                  {ticket.reporter?.full_name ||
                    ticket.reporter?.username ||
                    "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Phòng</dt>
                <dd className="font-medium text-slate-900">
                  {ticket.lab_room?.room_code || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Máy trạm</dt>
                <dd className="font-medium text-slate-900">
                  {ticket.workstation?.station_code || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Người xử lý</dt>
                <dd className="font-medium text-slate-900">
                  {ticket.assigned_user?.full_name ||
                    ticket.assigned_user?.username ||
                    "Chưa phân công"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Ngày tạo</dt>
                <dd className="font-medium text-slate-900">
                  {fmtDateTime(ticket.created_at)}
                </dd>
              </div>
              {ticket.resolved_at && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Ngày xử lý</dt>
                  <dd className="font-medium text-slate-900">
                    {fmtDateTime(ticket.resolved_at)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
