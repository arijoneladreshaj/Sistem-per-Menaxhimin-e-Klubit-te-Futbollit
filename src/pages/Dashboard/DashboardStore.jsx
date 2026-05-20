import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API = "http://localhost:5001/store";

const RED = "#cc0000";
const DARK = "#1a0000";
const FONT_H = "'Bebas Neue', sans-serif";
const FONT_B = "'Barlow', sans-serif";

const CATEGORIES = ["Fanella", "Trajnim", "Aksesore", "Memorabilia"];
const SUBCATEGORIES = {
  Fanella: ["Burra", "Gra", "Fëmijë", "Personalizuar"],
  Trajnim: ["Burra", "Gra"],
  Aksesore: ["Aksesore"],
  Memorabilia: ["Memorabilia"],
};

const emptyProduct = {
  name: "",
  category: "Fanella",
  subcategory: "Burra",
  price: "",
  oldPrice: "",
  imageUrl: "",
  badge: "",
  player: "",
  num: "",
  sizes: "S,M,L,XL",
};

/* ─── fonts ─────────────────────────────────────────────────────────────── */
if (!document.getElementById("mu-dash-fonts")) {
  const l = document.createElement("link");
  l.id = "mu-dash-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap";
  document.head.appendChild(l);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT FORM MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
function ProductModal({ product, onSave, onClose, saving }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState(product ? { ...product } : { ...emptyProduct });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Emri është i detyrueshëm";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Çmimi duhet të jetë numër pozitiv";
    if (form.oldPrice && (isNaN(form.oldPrice) || Number(form.oldPrice) <= 0))
      e.oldPrice = "Çmimi i vjetër duhet të jetë numër pozitiv";
    if (!form.sizes.trim()) e.sizes = "Shkruaj së paku një madhësi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      price: parseFloat(form.price),
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
      num: form.num || null,
      player: form.player || null,
      badge: form.badge || null,
    };
    onSave(payload);
  };

  const subs = SUBCATEGORIES[form.category] || [];

  const inputStyle = (field) => ({
    background: "rgba(255,255,255,0.06)",
    border: errors[field]
      ? "1.5px solid #ff4d4d"
      : "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontFamily: FONT_B,
    fontSize: 14,
    borderRadius: 0,
    padding: "10px 14px",
  });

  const labelStyle = {
    fontFamily: FONT_B,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  return (
    <>
      <div
        onClick={onClose}
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.7)", zIndex: 1000 }}
      />
      <div
        className="position-fixed d-flex flex-column"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 1001,
          width: "95%",
          maxWidth: 580,
          maxHeight: "90vh",
          background: DARK,
          border: "1px solid rgba(255,255,255,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{
            background: "rgba(0,0,0,0.45)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i
              className={`bi ${isEdit ? "bi-pencil-square" : "bi-plus-circle"}`}
              style={{ color: "#fff", fontSize: 18 }}
            />
            <span
              style={{
                fontFamily: FONT_H,
                fontSize: 22,
                letterSpacing: 2,
                color: "#fff",
              }}
            >
              {isEdit ? "EDITO PRODUKTIN" : "SHTO PRODUKT TË RI"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn border-0 bg-transparent text-white"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-auto px-4 py-4" style={{ flex: 1 }}>
          {/* Name */}
          <div className="mb-3">
            <label style={labelStyle}>Emri i Produktit</label>
            <input
              className="form-control"
              style={inputStyle("name")}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="p.sh. Home Kit 25/26"
            />
            {errors.name && (
              <small style={{ color: "#ff4d4d", fontSize: 11 }}>
                {errors.name}
              </small>
            )}
          </div>

          {/* Category + Subcategory */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={labelStyle}>Kategoria</label>
              <select
                className="form-select"
                style={inputStyle("category")}
                value={form.category}
                onChange={(e) => {
                  set("category", e.target.value);
                  const newSubs = SUBCATEGORIES[e.target.value] || [];
                  if (!newSubs.includes(form.subcategory))
                    set("subcategory", newSubs[0] || "");
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label style={labelStyle}>Nënkategoria</label>
              <select
                className="form-select"
                style={inputStyle("subcategory")}
                value={form.subcategory}
                onChange={(e) => set("subcategory", e.target.value)}
              >
                {subs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Old Price */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={labelStyle}>Çmimi (€)</label>
              <input
                className="form-control"
                style={inputStyle("price")}
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="89.99"
              />
              {errors.price && (
                <small style={{ color: "#ff4d4d", fontSize: 11 }}>
                  {errors.price}
                </small>
              )}
            </div>
            <div className="col-6">
              <label style={labelStyle}>Çmimi i Vjetër (€)</label>
              <input
                className="form-control"
                style={inputStyle("oldPrice")}
                type="number"
                step="0.01"
                value={form.oldPrice || ""}
                onChange={(e) => set("oldPrice", e.target.value)}
                placeholder="Opsionale"
              />
              {errors.oldPrice && (
                <small style={{ color: "#ff4d4d", fontSize: 11 }}>
                  {errors.oldPrice}
                </small>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="mb-3">
            <label style={labelStyle}>URL e Fotos</label>
            <input
              className="form-control"
              style={inputStyle("imageUrl")}
              value={form.imageUrl || ""}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="/Store/HomeKit.png ose https://..."
            />
          </div>

          {/* Badge + Player + Number */}
          <div className="row g-3 mb-3">
            <div className="col-4">
              <label style={labelStyle}>Badge</label>
              <input
                className="form-control"
                style={inputStyle("badge")}
                value={form.badge || ""}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="I RI"
              />
            </div>
            <div className="col-4">
              <label style={labelStyle}>Lojtari</label>
              <input
                className="form-control"
                style={inputStyle("player")}
                value={form.player || ""}
                onChange={(e) => set("player", e.target.value)}
                placeholder="RASHFORD"
              />
            </div>
            <div className="col-4">
              <label style={labelStyle}>Numri</label>
              <input
                className="form-control"
                style={inputStyle("num")}
                value={form.num || ""}
                onChange={(e) => set("num", e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-3">
            <label style={labelStyle}>
              Madhësitë (ndarë me presje)
            </label>
            <input
              className="form-control"
              style={inputStyle("sizes")}
              value={form.sizes}
              onChange={(e) => set("sizes", e.target.value)}
              placeholder="S,M,L,XL,XXL"
            />
            {errors.sizes && (
              <small style={{ color: "#ff4d4d", fontSize: 11 }}>
                {errors.sizes}
              </small>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 d-flex gap-2"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.45)",
          }}
        >
          <button
            onClick={onClose}
            className="btn flex-fill"
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.6)",
              fontFamily: FONT_B,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1,
              borderRadius: 0,
              padding: "12px 0",
            }}
          >
            ANULO
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn flex-fill fw-bold"
            style={{
              background: "#fff",
              color: RED,
              fontFamily: FONT_H,
              fontSize: 16,
              letterSpacing: 2,
              border: "none",
              borderRadius: 0,
              padding: "12px 0",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                DUKE RUAJTUR...
              </>
            ) : isEdit ? (
              "PËRDITËSO"
            ) : (
              "SHTO PRODUKTIN"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
function DeleteModal({ product, onConfirm, onClose, deleting }) {
  return (
    <>
      <div
        onClick={onClose}
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.7)", zIndex: 1000 }}
      />
      <div
        className="position-fixed p-4"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 1002,
          width: 400,
          background: DARK,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="text-center">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: 64,
              height: 64,
              background: "rgba(255,77,77,0.15)",
            }}
          >
            <i className="bi bi-exclamation-triangle" style={{ fontSize: 28, color: "#ff4d4d" }} />
          </div>
          <h5
            style={{
              fontFamily: FONT_H,
              fontSize: 24,
              color: "#fff",
              letterSpacing: 1,
            }}
          >
            FSHI PRODUKTIN?
          </h5>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontFamily: FONT_B,
              marginBottom: 24,
            }}
          >
            Je i sigurt që dëshiron të fshish{" "}
            <strong style={{ color: "#fff" }}>{product.name}</strong>? Ky veprim
            nuk mund të kthehet.
          </p>
          <div className="d-flex gap-2">
            <button
              onClick={onClose}
              className="btn flex-fill"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.6)",
                fontFamily: FONT_B,
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 0,
                padding: "12px 0",
              }}
            >
              ANULO
            </button>
            <button
              onClick={() => onConfirm(product.id)}
              disabled={deleting}
              className="btn flex-fill fw-bold"
              style={{
                background: "#ff4d4d",
                color: "#fff",
                fontFamily: FONT_H,
                fontSize: 16,
                letterSpacing: 2,
                border: "none",
                borderRadius: 0,
                padding: "12px 0",
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  DUKE FSHIRË...
                </>
              ) : (
                <>
                  <i className="bi bi-trash3 me-2" />
                  FSHI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD STORE (main)
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Të gjitha");

  // modals
  const [modalProduct, setModalProduct] = useState(null); // null=closed, {}=add, {id,...}=edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── FETCH ─────────────────────────────────────────────────────────────── */
  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(API)
      .then((res) => {
        const formatted = res.data.map((p) => ({
          ...p,
          cat: p.category,
          sub: p.subcategory,
          img: p.imageUrl,
          sizes: typeof p.sizes === "string" ? p.sizes : "",
        }));
        setProducts(formatted);
      })
      .catch(() => showToast("Gabim gjatë marrjes së produkteve", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ── CREATE ────────────────────────────────────────────────────────────── */
  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await axios.post(API, data);
      showToast("Produkti u shtua me sukses!");
      setModalProduct(null);
      fetchProducts();
    } catch {
      showToast("Gabim gjatë shtimit", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── UPDATE ────────────────────────────────────────────────────────────── */
  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await axios.put(`${API}/${data.id}`, data);
      showToast("Produkti u përditësua!");
      setModalProduct(null);
      fetchProducts();
    } catch {
      showToast("Gabim gjatë përditësimit", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── DELETE ────────────────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/${id}`);
      showToast("Produkti u fshi!");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      showToast("Gabim gjatë fshirjes", "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ── FILTER ────────────────────────────────────────────────────────────── */
  const filtered = products.filter((p) => {
    const matchCat =
      filterCat === "Të gjitha" || p.cat === filterCat;
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* ── STATS ─────────────────────────────────────────────────────────────── */
  const stats = [
    {
      icon: "bi-box-seam",
      label: "TOTALI",
      value: products.length,
      color: "#fff",
    },
    {
      icon: "bi-tag",
      label: "NË SHITJE",
      value: products.filter((p) => p.oldPrice).length,
      color: "#4ade80",
    },
    {
      icon: "bi-grid",
      label: "KATEGORI",
      value: [...new Set(products.map((p) => p.cat))].length,
      color: "#60a5fa",
    },
    {
      icon: "bi-currency-euro",
      label: "ÇM. MESATAR",
      value:
        products.length > 0
          ? "€" +
            (
              products.reduce((s, p) => s + (parseFloat(p.price) || 0), 0) /
              products.length
            ).toFixed(0)
          : "€0",
      color: "#facc15",
    },
  ];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #2d0000 50%, ${DARK} 100%)`,
        minHeight: "100vh",
        fontFamily: FONT_B,
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(0,0,0,0.5)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between px-4"
          style={{ height: 64 }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
                background: RED,
                borderRadius: 4,
              }}
            >
              <i className="bi bi-shop" style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <span
              style={{
                fontFamily: FONT_H,
                fontSize: 22,
                letterSpacing: 3,
                color: "#fff",
              }}
            >
              DASHBOARD STORE
            </span>
          </div>
          <button
            onClick={() => setModalProduct({})}
            className="btn d-flex align-items-center gap-2"
            style={{
              background: "#fff",
              color: RED,
              fontFamily: FONT_H,
              fontSize: 14,
              letterSpacing: 2,
              border: "none",
              borderRadius: 0,
              padding: "10px 24px",
            }}
          >
            <i className="bi bi-plus-lg" />
            SHTO PRODUKT
          </button>
        </div>
      </div>

      <div className="px-4 py-4" style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <div className="row g-3 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div
                className="p-3 h-100"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className={`bi ${s.icon}`}
                    style={{ color: s.color, fontSize: 16 }}
                  />
                  <span
                    style={{
                      fontFamily: FONT_B,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2,
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONT_H,
                    fontSize: 32,
                    color: s.color,
                    letterSpacing: 1,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ──────────────────────────────────────────────────────── */}
        <div
          className="d-flex flex-wrap align-items-center gap-3 mb-4 p-3"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="d-flex align-items-center gap-2 flex-fill">
            <i
              className="bi bi-search"
              style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}
            />
            <input
              className="form-control border-0"
              style={{
                background: "transparent",
                color: "#fff",
                fontFamily: FONT_B,
                fontSize: 14,
                boxShadow: "none",
              }}
              placeholder="Kërko produkte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex gap-1 flex-wrap">
            {["Të gjitha", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className="btn"
                style={{
                  background:
                    filterCat === cat ? "#fff" : "rgba(255,255,255,0.06)",
                  color: filterCat === cat ? RED : "rgba(255,255,255,0.5)",
                  fontFamily: FONT_B,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 1,
                  borderRadius: 0,
                  border:
                    filterCat === cat
                      ? "1px solid #fff"
                      : "1px solid rgba(255,255,255,0.1)",
                  padding: "6px 16px",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE ─────────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            className="d-none d-md-flex align-items-center px-3 py-2"
            style={{
              background: "rgba(0,0,0,0.3)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {[
              { label: "PRODUKTI", flex: 3 },
              { label: "KATEGORIA", flex: 2 },
              { label: "ÇMIMI", flex: 1 },
              { label: "MADHËSITË", flex: 2 },
              { label: "VEPRIMET", flex: 1.5 },
            ].map((col) => (
              <div
                key={col.label}
                style={{
                  flex: col.flex,
                  fontFamily: FONT_B,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                role="status"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <p
                className="mt-3"
                style={{
                  fontFamily: FONT_H,
                  fontSize: 18,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: 2,
                }}
              >
                DUKE NGARKUAR...
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-5">
              <i
                className="bi bi-inbox"
                style={{ fontSize: 48, color: "rgba(255,255,255,0.15)" }}
              />
              <p
                className="mt-3"
                style={{
                  fontFamily: FONT_H,
                  fontSize: 20,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: 2,
                }}
              >
                ASNJË PRODUKT
              </p>
              <button
                onClick={() => setModalProduct({})}
                className="btn mt-2"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  fontFamily: FONT_B,
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 1,
                  borderRadius: 0,
                  padding: "10px 24px",
                }}
              >
                + SHTO PRODUKTIN E PARË
              </button>
            </div>
          )}

          {/* Rows */}
          {!loading &&
            filtered.map((p) => (
              <div
                key={p.id}
                className="d-flex flex-wrap flex-md-nowrap align-items-center px-3 py-3"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255,255,255,0.03)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Product info */}
                <div
                  className="d-flex align-items-center gap-3"
                  style={{ flex: 3, minWidth: 0 }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 50,
                      height: 50,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    {p.img ? (
                      <img
                        src={p.img}
                        alt={p.name}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <i
                        className="bi bi-image"
                        style={{
                          fontSize: 20,
                          color: "rgba(255,255,255,0.15)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: FONT_H,
                        fontSize: 16,
                        color: "#fff",
                        letterSpacing: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </div>
                    {p.badge && (
                      <span
                        style={{
                          background: RED,
                          color: "#fff",
                          fontSize: 9,
                          fontFamily: FONT_B,
                          fontWeight: 700,
                          letterSpacing: 1,
                          padding: "1px 6px",
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div
                  style={{
                    flex: 2,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: FONT_B,
                    fontWeight: 600,
                  }}
                >
                  <span>{p.cat}</span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      margin: "0 6px",
                    }}
                  >
                    ·
                  </span>
                  <span>{p.sub}</span>
                </div>

                {/* Price */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT_H,
                      fontSize: 18,
                      color: "#fff",
                    }}
                  >
                    €{parseFloat(p.price).toFixed(2)}
                  </div>
                  {p.oldPrice && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.25)",
                        textDecoration: "line-through",
                      }}
                    >
                      €{parseFloat(p.oldPrice).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Sizes */}
                <div
                  className="d-flex flex-wrap gap-1"
                  style={{ flex: 2 }}
                >
                  {(p.sizes || "")
                    .split(",")
                    .filter(Boolean)
                    .map((s) => (
                      <span
                        key={s}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 10,
                          fontFamily: FONT_B,
                          fontWeight: 700,
                          padding: "2px 8px",
                          letterSpacing: 0.5,
                        }}
                      >
                        {s.trim()}
                      </span>
                    ))}
                </div>

                {/* Actions */}
                <div
                  className="d-flex gap-2"
                  style={{ flex: 1.5, justifyContent: "flex-end" }}
                >
                  <button
                    onClick={() =>
                      setModalProduct({
                        ...p,
                        category: p.cat,
                        subcategory: p.sub,
                        imageUrl: p.img,
                      })
                    }
                    className="btn d-flex align-items-center gap-1"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontFamily: FONT_B,
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: 1,
                      borderRadius: 0,
                      padding: "6px 14px",
                    }}
                  >
                    <i className="bi bi-pencil" style={{ fontSize: 12 }} />
                    EDITO
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="btn d-flex align-items-center gap-1"
                    style={{
                      background: "rgba(255,77,77,0.1)",
                      color: "#ff4d4d",
                      border: "1px solid rgba(255,77,77,0.2)",
                      fontFamily: FONT_B,
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: 1,
                      borderRadius: 0,
                      padding: "6px 14px",
                    }}
                  >
                    <i className="bi bi-trash3" style={{ fontSize: 12 }} />
                    FSHI
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mt-3 text-end">
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                fontFamily: FONT_B,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              {filtered.length} nga {products.length} produkte
            </span>
          </div>
        )}
      </div>

      {/* ── MODALS ───────────────────────────────────────────────────────── */}
      {modalProduct !== null && (
        <ProductModal
          product={modalProduct.id ? modalProduct : null}
          onSave={modalProduct.id ? handleUpdate : handleCreate}
          onClose={() => setModalProduct(null)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* ── TOAST ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="position-fixed d-flex align-items-center gap-3"
          style={{
            bottom: 24,
            right: 24,
            background: DARK,
            border: "1px solid rgba(255,255,255,0.12)",
            borderLeft: `4px solid ${
              toast.type === "error" ? "#ff4d4d" : "#4ade80"
            }`,
            padding: "14px 18px",
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <i
            className={`bi ${
              toast.type === "error"
                ? "bi-exclamation-circle-fill"
                : "bi-check-circle-fill"
            }`}
            style={{
              color: toast.type === "error" ? "#ff4d4d" : "#4ade80",
              fontSize: 18,
            }}
          />
          <span
            style={{
              color: "#fff",
              fontSize: 13,
              fontFamily: FONT_B,
              fontWeight: 600,
            }}
          >
            {toast.msg}
          </span>
        </div>
      )}
    </div>
  );
}
