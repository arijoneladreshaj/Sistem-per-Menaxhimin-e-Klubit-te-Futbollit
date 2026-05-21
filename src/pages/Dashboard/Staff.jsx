import { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../../Components/SideBar";
import api from "../../api/axiosInstance";
import {
  Container, Row, Col, Card, Button, Modal, Form, Badge, Alert
} from "react-bootstrap";
import "./Staff.css";

const API = "http://localhost:5001/api/staff";

const ROLET = [
  "Trajner Kryesor", "Asistent Trajner", "Trajner Portierësh",
  "Fizioterapeut", "Mjek", "Analist", "Skaut", "Menaxher"
];

const emptyForm = {
  club_id: 1,
  user_id: "",
  emri: "",
  mbiemri: "",
  roli: "",
  specializimi: "",
  data_punesimit: "",
  statusi: "Aktiv",
  foto: ""
};

const roliIcon = (roli) => {
  const map = {
    "Trajner Kryesor": "⚽", "Asistent Trajner": "📋",
    "Trajner Portierësh": "🧤", "Fizioterapeut": "💪",
    "Mjek": "🏥", "Analist": "📊", "Skaut": "🔍", "Menaxher": "👔",
  };
  return map[roli] || "👤";
};

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { if (msg) setTimeout(() => setMsg(""), 3000); }, [msg]);

  const fetchStaff = async () => {
    try { const res = await api.get(API); setStaff(res.data); } catch (e) { console.log(e); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setShow(true); };

 const openEdit = (item) => {

  setEditId(item.id);

  setForm({
    club_id: item.club_id || 1,
    user_id: item.user_id || "",

    emri: item.emri || "",
    mbiemri: item.mbiemri || "",

    roli: item.roli || "",

    specializimi:
      item.specializimi || "",

    data_punesimit:
      item.data_punesimit?.split("T")[0] || "",

    statusi:
      item.statusi || "Aktiv",

    foto:
      item.foto || ""
  });

  setShow(true);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
         console.log(form);
      if (editId) await api.put(`${API}/${editId}`, form);
      else await api.post(API, form);
      setShow(false); fetchStaff();
      setMsg(editId ? "U ndryshua me sukses!" : "U shtua me sukses!");
    } catch (e) { console.log(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt?")) return;
    try { await api.delete(`${API}/${id}`); fetchStaff(); setMsg("U fshi me sukses!"); } catch (e) { console.log(e); }
  };

  const filtered = staff.filter((s) =>
    `${s.emri} ${s.mbiemri} ${s.roli}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shell">

    <SideBar active="/staff" />

    <div className="main">

      <Container fluid className="staff-container">
      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="staff-title">Menaxhimi i Stafit</h2>
          <small className="staff-subtitle">Trajnerët, mjekët dhe stafi teknik</small>
        </Col>
        <Col xs="auto">
          <Button className="btn-mu" onClick={openAdd}>+ Shto Staff</Button>
        </Col>
      </Row>

      {msg && <Alert variant="success" dismissible onClose={() => setMsg("")}>{msg}</Alert>}

      {/* Search */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="🔍 Kërko staffin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </Col>
        <Col className="d-flex align-items-center">
          <span className="staff-count">{filtered.length} anëtarë</span>
        </Col>
      </Row>

      {/* Cards */}
      <Row className="g-3">
        {filtered.map((item) => (
          <Col key={item.id} xs={12} sm={6} lg={4} xl={3}>
            <Card className="staff-card h-100">
              <Card.Body className="d-flex flex-column">
                {/* Avatar + Emri */}
                <div className="d-flex align-items-center gap-3 mb-3">
                 <div className="staff-avatar">

  {item.foto ? (

    <img
      src={item.foto}
      alt=""
      className="staff-avatar-img"
    />

  ) : (

    <div className="staff-avatar-placeholder">

      {item.emri?.[0]}
      {item.mbiemri?.[0]}

    </div>

  )}

</div>
                  <div>
                    <h6 className="staff-name mb-0">{item.emri} {item.mbiemri}</h6>
                    <small className="staff-roli">
                      {roliIcon(item.roli)} {item.roli}
                    </small>
                  </div>
                </div>

                {/* Info */}
                <div className="staff-info mb-3">
                  <div className="info-row">
                    <span className="info-label">Specializimi</span>
                    <span className="info-value">{item.specializimi || "-"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Data Punësimit</span>
                    <span className="info-value">
                      {item.data_punesimit ? new Date(item.data_punesimit).toLocaleDateString("sq-AL") : "-"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Statusi</span>
                    <Badge bg={item.statusi === "Aktiv" ? "success" : "secondary"}>
                      {item.statusi}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto d-flex gap-2">
                  <Button size="sm" className="btn-edit flex-fill" onClick={() => openEdit(item)}>
                    ✏️ Ndrysho
                  </Button>
                  <Button size="sm" className="btn-delete flex-fill" onClick={() => handleDelete(item.id)}>
                    🗑️ Fshi
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        {/* Add Card */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="add-card h-100" onClick={openAdd}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="add-icon">+</div>
              <h6 className="add-text">Shto Staff të Ri</h6>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered size="lg" className="staff-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Ndrysho Staffin" : "Shto Staff të Ri"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Emri</Form.Label>
                <Form.Control name="emri" value={form.emri} onChange={handleChange} required placeholder="Emri" />
              </Col>
              <Col md={6}>
                <Form.Label>Mbiemri</Form.Label>
                <Form.Control name="mbiemri" value={form.mbiemri} onChange={handleChange} required placeholder="Mbiemri" />
              </Col>
              <Col md={6}>
                <Form.Label>Roli</Form.Label>
                <Form.Select name="roli" value={form.roli} onChange={handleChange} required>
                  <option value="">Zgjedh rolin</option>
                  {ROLET.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Specializimi</Form.Label>
                <Form.Control name="specializimi" value={form.specializimi} onChange={handleChange} placeholder="p.sh. Taktikë" />
              </Col>
              <Col md={6}>
                <Form.Label>Data Punësimit</Form.Label>
                <Form.Control type="date" name="data_punesimit" value={form.data_punesimit} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label>Statusi</Form.Label>
                <Form.Select name="statusi" value={form.statusi} onChange={handleChange}>
                  <option value="Aktiv">Aktiv</option>
                  <option value="Joaktiv">Joaktiv</option>
                </Form.Select>
              </Col>
              <Col md={12}>
  <Form.Label>Foto e Staffit</Form.Label>

  <Form.Control
    type="file"
    accept="image/*"
    onChange={(e) => {

      const file = e.target.files[0];

      if (!file) return;

      const imageUrl = URL.createObjectURL(file);

      setForm({
        ...form,
        foto: imageUrl
      });
    }}
  />
</Col>

{form.foto && (
  <Col md={12} className="text-center mt-2">

    <img
      src={form.foto}
      alt="preview"
      className="preview-image"
    />

  </Col>
)}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Anulo</Button>
            <Button className="btn-mu" type="submit">{editId ? "Ruaj" : "Shto"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
      </div>
  </div>
  );
}
