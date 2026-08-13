import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { obtenerDatosPersona, cotizarCreditech } from './services/creditechService';
import { obtenerDatosPersonaDirecto, cotizarDirecto } from './services/directoService';

const POLITICAS_DIRECTO = [
  { id: '1', nombre: '1 - MOTO' },
  { id: '10', nombre: '10 - HONDA PRODUCTO DE FUERZA' },
  { id: '18', nombre: '18 - CELULARES' },
  { id: '2', nombre: '2 - ARTÍCULOS PARA EL HOGAR' },
  { id: '36', nombre: '36 - PLAN MUNDIAL EXCLUSIVO TV' },
  { id: '51', nombre: '51 - PRODUCTO DE FUERZA' },
  { id: '64', nombre: '64 - CUOTAS SIN INTERÉS' }
];

const App = () => {
  const [formData, setFormData] = useState({
    politicaCreditech: '33',
    politicaDirecto: '1',
    dni: '',
    persona: '',
    genero: '1',
  });

  const [montoCreditech, setMontoCreditech] = useState('');
  const [montoDirecto, setMontoDirecto] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingCreditech, setLoadingCreditech] = useState(false);
  const [loadingDirecto, setLoadingDirecto] = useState(false);
  const [buscandoPersona, setBuscandoPersona] = useState(false);
  const [consultaRealizada, setConsultaRealizada] = useState(false);
  const [resultados, setResultados] = useState({ creditech: null, directo: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConsultaRealizada(false);
    setResultados({ creditech: null, directo: null });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDniChange = (e) => {
    const valorLimpio = e.target.value.replace(/\D/g, '');
    setConsultaRealizada(false);
    setResultados({ creditech: null, directo: null });
    setMontoCreditech('');
    setMontoDirecto('');

    setFormData((prev) => ({
      ...prev,
      dni: valorLimpio,
      persona: ''
    }));

    if (valorLimpio.length >= 7) {
      buscarNombreMulticonsulta(valorLimpio, formData.genero);
    }
  };

  const buscarNombreMulticonsulta = async (dniVal, generoVal) => {
    if (!dniVal || dniVal.length < 7) return;
    setBuscandoPersona(true);
    let nombreFinal = null;

    try {
      const resCreditech = await obtenerDatosPersona(dniVal, generoVal);
      if (resCreditech) {
        const rawNombre = resCreditech.ApellidoYNombre || 
                          (Array.isArray(resCreditech.Nombre) ? resCreditech.Nombre[0] : resCreditech.Nombre);
        if (rawNombre && typeof rawNombre === 'string' && rawNombre.trim() !== '') {
          nombreFinal = rawNombre.trim();
        }
      }
    } catch (err) {
      console.warn('⚠️ Creditech no trajo nombre, probando Crédito Directo...');
    }

    if (!nombreFinal) {
      const resDirecto = await obtenerDatosPersonaDirecto(dniVal, generoVal);
      if (resDirecto && resDirecto.trim() !== '') {
        nombreFinal = resDirecto.trim();
      }
    }

    if (nombreFinal) {
      setFormData((prev) => ({ ...prev, persona: nombreFinal }));
    }
    setBuscandoPersona(false);
  };

  const handleConsultar = async (e) => {
    e.preventDefault();
    if (!formData.dni) return;

    setLoading(true);

    const [resCreditech, resDirecto] = await Promise.all([
      cotizarCreditech({ ...formData, montoFinanciar: '' }),
      cotizarDirecto({ ...formData, montoFinanciar: '' })
    ]);

    if (resCreditech?.aprobado) setMontoCreditech(resCreditech.montoMaximo);
    if (resDirecto?.aprobado) setMontoDirecto(resDirecto.montoMaximo);

    setResultados({ creditech: resCreditech, directo: resDirecto });
    setConsultaRealizada(true);
    setLoading(false);
  };

  const recalcularCreditech = async () => {
    if (!montoCreditech) return;
    setLoadingCreditech(true);
    const res = await cotizarCreditech({ ...formData, montoFinanciar: montoCreditech });
    setResultados((prev) => ({ ...prev, creditech: res }));
    setLoadingCreditech(false);
  };

const recalcularDirecto = async () => {
  if (!montoDirecto) return;
  setLoadingDirecto(true);
  
  const res = await cotizarDirecto({ 
    ...formData, 
    montoFinanciar: montoDirecto,
    pendingRequestId: resultados.directo?.pendingRequestId
  });

  setResultados((prev) => ({
    ...prev,
    directo: {
      ...res,
      montoMaximo: res.montoMaximo || prev.directo?.montoMaximo,
      campana: res.campana || prev.directo?.campana,
    }
  }));
  
  setLoadingDirecto(false);
};

  return (
    <div className="container my-4 fs-6">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <img src="/Logo-Aspen.png" alt="Aspen Motos" style={{ maxHeight: '60px' }} />
        <h2 className="fw-bold fs-4 text-dark m-0">MULTICONSULTA ASPEN</h2>
      </div>

      <form onSubmit={handleConsultar}>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Política Creditech</label>
            <input type="text" className="form-control" value="POLÍTICA 33" disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Política Crédito Directo</label>
            <select 
              className="form-select custom-input" 
              name="politicaDirecto" 
              value={formData.politicaDirecto} 
              onChange={handleChange}
            >
              {POLITICAS_DIRECTO.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label fw-bold">DNI</label>
            <input
              type="text"
              className="form-control text-center"
              name="dni"
              value={formData.dni}
              onChange={handleDniChange}
              maxLength={8}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">Género</label>
            <select className="form-select" name="genero" value={formData.genero} onChange={handleChange}>
              <option value="1">Masculino</option>
              <option value="2">Femenino</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">Nombre y Apellido</label>
            <input
              type="text"
              className="form-control text-center"
              placeholder={buscandoPersona ? "Buscando..." : "Nombre y Apellido"}
              name="persona"
              value={formData.persona}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="text-center mb-4">
          <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={loading}>
            {loading ? 'Consultando Financieras...' : 'Consultar Créditos'}
          </button>
        </div>
      </form>

      {consultaRealizada && (
        <div className="row g-4 mt-2">
          <div className="col-md-6">
            <div className="card shadow-sm h-100 p-3">
              <h5 className="fw-bold text-center text-primary mb-3">CREDITECH</h5>
              {resultados.creditech?.aprobado ? (
                <div>
                  <div className="alert alert-success text-center py-2 mb-3">
                    <span className="small text-muted d-block">Monto Máximo Aprobado</span>
                    <strong className="fs-5">${resultados.creditech.montoMaximo.toLocaleString()}</strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Monto a Cotizar:</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control fw-bold"
                        value={montoCreditech}
                        onChange={(e) => setMontoCreditech(e.target.value)}
                        placeholder="Ingrese monto"
                      />
                      <button 
                        className="btn btn-outline-primary fw-bold" 
                        onClick={recalcularCreditech}
                        disabled={loadingCreditech}
                      >
                        {loadingCreditech ? '...' : 'Recalcular'}
                      </button>
                    </div>
                  </div>

                  <div className="row g-2">
                    {resultados.creditech.cuotas.map((c, i) => (
                      <div key={i} className="col-6">
                        <div className="p-2 border rounded bg-light text-center">
                          {c.CantidadCuotas} cuotas de <strong>${c.Monto?.toLocaleString()}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-danger fw-bold py-4">No Aprobado / Sin crédito</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100 p-3">
              <h5 className="fw-bold text-center text-danger mb-3">CRÉDITO DIRECTO</h5>
              {resultados.directo?.aprobado ? (
                <div>
                  <div className="alert alert-success text-center py-2 mb-2">
                    <span className="small text-muted d-block">Monto Máximo Aprobado</span>
                    <strong className="fs-5">${resultados.directo.montoMaximo.toLocaleString()}</strong>
                  </div>

                  {resultados.directo.campana && (
                    <div className="text-center mb-2">
                      <span className="badge bg-warning text-dark">{resultados.directo.campana}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Monto a Cotizar:</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control fw-bold"
                        value={montoDirecto}
                        onChange={(e) => setMontoDirecto(e.target.value)}
                        placeholder="Ingrese monto"
                      />
                      <button 
                        className="btn btn-outline-danger fw-bold" 
                        onClick={recalcularDirecto}
                        disabled={loadingDirecto}
                      >
                        {loadingDirecto ? '...' : 'Recalcular'}
                      </button>
                    </div>
                  </div>

                  <div className="row g-2">
                    {resultados.directo.planes.map((p, i) => (
                      <div key={i} className="col-6">
                        <div className="p-2 border rounded bg-light text-center">
                          {p.quantityRate} cuotas de <strong>${p.amountRate?.toLocaleString()}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-danger fw-bold py-4">
                  {resultados.directo?.mensaje || 'No Aprobado / Sin crédito'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;