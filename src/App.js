import { useEffect, useState } from "react";

function App() {
  const [screen, setScreen] = useState("login");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    company: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    status: "Nueva",
    followUpDate: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem("mc_leads");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("mc_leads", JSON.stringify(leads));
  }, [leads]);

  const today = new Date().toISOString().split("T")[0];

  const followToday = leads.filter((l) => l.followUpDate === today).length;
  const followOverdue = leads.filter(
    (l) => l.followUpDate && l.followUpDate < today
  ).length;
  const followUpcoming = leads.filter(
    (l) => l.followUpDate && l.followUpDate > today
  ).length;

  function handleLoginChange(e) {
    setLogin({ ...login, [e.target.name]: e.target.value });
  }

  function doLogin() {
    if (login.username === "admin" && login.password === "1234") {
      setScreen("dashboard");
      setLoginError("");
      setLogin({ username: "", password: "" });
    } else {
      setLoginError("Usuario o password incorrecto.");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function clearForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function saveLead() {
    if (!form.company || !form.contact) {
      alert("Poné por lo menos compañía y contacto.");
      return;
    }

    if (editingId) {
      setLeads(
        leads.map((lead) =>
          lead.id === editingId ? { ...lead, ...form } : lead
        )
      );
      clearForm();
      return;
    }

    const newLead = {
      id: Date.now(),
      createdAt: new Date().toLocaleDateString("es-US"),
      ...form,
    };

    setLeads([newLead, ...leads]);
    clearForm();
  }

  function editLead(lead) {
    setEditingId(lead.id);
    setForm({
      company: lead.company || "",
      contact: lead.contact || "",
      email: lead.email || "",
      phone: lead.phone || "",
      address: lead.address || "",
      status: lead.status || "Nueva",
      followUpDate: lead.followUpDate || "",
      notes: lead.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteLead(id) {
    if (window.confirm("¿Seguro que querés borrar este lead?")) {
      setLeads(leads.filter((lead) => lead.id !== id));
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const text = `${lead.company} ${lead.contact} ${lead.email} ${lead.phone} ${lead.address} ${lead.status} ${lead.followUpDate} ${lead.notes}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  function exportCSV() {
    if (leads.length === 0) {
      alert("No hay leads para exportar.");
      return;
    }

    const headers = [
      "Company",
      "Contact",
      "Email",
      "Phone",
      "Address",
      "Status",
      "Follow Up",
      "Notes",
      "Created",
    ];

    const rows = leads.map((lead) => [
      lead.company,
      lead.contact,
      lead.email,
      lead.phone,
      lead.address,
      lead.status,
      lead.followUpDate || "",
      lead.notes,
      lead.createdAt || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((item) => `"${String(item || "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "mc-property-leads.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function followClass(date) {
    if (!date) return "followDate";
    if (date === today) return "dueToday";
    if (date < today) return "overdue";
    return "followDate";
  }

  if (screen === "login") {
    return (
      <>
        <style>{styles}</style>

        <div className="loginScreen">
          <div className="brand">
            <img src="/mc-logo.png" alt="MC Property Solutions" />
            <h1>MC PROPERTY</h1>
            <h2>SOLUTIONS</h2>
          </div>

          <div className="loginBox">
            <h3>WELCOME BACK</h3>
            <p>Sign in to your CRM</p>

            <div className="inputRow">
              <span>👤</span>
              <input
                name="username"
                value={login.username}
                onChange={handleLoginChange}
                placeholder="Username"
              />
            </div>

            <div className="inputRow">
              <span>🔒</span>
              <input
                name="password"
                value={login.password}
                onChange={handleLoginChange}
                type="password"
                placeholder="Password"
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
              />
            </div>

            {loginError && <p className="error">{loginError}</p>}

            <button className="goldBtn" onClick={doLogin}>
              LOGIN
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard">
        <aside className="sidebar">
          <img src="/mc-logo.png" alt="MC Logo" />
          <h2>MC PROPERTY</h2>
          <p>SOLUTIONS</p>

          <button>🏠 Dashboard</button>
          <button>👥 Leads</button>
          <button>🔔 Follow Ups</button>
          <button onClick={exportCSV}>📤 Exportar CSV</button>

          <button className="logout" onClick={() => setScreen("login")}>
            🚪 Cerrar Sesión
          </button>
        </aside>

        <main className="main">
          <header>
            <h1>BIENVENIDO, MC PROPERTY</h1>
            <span>
              📅{" "}
              {new Date().toLocaleDateString("es-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </header>

          {(followToday > 0 || followOverdue > 0) && (
            <div className="alertBanner">
              🔔 Tenés {followToday} follow-up para hoy y {followOverdue} vencido(s).
            </div>
          )}

          <section className="stats">
            <div>
              <b>NUEVOS</b>
              <strong>{leads.filter((l) => l.status === "Nueva").length}</strong>
            </div>
            <div>
              <b>SEGUIMIENTO</b>
              <strong>{leads.filter((l) => l.status === "En Seguimiento").length}</strong>
            </div>
            <div>
              <b>CERRADOS</b>
              <strong>{leads.filter((l) => l.status === "Cerrado").length}</strong>
            </div>
            <div>
              <b>TOTAL</b>
              <strong>{leads.length}</strong>
            </div>
          </section>

          <section className="stats followStats">
            <div>
              <b>FOLLOW-UP HOY</b>
              <strong>{followToday}</strong>
            </div>
            <div>
              <b>VENCIDOS</b>
              <strong>{followOverdue}</strong>
            </div>
            <div>
              <b>PRÓXIMOS</b>
              <strong>{followUpcoming}</strong>
            </div>
            <div>
              <b>SIN FECHA</b>
              <strong>{leads.filter((l) => !l.followUpDate).length}</strong>
            </div>
          </section>

          <section className="formBox">
            <h2>{editingId ? "EDITAR LEAD" : "AGREGAR LEAD"}</h2>

            <div className="grid">
              <input name="company" value={form.company} onChange={handleChange} placeholder="Nombre de Compañía" />
              <input name="contact" value={form.contact} onChange={handleChange} placeholder="Nombre del Contacto" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Dirección" />

              <select name="status" value={form.status} onChange={handleChange}>
                <option>Nueva</option>
                <option>En Seguimiento</option>
                <option>Cerrado</option>
              </select>

              <input name="followUpDate" value={form.followUpDate} onChange={handleChange} type="date" />
            </div>

            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notas"></textarea>

            <div className="actions">
              <button className="goldBtn" onClick={saveLead}>
                {editingId ? "✅ ACTUALIZAR LEAD" : "💾 GUARDAR LEAD"}
              </button>
              <button className="darkBtn" onClick={clearForm}>
                🔄 LIMPIAR
              </button>
            </div>
          </section>

          <section className="tableBox">
            <div className="tableTop">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por compañía, contacto, email, teléfono, follow-up o notas..."
              />
              <button className="goldBtn" onClick={exportCSV}>
                📤 EXPORTAR CSV
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>COMPAÑÍA</th>
                  <th>CONTACTO</th>
                  <th>EMAIL</th>
                  <th>TELÉFONO</th>
                  <th>DIRECCIÓN</th>
                  <th>ESTADO</th>
                  <th>FOLLOW-UP</th>
                  <th>NOTAS</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="9">No hay leads encontrados.</td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.company}</td>
                      <td>{lead.contact}</td>
                      <td>
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="link">
                            {lead.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="link">
                            {lead.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{lead.address}</td>
                      <td><span className="status">{lead.status}</span></td>
                      <td>
                        <span className={followClass(lead.followUpDate)}>
                          {lead.followUpDate || "Sin fecha"}
                        </span>
                      </td>
                      <td>{lead.notes}</td>
                      <td>
                        <button className="edit" onClick={() => editLead(lead)}>✏️</button>
                        <button className="delete" onClick={() => deleteLead(lead.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </>
  );
}

const styles = `
* { box-sizing: border-box; }

body {
  margin: 0;
  background: #02070d;
  font-family: Arial, Helvetica, sans-serif;
}

.loginScreen {
  min-height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top, rgba(255,190,30,.2), transparent 25%),
    linear-gradient(135deg, #02070d, #061726, #02070d);
}

.brand { text-align: center; margin-bottom: 25px; }

.brand img {
  width: 230px;
  filter: drop-shadow(0 0 25px rgba(255,190,40,.8));
}

.brand h1 {
  margin: 5px 0 0;
  font-size: 48px;
  color: #ddd;
  letter-spacing: 3px;
}

.brand h2 {
  margin: 0;
  color: #f6c246;
  letter-spacing: 8px;
}

.loginBox {
  width: 520px;
  max-width: 90%;
  padding: 38px;
  border: 2px solid #c89115;
  border-radius: 24px;
  background: rgba(1, 12, 24, .92);
  text-align: center;
  box-shadow: 0 0 35px rgba(255,183,0,.2);
}

.loginBox h3 {
  color: #f5b51b;
  font-size: 32px;
  margin: 0;
}

.loginBox p {
  color: #d6d6d6;
}

.error {
  color: #ff6b6b !important;
  font-weight: bold;
}

.inputRow {
  display: flex;
  align-items: center;
  height: 60px;
  border: 2px solid #b57912;
  border-radius: 8px;
  margin-bottom: 18px;
  background: rgba(4,20,35,.95);
}

.inputRow span {
  width: 60px;
  font-size: 24px;
}

.inputRow input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 22px;
}

.goldBtn {
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  background: linear-gradient(180deg, #ffd65a, #c78a0d);
  color: #050505;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 0 18px rgba(255,195,40,.25);
}

.darkBtn {
  border: 1px solid #6b7280;
  background: rgba(10,20,35,.8);
  color: white;
  border-radius: 8px;
  padding: 14px 28px;
  cursor: pointer;
}

.dashboard {
  min-height: 100vh;
  display: flex;
  color: white;
  background:
    radial-gradient(circle at top, rgba(0,120,180,.22), transparent 30%),
    linear-gradient(135deg, #02070d, #061726, #02070d);
}

.sidebar {
  width: 260px;
  padding: 28px 20px;
  border-right: 1px solid #b57912;
  background: rgba(0,10,20,.95);
}

.sidebar img {
  width: 150px;
  display: block;
  margin: 0 auto 10px;
}

.sidebar h2,
.sidebar p {
  text-align: center;
  margin: 0;
}

.sidebar p {
  color: #f5b51b;
  letter-spacing: 4px;
  margin-bottom: 35px;
}

.sidebar button {
  width: 100%;
  padding: 15px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,183,0,.35);
  background: transparent;
  color: white;
  text-align: left;
  border-radius: 10px;
  cursor: pointer;
}

.sidebar button:hover {
  background: rgba(255,183,0,.18);
}

.logout { margin-top: 80px; }

.main {
  flex: 1;
  padding: 30px;
  overflow-x: auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header span {
  color: #f5b51b;
  font-weight: bold;
}

.alertBanner {
  margin-top: 18px;
  padding: 18px 22px;
  border: 1px solid #ff6b6b;
  border-radius: 14px;
  background: rgba(127, 29, 29, 0.45);
  color: #ffd1d1;
  font-weight: 900;
  box-shadow: 0 0 25px rgba(255, 80, 80, 0.25);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin: 25px 0;
}

.stats div,
.formBox,
.tableBox {
  padding: 22px;
  border: 1px solid #b57912;
  border-radius: 14px;
  background: rgba(0,15,30,.85);
  box-shadow: 0 0 20px rgba(0,0,0,.25);
}

.stats b,
.formBox h2 {
  color: #f5b51b;
}

.stats strong {
  display: block;
  font-size: 42px;
  margin-top: 10px;
}

.followStats div:nth-child(1) strong {
  color: #38bdf8;
}

.followStats div:nth-child(2) strong {
  color: #ff6b6b;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

input,
select,
textarea {
  background: rgba(0,10,20,.95);
  border: 1px solid #b57912;
  border-radius: 8px;
  color: white;
  padding: 14px;
  font-size: 15px;
}

textarea {
  width: 100%;
  height: 80px;
  margin-top: 15px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
}

.tableTop {
  display: flex;
  gap: 15px;
  margin-bottom: 18px;
}

.tableTop input { flex: 1; }

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

th {
  color: #f5b51b;
  text-align: left;
  padding: 14px;
  border-bottom: 1px solid #b57912;
}

td {
  padding: 14px;
  border-bottom: 1px solid rgba(181,121,18,.35);
}

.status,
.followDate,
.dueToday,
.overdue {
  border: 1px solid #f5b51b;
  padding: 6px 14px;
  border-radius: 6px;
  color: #f5b51b;
  white-space: nowrap;
}

.dueToday {
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 14px rgba(56,189,248,.35);
}

.overdue {
  border-color: #ff6b6b;
  color: #ff6b6b;
  box-shadow: 0 0 14px rgba(255,107,107,.35);
}

.link {
  color: #38bdf8;
  font-weight: bold;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.edit,
.delete {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-right: 6px;
}

.edit {
  background: #d99a12;
  color: black;
}

.delete {
  background: #b91c1c;
  color: white;
}

@media (max-width: 1000px) {
  .dashboard { flex-direction: column; }
  .sidebar { width: 100%; }
  .stats, .grid { grid-template-columns: 1fr; }
  header { flex-direction: column; align-items: flex-start; }
  .tableTop { flex-direction: column; }
}
`;

export default App;