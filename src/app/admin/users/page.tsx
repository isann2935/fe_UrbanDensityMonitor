"use client";
// src/app/admin/users/page.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/presentation/components/PageLayout";
import { userService } from "@/infrastructure/services/userService";
import { useAuth } from "@/presentation/components/AuthProvider";
import type { UserRecord, UserRole } from "@/domain/entities/TrafficMetric";
import {
  Users,
  Edit2,
  Trash2,
  Shield,
  User,
  Loader2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Check,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

function UserModal({
  initial,
  onClose,
  onSave,
  loading,
  isEdit,
}: {
  initial?: UserRecord | null;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  loading: boolean;
  isEdit: boolean;
}) {
  const [form, setForm] = useState<UserFormData>({
    email: initial?.email ?? "",
    full_name: initial?.full_name ?? "",
    password: "",
    role: initial?.role ?? "user",
    is_active: initial?.is_active ?? true,
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.full_name.trim().length === 0) {
      setError("Full name is required.");
      return;
    }
    if (form.full_name.trim().length > 100) {
      setError("Full name max 100 chars.");
      return;
    }
    if (!isEdit && form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await onSave(form);
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#171717] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">
            {isEdit ? "Edit User Account" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-status-danger/10 border border-status-danger/20 text-status-danger p-3 rounded-lg text-xs">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              maxLength={100}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              readOnly={isEdit}
              className={`w-full border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent transition-all font-mono ${
                isEdit
                  ? "bg-white/[0.02] border-white/[0.05] text-secondary cursor-not-allowed"
                  : "bg-white/[0.04] border-white/[0.08]"
              }`}
              required
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 pr-10 py-2 text-sm text-white focus:outline-none focus:border-accent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
              Role
            </label>
            <div className="flex gap-2">
              {(["user", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all capitalize ${
                    form.role === r
                      ? r === "admin"
                        ? "bg-accent/15 border-accent/40 text-accent"
                        : "bg-blue-500/15 border-blue-500/40 text-blue-400"
                      : "bg-white/[0.04] border-white/[0.08] text-secondary hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {r === "admin" ? <Shield size={13} /> : <User size={13} />}
                  <span>{r}</span>
                </button>
              ))}
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div>
                <p className="text-xs font-medium text-white">Account Status</p>
                <p className="text-[11px] text-secondary mt-0.5">
                  {form.is_active ? "Active — user can access dashboard" : "Inactive — access restricted"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`transition-colors ${
                  form.is_active ? "text-accent" : "text-secondary"
                }`}
              >
                {form.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/[0.08] text-xs font-medium text-secondary hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent hover:bg-accent-hover text-xs font-semibold text-black transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Check size={14} />
                  <span>{isEdit ? "Save Changes" : "Create User"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: UserRecord;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#171717] border border-white/[0.08] rounded-2xl p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-xl bg-status-danger/10 border border-status-danger/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-status-danger" />
        </div>
        <h2 className="text-base font-bold text-white mb-2">Delete User Account</h2>
        <p className="text-xs text-secondary mb-2 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <span className="text-white font-semibold">{user.full_name}</span>?
        </p>
        <p className="text-[11px] text-status-danger/80 mb-6">
          This user will be removed from Supabase Auth and database records.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/[0.08] text-xs font-medium text-secondary hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-status-danger/20 border border-status-danger/40 text-xs font-semibold text-status-danger hover:bg-status-danger/30 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    if (!authLoading && role !== null && role !== "admin") {
      router.replace("/");
    }
  }, [role, authLoading, router]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role, fetchUsers]);

  const handleEdit = async (form: UserFormData) => {
    if (!editUser) return;
    setActionLoading(true);
    try {
      await userService.updateUser(editUser.id, {
        full_name: form.full_name,
        role: form.role,
        is_active: form.is_active,
      });
      setEditUser(null);
      await fetchUsers();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(deleteUser.id);
      setDeleteUser(null);
      await fetchUsers();
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || role === null) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      </PageLayout>
    );
  }

  if (role !== "admin") return null;

  return (
    <PageLayout>
      {editUser && (
        <UserModal
          initial={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleEdit}
          loading={actionLoading}
          isEdit={true}
        />
      )}
      {deleteUser && (
        <DeleteConfirm
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight">
                User Management
              </h1>
              <span className="px-2 py-0.5 rounded-lg bg-accent/15 border border-accent/30 text-[10px] font-mono font-bold text-accent">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-secondary mt-1">
              View, edit roles, and manage user accounts with Supabase Auth sync.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: users.length, color: "text-white" },
            {
              label: "Admins",
              value: users.filter((u) => u.role === "admin").length,
              color: "text-accent",
            },
            {
              label: "Active",
              value: users.filter((u) => u.is_active).length,
              color: "text-emerald-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#171717] border border-white/[0.08] rounded-xl p-4 card-interactive"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-status-danger/10 border border-status-danger/20 text-status-danger p-3 rounded-lg text-xs">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        )}

        {!isLoading && users.length === 0 && !error && (
          <div className="text-center py-16 bg-[#171717] border border-white/[0.08] rounded-2xl">
            <Users size={32} className="text-secondary/40 mx-auto mb-3" />
            <p className="text-white text-sm font-semibold">No users found</p>
          </div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="bg-[#171717] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-black/20">
                    {["Name", "Email", "Role", "Status", "Joined", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-accent">
                              {u.full_name.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-semibold text-white">{u.full_name || "—"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-secondary font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold capitalize ${
                            u.role === "admin"
                              ? "bg-accent/15 text-accent border-accent/30"
                              : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {u.role === "admin" ? <Shield size={11} /> : <User size={11} />}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${
                            u.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-white/5 text-secondary border-white/10"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-secondary font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditUser(u)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary hover:text-white hover:bg-white/[0.04] transition-all"
                            title="Edit user"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary hover:text-status-danger hover:bg-status-danger/10 transition-all"
                            title="Delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
