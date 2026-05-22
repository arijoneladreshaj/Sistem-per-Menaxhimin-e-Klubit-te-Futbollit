import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Lajmet.css";
import { Modal, Form, Button } from "react-bootstrap";
import api from "../api/axiosInstance";
import Navbar from "../Components/NavBar";

const API = "/api/lajme";

const LAJMET_DATA = [
  {
    id: 1,
    kategoria: "TRANSFERIME",
    titulli:
      "Man United konfirmon transferimin e ri për sezonin e ardhshëm",
    pershkrimi:
      "Klubi ka arritur marrëveshje me lojtarin e ri që do t'i bashkohet skuadrës në merkaton e verës.",
    foto:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    data: "12 Maj 2026",
    autori: "Redaksia",
  },

  {
    id: 2,
    kategoria: "NDESHJE",
    titulli:
      "Formacioni i mundshëm kundër Chelsea në Premier League",
    pershkrimi:
      "Trajneri ka folur për formacionin dhe lojtarët e gatshëm.",
    foto:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80",
    data: "11 Maj 2026",
    autori: "Redaksia",
  },
];

const KATEGORITE = [
  "TË GJITHA",
  "TRANSFERIME",
  "NDESHJE",
  "LËNDIME",
  "KLUBI",
  "AKADEMIA",
];

function badgeClass(kategoria) {

  const map = {
    TRANSFERIME: "badge-transferime",
    NDESHJE: "badge-ndeshje",
    "LËNDIME": "badge-lendime",
    KLUBI: "badge-klubi",
    AKADEMIA: "badge-akademia",
  };

  return map[kategoria] || "bg-danger";
}

export default function Lajmet() {

  const [kategoriaAktive, setKategoriaAktive] =
    useState("TË GJITHA");

  const isAdmin = localStorage.getItem("role") === "Admin";

  const [show, setShow] = useState(false);

  const [editId, setEditId] = useState(null);

  const [lajmet, setLajmet] = useState([]);

  const [form, setForm] = useState({
    titulli: "",
    pershkrimi: "",
    kategoria: "",
    foto: "",
    autori: "",
  });

  useEffect(() => {
    fetchLajmet();
  }, []);

  const fetchLajmet = async () => {

    try {

      const res = await api.get(API);

      setLajmet(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openEdit = (lajmi) => {

    setEditId(lajmi.id);

    setForm({
      titulli: lajmi.titulli,
      pershkrimi: lajmi.pershkrimi,
      kategoria: lajmi.kategoria,
      foto: lajmi.foto,
      autori: lajmi.autori,
    });

    setShow(true);
  };

  const handleDelete = async (id) => {

    if (!window.confirm("A je i sigurt?"))
      return;

    try {

      await api.delete(`${API}/${id}`);

      fetchLajmet();

    } catch (err) {

      console.log(err);
    }
  };

  const handleSubmit = async () => {

    try {

      if (editId) {

        await api.put(
          `${API}/${editId}`,
          form
        );

      } else {

        await api.post(
          API,
          form
        );
      }

      await fetchLajmet();

      setShow(false);

      setEditId(null);

      setForm({
        titulli: "",
        pershkrimi: "",
        kategoria: "",
        foto: "",
        autori: "",
      });

    } catch (err) {

      console.log(err);
    }
  };

  const allLajmet = [
    ...lajmet,
    ...LAJMET_DATA,
  ];

  const lajmetFiltruara =
    kategoriaAktive === "TË GJITHA"
      ? allLajmet
      : allLajmet.filter(
          (l) =>
            l.kategoria ===
            kategoriaAktive
        );

  return (
    
        <div className="mu-wrap">
          <Navbar />
    <div className="lajmet-page">
      
     

   
      <div className="lajmet-hero">

        <div className="container">

          <div className="d-flex gap-3 mb-3">

            <span className="lajmet-badge-season badge text-danger bg-white fw-bold">
              SEZONI 2025/26
            </span>

            <span className="text-white-50 small fw-semibold align-self-center">
              LAJMET E FUNDIT
            </span>

          </div>

          <h1 className="text-white m-0">
            LAJMET
          </h1>

        </div>
      </div>

      <div className="border-bottom border-secondary">

        <div className="container">

          <div className="d-flex flex-wrap">

            {KATEGORITE.map((kat) => (

              <button
                key={kat}
                className={`lajmet-tab-btn ${
                  kategoriaAktive === kat
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setKategoriaAktive(kat)
                }
              >
                {kat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-5">

        {/* ADMIN */}
        {isAdmin && (

          <div className="mb-4">

            <button
              className="admin-btn"
              onClick={() => {

                setEditId(null);

                setForm({
                  titulli: "",
                  pershkrimi: "",
                  kategoria: "",
                  foto: "",
                  autori: "",
                });

                setShow(true);
              }}
            >
              Shto Lajm
            </button>

          </div>
        )}
        </div>

        {lajmetFiltruara.length > 0 && (

          <div className="row mb-4">

            <div className="col-12">

              <div className="lajmet-hero-card rounded-3 overflow-hidden position-relative bg-black">

                <img
                  src={lajmetFiltruara[0].foto}
                  alt={lajmetFiltruara[0].titulli}
                  className="w-100 h-100 object-fit-cover"
                />

                <div className="lajmet-overlay position-absolute bottom-0 start-0 end-0 p-4">

                  <span
                    className={`badge ${badgeClass(
                      lajmetFiltruara[0].kategoria
                    )}`}
                  >
                    {lajmetFiltruara[0].kategoria}
                  </span>

                  <h2 className="text-white fw-bold mt-2 mb-1">
                    {lajmetFiltruara[0].titulli}
                  </h2>

                  <p className="text-white-50 small mb-1">
                    {lajmetFiltruara[0].pershkrimi}
                  </p>

                  <small className="text-white-50">
                    {lajmetFiltruara[0].data ||
                      lajmetFiltruara[0].autori}
                  </small>
                  {isAdmin && (

  <div className="d-flex gap-2 mt-3">

    <button
      className="btn btn-warning btn-sm"
      onClick={() =>
        openEdit(lajmetFiltruara[0])
      }
    >
      Edito
    </button>

    <button
      className="btn btn-danger btn-sm"
      onClick={() =>
        handleDelete(
          lajmetFiltruara[0].id
        )
      }
    >
      Fshi
    </button>

  </div>
  
)}

                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">

          {lajmetFiltruara
            .slice(1)
            .map((lajmi) => (

            <div
              key={lajmi.id}
              className="col-md-6 col-lg-4"
            >

              <div className="lajmet-card rounded-3 overflow-hidden h-100">

                <div className="lajmet-card-img overflow-hidden">

                  <img
                    src={lajmi.foto}
                    alt={lajmi.titulli}
                    className="w-100 h-100 object-fit-cover"
                  />

                </div>

                <div className="p-3">

                  <span
                    className={`badge ${badgeClass(
                      lajmi.kategoria
                    )}`}
                  >
                    {lajmi.kategoria}
                  </span>

                  <h5 className="text-white fw-bold mt-2 mb-2">
                    {lajmi.titulli}
                  </h5>

                  <p className="text-white-50 small">
                    {lajmi.pershkrimi}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">

                    <small className="text-white-50">
                      {lajmi.data ||
                        lajmi.autori}
                    </small>

                    <span className="text-danger fw-bold small">
                      LEXO MË SHUMË →
                    </span>

                  </div>

                  {isAdmin && (

                    <div className="d-flex gap-2 mt-3">

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                          openEdit(lajmi)
                        }
                      >
                        Edito
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          handleDelete(lajmi.id)
                        }
                      >
                        Fshi
                      </button>

                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            {editId
              ? "Edito Lajmin"
              : "Shto Lajm"}
          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <Form>

            <Form.Group className="mb-3">

              <Form.Label>
                Titulli
              </Form.Label>

              <Form.Control
                name="titulli"
                value={form.titulli}
                onChange={handleChange}
              />

            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Label>
                Përshkrimi
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={4}
                name="pershkrimi"
                value={form.pershkrimi}
                onChange={handleChange}
              />

            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Label>
                Kategoria
              </Form.Label>

              <Form.Select
                name="kategoria"
                value={form.kategoria}
                onChange={handleChange}
              >

                <option value="">
                  Zgjedh
                </option>

                {KATEGORITE
                  .filter(
                    (k) =>
                      k !== "TË GJITHA"
                  )
                  .map((k) => (

                    <option
                      key={k}
                      value={k}
                    >
                      {k}
                    </option>
                  ))}
              </Form.Select>

            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Label>
                Foto URL
              </Form.Label>

              <Form.Control
                name="foto"
                value={form.foto}
                onChange={handleChange}
              />

            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Label>
                Autori
              </Form.Label>

              <Form.Control
                name="autori"
                value={form.autori}
                onChange={handleChange}
              />

            </Form.Group>

          </Form>
        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() => setShow(false)}
          >
            Mbyll
          </Button>

          <Button
            className="admin-btn"
            onClick={handleSubmit}
          >
            Ruaj
          </Button>

        </Modal.Footer>
      </Modal>
    </div>
  );
}