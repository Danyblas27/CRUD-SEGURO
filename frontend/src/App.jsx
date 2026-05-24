import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const API = "/api";

// ─── API HELPERS ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en la solicitud");
  return data;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    music: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    box: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    warn: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  };
  return icons[name] || null;
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1209;
    --parchment: #faf6ee;
    --cream: #f2ead8;
    --gold: #c9963a;
    --gold-light: #e8b96a;
    --gold-dark: #8a6420;
    --wine: #7c2d3e;
    --wine-light: #a84057;
    --sage: #4a6741;
    --smoke: #8a7f6e;
    --border: #ddd3be;
    --shadow: rgba(26,18,9,0.12);
    --radius: 12px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--parchment); color: var(--ink); }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── LOGIN ── */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1a1209 0%, #3d2a0e 50%, #1a1209 100%);
    position: relative; overflow: hidden;
  }
  .login-bg {
    position: absolute; inset: 0; opacity: 0.04;
    background-image: repeating-linear-gradient(45deg, #c9963a 0, #c9963a 1px, transparent 0, transparent 50%);
    background-size: 20px 20px;
  }
  .login-card {
    background: var(--parchment); border-radius: 20px; padding: 48px 44px;
    width: 100%; max-width: 400px; position: relative; z-index: 1;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
    border: 1px solid rgba(201,150,58,0.3);
  }
  .login-logo { text-align: center; margin-bottom: 32px; }
  .login-logo-icon {
    width: 64px; height: 64px; border-radius: 16px;
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    display: inline-flex; align-items: center; justify-content: center;
    color: #fff; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(201,150,58,0.4);
  }
  .login-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: var(--ink); }
  .login-sub { font-size: 13px; color: var(--smoke); margin-top: 4px; letter-spacing: 0.05em; text-transform: uppercase; }
  .field { margin-bottom: 18px; }
  .field label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--smoke); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .field input {
    width: 100%; padding: 12px 16px; border-radius: 10px;
    border: 1.5px solid var(--border); background: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: var(--ink);
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .field input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,150,58,0.15); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 20px; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    transition: all 0.2s; text-decoration: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    color: #fff; width: 100%; padding: 14px;
    box-shadow: 0 4px 16px rgba(201,150,58,0.35);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,150,58,0.45); }
  .btn-danger { background: #fef2f2; color: var(--wine); border: 1.5px solid #fecaca; }
  .btn-danger:hover { background: var(--wine); color: #fff; }
  .btn-ghost { background: transparent; color: var(--smoke); border: 1.5px solid var(--border); }
  .btn-ghost:hover { background: var(--cream); color: var(--ink); }
  .btn-sm { padding: 7px 12px; font-size: 13px; border-radius: 8px; }
  .error-msg { background: #fef2f2; border: 1px solid #fecaca; color: var(--wine); border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

  /* ── HEADER ── */
  .header {
    background: linear-gradient(90deg, #1a1209, #3d2a0e);
    padding: 0 32px; height: 64px; display: flex; align-items: center;
    justify-content: space-between; border-bottom: 1px solid rgba(201,150,58,0.2);
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 16px rgba(0,0,0,0.3);
  }
  .header-brand { display: flex; align-items: center; gap: 12px; }
  .header-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    display: flex; align-items: center; justify-content: center; color: #fff;
  }
  .header-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }
  .header-sub { font-size: 11px; color: rgba(201,150,58,0.7); text-transform: uppercase; letter-spacing: 0.1em; }
  .header-user { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.7); font-size: 13px; }
  .header-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(201,150,58,0.2); border: 1.5px solid rgba(201,150,58,0.4);
    display: flex; align-items: center; justify-content: center; color: var(--gold);
  }
  .btn-logout { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); }
  .btn-logout:hover { background: rgba(255,255,255,0.15); color: #fff; }

  /* ── MAIN ── */
  .main { flex: 1; padding: 32px; max-width: 1280px; margin: 0 auto; width: 100%; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
  .page-sub { color: var(--smoke); font-size: 14px; margin-bottom: 28px; }

  /* ── STATS ── */
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: #fff; border-radius: var(--radius); padding: 20px 22px;
    border: 1px solid var(--border); position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold));
  }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--ink); }
  .stat-label { font-size: 12px; color: var(--smoke); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

  /* ── TOOLBAR ── */
  .toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .search-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--smoke); pointer-events: none; }
  .search-input {
    width: 100%; padding: 10px 12px 10px 38px; border-radius: 10px;
    border: 1.5px solid var(--border); background: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,150,58,0.15); }
  .select-filter {
    padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border);
    background: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: var(--ink); outline: none; cursor: pointer; min-width: 140px;
  }
  .select-filter:focus { border-color: var(--gold); }
  .btn-add {
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    color: #fff; box-shadow: 0 4px 12px rgba(201,150,58,0.3); white-space: nowrap;
  }
  .btn-add:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(201,150,58,0.4); }

  /* ── TABLE ── */
  .table-wrap { background: #fff; border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; box-shadow: 0 2px 12px var(--shadow); }
  table { width: 100%; border-collapse: collapse; }
  th {
    background: var(--cream); padding: 12px 16px; text-align: left;
    font-size: 11px; font-weight: 600; color: var(--smoke);
    text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 1px solid var(--border);
  }
  td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--parchment); }
  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600;
  }
  .badge-cat { background: #f0eaff; color: #6b21a8; }
  .badge-low { background: #fef2f2; color: var(--wine); }
  .badge-ok { background: #f0fdf4; color: var(--sage); }
  .price { font-family: 'Playfair Display', serif; font-weight: 700; color: var(--ink); }
  .actions { display: flex; gap: 6px; }
  .empty-state { text-align: center; padding: 60px 20px; color: var(--smoke); }
  .empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.3; }

  /* ── MODAL ── */
  .overlay {
    position: fixed; inset: 0; background: rgba(26,18,9,0.6); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    backdrop-filter: blur(4px); animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .modal {
    background: var(--parchment); border-radius: 20px; padding: 36px;
    width: 100%; max-width: 520px; position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,0.35); border: 1px solid var(--border);
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; }
  .modal-close { background: none; border: none; cursor: pointer; color: var(--smoke); padding: 4px; border-radius: 6px; }
  .modal-close:hover { background: var(--cream); color: var(--ink); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid .span2 { grid-column: span 2; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 28px; }

  /* ── CONFIRM ── */
  .confirm-modal { max-width: 380px; text-align: center; }
  .confirm-icon { width: 60px; height: 60px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--wine); }
  .confirm-text { color: var(--smoke); font-size: 14px; margin-top: 8px; margin-bottom: 24px; }

  /* ── TOAST ── */
  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 300; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    background: #1a1209; color: #fff; padding: 12px 18px; border-radius: 10px;
    font-size: 14px; display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
    border-left: 3px solid var(--gold);
  }
  .toast.error { border-left-color: var(--wine); }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }

  .loading { display: flex; align-items: center; justify-content: center; padding: 40px; color: var(--smoke); gap: 10px; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
`;

// ─── TOAST ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, add };
}

// ─── PRODUCT FORM ─────────────────────────────────────────────────────────────
function ProductForm({ product, categories, onSave, onClose }) {
  const empty = { name: "", description: "", category: "", price: "", stock: "", unit: "pza" };
  const [form, setForm] = useState(product ? { ...product, price: String(product.price), stock: String(product.stock) } : empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return setError("El nombre es requerido");
    if (!form.price || isNaN(form.price)) return setError("El precio debe ser un número");
    setError(null);
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{product ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button className="modal-close" onClick={onClose}><Icon name="x" /></button>
        </div>
        {error && <div className="error-msg"><Icon name="warn" size={16} />{error}</div>}
        <div className="form-grid">
          <div className="field span2">
            <label>Nombre del producto</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Guitarra Acústica" />
          </div>
          <div className="field span2">
            <label>Descripción</label>
            <input value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Descripción breve..." />
          </div>
          <div className="field">
            <label>Categoría</label>
            <input value={form.category || ""} onChange={e => set("category", e.target.value)} placeholder="Ej: Cuerdas" list="cats" />
            <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="field">
            <label>Unidad</label>
            <input value={form.unit || "pza"} onChange={e => set("unit", e.target.value)} placeholder="pza, set, kg..." />
          </div>
          <div className="field">
            <label>Precio (MXN)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
          </div>
          <div className="field">
            <label>Stock</label>
            <input type="number" min="0" step="1" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ width: "auto" }}>
            {loading ? <span className="spinner" /> : <Icon name="check" />}
            {product ? "Guardar cambios" : "Agregar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ product, onConfirm, onClose }) {
  return (
    <div className="overlay">
      <div className="modal confirm-modal">
        <div className="confirm-icon"><Icon name="trash" size={24} /></div>
        <h2 className="modal-title">¿Eliminar producto?</h2>
        <p className="confirm-text">Se eliminará <strong>{product.name}</strong> permanentemente. Esta acción no se puede deshacer.</p>
        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}><Icon name="trash" size={15} />Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!form.username || !form.password) return setError("Completa todos los campos");
    setError(null); setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onLogin(data.token, data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon"><Icon name="music" size={28} /></div>
          <div className="login-title">Melody's</div>
          <div className="login-sub">Sistema de Inventario</div>
        </div>
        {error && <div className="error-msg"><Icon name="warn" size={16} />{error}</div>}
        <div className="field">
          <label><Icon name="user" size={13} />Usuario</label>
          <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="admin" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div className="field">
          <label><Icon name="lock" size={13} />Contraseña</label>
          <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <span className="spinner" style={{ borderTopColor: "#fff" }} /> : "Iniciar sesión"}
        </button>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--smoke)" }}>
          Demo: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}

// ─── INVENTORY TABLE ──────────────────────────────────────────────────────────
function InventoryTable({ products, onEdit, onDelete }) {
  if (!products.length) return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name="box" size={48} /></div>
      <p style={{ fontSize: 16, fontWeight: 600 }}>No hay productos</p>
      <p style={{ fontSize: 13, marginTop: 6 }}>Agrega tu primer producto con el botón de arriba</p>
    </div>
  );

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Unidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={{ color: "var(--smoke)", fontSize: 12 }}>{p.id}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 12, color: "var(--smoke)", marginTop: 2 }}>{p.description}</div>}
              </td>
              <td>{p.category ? <span className="badge badge-cat">{p.category}</span> : <span style={{ color: "var(--smoke)" }}>—</span>}</td>
              <td><span className="price">${Number(p.price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></td>
              <td>
                <span className={`badge ${p.stock <= 2 ? "badge-low" : "badge-ok"}`}>
                  {p.stock} {p.stock <= 2 ? "⚠ bajo" : ""}
                </span>
              </td>
              <td style={{ color: "var(--smoke)", fontSize: 13 }}>{p.unit}</td>
              <td>
                <div className="actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(p)} title="Editar"><Icon name="edit" size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(p)} title="Eliminar"><Icon name="trash" size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { toasts, add: toast } = useToast();

  const fetch_ = useCallback((path, opts) => apiFetch(path, opts, token), [token]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (catFilter) params.set("category", catFilter);
      const data = await fetch_(`/products?${params}`);
      setProducts(data.products || []);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [fetch_, search, catFilter, toast]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await fetch_("/products/categories");
      setCategories(cats);
    } catch {}
  }, [fetch_]);

  useEffect(() => {
    if (token) { loadProducts(); loadCategories(); }
  }, [token, loadProducts, loadCategories]);

  const handleLogin = (tok, usr) => { setToken(tok); setUser(usr); };
  const handleLogout = () => { setToken(null); setUser(null); setProducts([]); };

  const handleSave = async (form) => {
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    if (editing) {
      await fetch_(`/products/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
      toast("Producto actualizado ✓");
    } else {
      await fetch_("/products", { method: "POST", body: JSON.stringify(payload) });
      toast("Producto agregado ✓");
    }
    setEditing(null);
    await loadProducts();
    await loadCategories();
  };

  const handleDelete = async () => {
    try {
      await fetch_(`/products/${deleting.id}`, { method: "DELETE" });
      toast("Producto eliminado");
      setDeleting(null);
      await loadProducts();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= 2).length;

  if (!token) return (
    <>
      <style>{css}</style>
      <LoginScreen onLogin={handleLogin} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="header-brand">
            <div className="header-icon"><Icon name="music" size={18} /></div>
            <div>
              <div className="header-name">Melody's</div>
              <div className="header-sub">Inventario</div>
            </div>
          </div>
          <div className="header-user">
            <div className="header-avatar"><Icon name="user" size={15} /></div>
            <span>{user?.username}</span>
            <span style={{ fontSize: 11, background: "rgba(201,150,58,0.2)", color: "var(--gold-light)", padding: "2px 8px", borderRadius: 99 }}>{user?.role}</span>
            <button className="btn btn-logout btn-sm" onClick={handleLogout}><Icon name="logout" size={14} />Salir</button>
          </div>
        </header>

        <main className="main">
          <h1 className="page-title">Inventario General</h1>
          <p className="page-sub">Gestiona los productos de Melody's</p>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">Productos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">Categorías</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${totalValue.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</div>
              <div className="stat-label">Valor total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: lowStock > 0 ? "var(--wine)" : "var(--sage)" }}>{lowStock}</div>
              <div className="stat-label">Stock bajo</div>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon"><Icon name="search" size={15} /></span>
              <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." />
            </div>
            <select className="select-filter" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-add" onClick={() => { setEditing(null); setShowForm(true); }}>
              <Icon name="plus" size={16} />Nuevo producto
            </button>
          </div>

          {loading ? (
            <div className="loading"><span className="spinner" />Cargando...</div>
          ) : (
            <InventoryTable
              products={products}
              onEdit={p => { setEditing(p); setShowForm(true); }}
              onDelete={p => setDeleting(p)}
            />
          )}
        </main>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          product={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}

      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <Icon name={t.type === "error" ? "warn" : "check"} size={15} />
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
