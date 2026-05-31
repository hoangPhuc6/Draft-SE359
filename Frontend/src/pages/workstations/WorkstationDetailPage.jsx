import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  Monitor,
  Network,
  CalendarPlus,
  Wrench,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import TopBar from "../../components/layout/TopBar";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { workstationApi, reservationApi } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { apiMessage } from "../../lib/api";
import { fromLocalDatetimeInput, toLocalDatetimeInput } from "../../lib/utils";

export default function WorkstationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStaff = user?.role === "lab_staff" || user?.role === "system_admin";

  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await workstationApi.getById(id);
      setWs(data);
    } catch (err) {
      toast.error(apiMessage(err));
      navigate("/workstations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setState = async (newState, force = false) => {
    try {
      const res = await workstationApi.setState(id, newState, force);
      if (res.message?.toLowerCase().includes("upcoming")) {
        if (
          confirm(
            "Có lịch đặt sắp tới. Bạn muốn ép buộc và hủy các lịch này không?",
          )
        ) {
          await workstationApi.setState(id, newState, true);
          toast.success("Đã chuyển trạng thái");
        }
      } else {
        toast.success("Đã chuyển trạng thái");
      }
      load();
    } catch (err) {
      toast.error(apiMessage(err));
    }
  };

  if (loading)
    return (
      <>
        <Topbar title="Máy trạm" />
        <div className="p-6">
          <Loader />
        </div>
      </>
    );
  if (!ws) return null;

  return (
    <>
      <Topbar
        title={`Máy ${ws.station_code}`}
        subtitle={`${ws.lab_room?.room_code} — ${ws.lab_room?.name}`}
        actions={
          <button
            className="btn-primary"
            onClick={() => setReserving(true)}
            disabled={ws.state !== "available"}
          >
            <CalendarPlus size={16} /> Đặt máy
          </button>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-body">
            <Link
              to="/workstations"
              className="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Quay lại danh sách
            </Link>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {ws.station_code}
                </h2>
                <div className="text-sm text-slate-500 mt-0.5">
                  Thuộc{" "}
                  <Link
                    to={`/lab-rooms/${ws.lab_room?.id}`}
                    className="text-brand-600 hover:underline"
                  >
                    {ws.lab_room?.room_code}
                  </Link>
                </div>
              </div>
              <StatusBadge status={ws.state} />
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Spec icon={Cpu} label="CPU" value={ws.cpu || "—"} />
              <Spec
                icon={HardDrive}
                label="RAM"
                value={ws.ram_gb ? `${ws.ram_gb} GB` : "—"}
              />
              <Spec icon={Monitor} label="GPU" value={ws.gpu || "—"} />
              <Spec icon={Network} label="OS" value={ws.os || "—"} />
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500">Địa chỉ IP</div>
                <div className="font-mono text-slate-900">
                  {ws.ip_address || "—"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500">MAC</div>
                <div className="font-mono text-slate-900">
                  {ws.mac_address || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {isStaff && (
            <div className="card card-body">
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={16} className="text-brand-600" />
                <h3 className="font-semibold text-slate-900">
                  Quản lý vận hành
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Chuyển trạng thái máy. Khi chọn "Bảo trì", các lịch đặt sắp tới
                có thể bị ảnh hưởng.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  className="btn-secondary"
                  onClick={() => setState("available")}
                  disabled={ws.state === "available"}
                >
                  Đặt thành "Sẵn sàng"
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setState("maintenance")}
                  disabled={ws.state === "maintenance"}
                >
                  Đưa vào bảo trì
                </button>
              </div>
            </div>
          )}

          <div className="card card-body">
            <h3 className="font-semibold text-slate-900">Đặt máy này</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Yêu cầu sẽ chuyển sang trạng thái chờ duyệt.
            </p>
            <button
              className="btn-primary w-full"
              onClick={() => setReserving(true)}
              disabled={ws.state !== "available"}
            >
              <CalendarPlus size={16} />
              {ws.state === "available" ? "Đặt máy" : "Máy không sẵn sàng"}
            </button>
          </div>
        </div>
      </div>

      {reserving && (
        <ReserveWorkstationModal
          workstationId={ws.id}
          onClose={() => setReserving(false)}
        />
      )}
    </>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white text-brand-600 flex items-center justify-center shadow-sm">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-semibold text-slate-900 text-sm truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function ReserveWorkstationModal({ workstationId, onClose }) {
  const navigate = useNavigate();
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
  const [form, setForm] = useState({
    startTime: toLocalDatetimeInput(inOneHour),
    endTime: toLocalDatetimeInput(
      new Date(inOneHour.getTime() + 60 * 60 * 1000),
    ),
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reservationApi.reserveWorkstation({
        workstationId,
        startTime: fromLocalDatetimeInput(form.startTime),
        endTime: fromLocalDatetimeInput(form.endTime),
      });
      toast.success("Đã gửi yêu cầu đặt máy");
      navigate("/reservations/my");
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Đặt máy trạm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-primary" disabled={saving} onClick={onSubmit}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : null}
            Gửi yêu cầu
          </button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={onSubmit}
      >
        <div>
          <label className="label">Bắt đầu *</label>
          <input
            className="input"
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Kết thúc *</label>
          <input
            className="input"
            type="datetime-local"
            required
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
