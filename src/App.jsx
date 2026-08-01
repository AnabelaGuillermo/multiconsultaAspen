import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [formData, setFormData] = useState({
    producto: '',
    subProducto: '',
    politicaComercial: '',
    tipoVenta: '',
    dni: '',
    persona: '',
    genero: '',
    fechaNacimiento: '',
    telefono: '',
  });

  const [consultaRealizada, setConsultaRealizada] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNuevaConsulta = () => {
    setFormData({
      producto: '',
      subProducto: '',
      politicaComercial: '',
      tipoVenta: '',
      dni: '',
      persona: '',
      genero: '',
      fechaNacimiento: '',
      telefono: '',
    });
    setConsultaRealizada(false);
  };

  return (
    <div className="container my-4 fs-6">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <img
            src="/Logo-Aspen.png"
            alt="Aspen Motos"
            style={{ maxHeight: '60px' }}
          />
        </div>
        <h2 className="fw-bold fs-4 text-dark m-0">FINANCIERAS</h2>
      </div>

      <div className="mb-4">
        <button className="btn btn-nueva-consulta" onClick={handleNuevaConsulta}>
          Nueva consulta
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <h6 className="text-center fw-bold mb-3">Seleccioná las opciones correspondientes</h6>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Producto</label>
            <select
              className="form-select custom-input"
              name="producto"
              value={formData.producto}
              onChange={handleChange}
            >
              <option value="">Seleccionar producto ▼</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Sub Producto</label>
            <select
              className="form-select custom-input"
              name="subProducto"
              value={formData.subProducto}
              onChange={handleChange}
            >
              <option value="">Seleccionar producto ▼</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Política comercial</label>
            <select
              className="form-select custom-input"
              name="politicaComercial"
              value={formData.politicaComercial}
              onChange={handleChange}
            >
              <option value="">Selecciona una política comercial ▼</option>
            </select>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Tipo de venta</label>
            <select
              className="form-select custom-input"
              name="tipoVenta"
              value={formData.tipoVenta}
              onChange={handleChange}
            >
              <option value="">Selecciona el tipo de venta ▼</option>
            </select>
          </div>
        </div>

        <h6 className="text-center fw-bold mb-3">Completá los datos de la persona</h6>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">DNI</label>
            <input
              type="text"
              className="form-control custom-input text-center"
              placeholder="N° de DNI sin puntos"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Selecciona una persona</label>
            <select
              className="form-select custom-input"
              name="persona"
              value={formData.persona}
              onChange={handleChange}
            >
              <option value="">Selecciona una persona ▼</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Género</label>
            <select
              className="form-select custom-input"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
            >
              <option value="">Selecciona el género ▼</option>
            </select>
          </div>
        </div>

        <div className="row g-3 mb-5">
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Fecha de nacimiento</label>
            <input
              type="text"
              className="form-control custom-input text-center"
              placeholder="DD-MM-AAAA"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold w-100 text-center mb-1">Teléfono</label>
            <input
              type="text"
              className="form-control custom-input text-center"
              placeholder="N° de teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>

      {consultaRealizada && (
        <div className="mt-4">
          <div className="bg-resultado-header mb-3">
            Resultado de la consulta
          </div>

          <p className="fw-semibold text-secondary mb-4">
            El DNI XXXXXXXX a nombre de XXXXXXXX XXXXXXXX tiene crédito aprobado.
          </p>

          {[
            { id: 'credicuotas', nombre: 'Credicuotas' },
            { id: 'directo', nombre: 'Directo' },
            { id: 'santander', nombre: 'Santander Consumer' },
            { id: 'rapicompra', nombre: 'RapiCompra' },
            { id: 'creditech', nombre: 'Creditech' },
          ].map((fin) => (
            <div key={fin.id} className="mb-5 pb-3">
              <div className="text-center mb-3">
                <h4 className="fw-bold text-primary">{fin.nombre}</h4>
              </div>

              <div className="row justify-content-center align-items-center mb-3">
                <div className="col-auto">
                  <span className="fw-bold me-2">MÁXIMO APROBADO:</span>
                  <span className="fw-bold fs-5">$ 1.600.000</span>
                </div>
              </div>

              <div className="row justify-content-center align-items-center mb-3">
                <div className="col-md-3 text-md-end">
                  <span className="fw-bold me-2">Calculá el plan de cuotas:</span>
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control custom-input text-center"
                    placeholder="Importe a calcular"
                  />
                </div>
                <div className="col-md-3"></div>
              </div>

              <div className="row g-3 justify-content-center mb-2">
                <div className="col-md-3">
                  <div className="cuota-box">
                    <div>6 cuotas de</div>
                    <div>$ 333.000</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="cuota-box">
                    <div>12 cuotas de</div>
                    <div>$ 222.000</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="cuota-box">
                    <div>24 cuotas de</div>
                    <div>$ 111.000</div>
                  </div>
                </div>
              </div>

              <div className="row g-3 justify-content-center">
                <div className="col-md-3">
                  <div className="cuota-box">
                    <div>36 cuotas de</div>
                    <div>$ 70.000</div>
                  </div>
                </div>
                <div className="col-md-3"></div>
                <div className="col-md-3"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;