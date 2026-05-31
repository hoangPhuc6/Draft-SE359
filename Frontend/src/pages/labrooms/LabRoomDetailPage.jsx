import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  MapPin,
  Monitor,
  CalendarPlus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import TopBar from "../../components/layout/TopBar";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { labRoomApi, reservationApi } from "../../services/authService";
import { apiMessage } from "../../lib/api";
import { fromLocalDatetimeInput, toLocalDatetimeInput } from "../../lib/utils";

export default function LabRoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await labRoomApi.getById(id);
        if (!cancelled) setRoom(data);
      } catch (err) {
        toast.error(apiMessage(err));
        navigate("/lab-rooms");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading)
    return (
      <>
        <Topbar title="Chi tiết phòng" />
        <div className="p-6">
          <Loader />
        </div>
      </>
    );
  if (!room) return null;

  return (
    <>
      <Topbar
        title={`${room.room_code} — ${room.name}`}
        subtitle="Chi tiết và đặt phòng"
        actions={
          <button
            className="btn-primary"
            onClick={() => setReserving(true)}
            disabled={room.status !== "active"}
          >
            <CalendarPlus size={16} /> Đặt phòng
          </button>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-body">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  to="/lab-rooms"
                  className="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Quay lại danh sách
                </Link>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  {room.name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                  <span className="font-mono">{room.room_code}</span>
                  <StatusBadge status={room.status} />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Stat
                icon={Users}
                label="Sức chứa"
                value={`${room.capacity} người`}
              />
              <Stat
                icon={Monitor}
                label="Máy trạm"
                value={`${room.workstation_count}/${room.capacity}`}
              />
              <Stat icon={MapPin} label="Vị trí" value={room.location || "—"} />
            </div>

            {room.description && (
              <p className="mt-5 text-slate-600 text-sm leading-relaxed">
                {room.description}
              </p>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-slate-900">
                Máy trạm trong phòng ({room.workstations?.length || 0})
              </h3>
            </div>
            <div className="card-body p-0">
              {(!room.workstations || room.workstations.length === 0) && (
                <div className="p-6 text-sm text-slate-500 text-center">
                  Phòng chưa có máy trạm.
                </div>
              )}
              {room.workstations && room.workstations.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>CPU / RAM</th>
                        <th>OS</th>
                        <th>Trạng thái</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.workstations.map((w) => (
                        <tr key={w.id}>
                          <td className="font-medium text-slate-900">
                            {w.station_code}
                          </td>
                          <td>
                            <div className="text-sm">{w.cpu || "—"}</div>
                            <div className="text-xs text-slate-500">
                              RAM {w.ram_gb || 0} GB
                            </div>
                          </td>
                          <td>{w.os || "—"}</td>
                          <td>
                            <StatusBadge status={w.state} />
                          </td>
                          <td className="text-right">
                            <Link
                              to={`/workstations/${w.id}`}
                              className="text-sm text-brand-600 hover:underline"
                            >
                              Chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Building2 size={22} />
              </div>
              <div>
                <div className="text-sm text-slate-500">Mã phòng</div>
                <div className="text-lg font-bold text-slate-900">
                  {room.room_code}
                </div>
              </div>
            </div>
            <button
              className="btn-primary w-full mt-5"
              onClick={() => setReserving(true)}
              disabled={room.status !== "active"}
            >
              <CalendarPlus size={16} />
              {room.status === "active"
                ? "Đặt phòng này"
                : "Phòng không khả dụng"}
            </button>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Yêu cầu đặt phòng sẽ chuyển sang trạng thái "Chờ duyệt" và cần
              được nhân viên xác nhận.
            </p>
          </div>
        </div>
      </div>

      {reserving && (
        <ReserveLabRoomModal
          roomId={room.id}
          onClose={() => setReserving(false)}
        />
      )}
    </>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white text-brand-600 flex items-center justify-center shadow-sm">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-semibold text-slate-900 text-sm">{value}</div>
      </div>
    </div>
  );
}

function ReserveLabRoomModal({ roomId, onClose }) {
  const navigate = useNavigate();
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  const [form, setForm] = useState({
    startTime: toLocalDatetimeInput(inOneHour),
    endTime: toLocalDatetimeInput(
      new Date(inOneHour.getTime() + 60 * 60 * 1000),
    ),
    purpose: "",
    expectedUsers: 1,
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reservationApi.reserveRoom({
        labRoomId: roomId,
        startTime: fromLocalDatetimeInput(form.startTime),
        endTime: fromLocalDatetimeInput(form.endTime),
        purpose: form.purpose,
        expectedUsers: parseInt(form.expectedUsers, 10) || 1,
      });
      toast.success("Đã gửi yêu cầu đặt phòng");
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
      title="Đặt phòng lab"
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
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Bắt đầu *</label>
            <input
              type="datetime-local"
              className="input"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Kết thúc *</label>
            <input
              type="datetime-local"
              className="input"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Số người dự kiến</label>
          <input
            type="number"
            min={1}
            className="input"
            value={form.expectedUsers}
            onChange={(e) =>
              setForm({ ...form, expectedUsers: e.target.value })
            }
          />
        </div>
        <div>
          <label className="label">Mục đích sử dụng</label>
          <textarea
            className="input"
            rows={3}
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="Vd: học môn Lập trình hệ thống, làm bài thực hành nhóm..."
          />
        </div>
      </form>
    </Modal>
  );
}
