const BASE_URL = import.meta.env.VITE_CREDITECH_URL || "/api-creditech";
const LOGIN = import.meta.env.VITE_CREDITECH_USER;
const CLAVE = import.meta.env.VITE_CREDITECH_PASS;
const ID_COMERCIO = Number(import.meta.env.VITE_CREDITECH_ID_COMERCIO) || 2056;
const ID_POLITICA = Number(import.meta.env.VITE_CREDITECH_ID_POLITICA) || 33;

const LOGIN_INTERFACE = {
  Login: LOGIN,
  Clave: CLAVE,
  Token: "",
};

export const obtenerDatosPersona = async (dni, genero = 1) => {
  const payload = {
    LoginInterface: LOGIN_INTERFACE,
    IdComercio: ID_COMERCIO,
    IdTipoDocumento: 1,
    Documento: Number(dni),
    IdSexo: Number(genero),
  };

  console.log("🔍 [ObtenerNombres] Payload enviado:", payload);

  try {
    const response = await fetch(`${BASE_URL}/api/frontend/ObtenerNombres`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log("✅ [ObtenerNombres] Respuesta recibida:", data);
    return data;
  } catch (error) {
    console.error("❌ [ObtenerNombres] Error en la petición:", error);
    return null;
  }
};

export const cotizarCreditech = async ({
  dni,
  genero,
  persona,
  fechaNacimiento,
  telefono,
}) => {
  console.group("🚀 --- INICIANDO FLUJO DE COTIZACIÓN CREDITECH ---");

  try {
    const payloadLogueo = {
      LoginInterface: LOGIN_INTERFACE,
      Login: LOGIN,
      Clave: CLAVE,
      IdUsuario: 0,
      EsLogin: true,
    };
    console.log("1️⃣ [LogueoUsuario] Enviando payload:", payloadLogueo);

    const resLogueo = await fetch(`${BASE_URL}/api/frontend/LogueoUsuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadLogueo),
    });
    const dataLogueo = await resLogueo.json();
    console.log("1️⃣ [LogueoUsuario] Respuesta:", dataLogueo);

    const realIdUsuario = dataLogueo.IdUsuario || 0;
    const realIdComercio = dataLogueo.IdComercio || ID_COMERCIO;

    console.log(
      `📌 Datos extraídos del Logueo -> IdUsuario: ${realIdUsuario}, IdComercio: ${realIdComercio}`,
    );

    const payloadCalificacion = {
      LoginInterface: LOGIN_INTERFACE,
      IdComercio: realIdComercio,
      IdTipoDocumento: 1,
      Documento: Number(dni),
      IdSexo: Number(genero) || 1,
      ApellidoYNombre: persona || "",
      TelefonoCelular: telefono || "",
      Email: "",
      IdPoliticaComercial: ID_POLITICA,
      idUsuario: realIdUsuario,
      TipoCredito: 0,
      IngresoMensual: 0,
      MontoMaximo: 0,
      FechaNacimiento: fechaNacimiento || "",
      IdSolicitudPendiente: 0,
      CodigoExternoLocalidad: 0,
      CodigoPricing: "",
      MantenerSolicitudesPendientes: true,
      MontoMaximoCuota: 0,
    };
    console.log(
      "2️⃣ [ObtenerCalificacion] Enviando payload:",
      payloadCalificacion,
    );

    const resCalif = await fetch(
      `${BASE_URL}/api/frontend/ObtenerCalificacion`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadCalificacion),
      },
    );
    const dataCalif = await resCalif.json();
    console.log("2️⃣ [ObtenerCalificacion] Respuesta recibida:", dataCalif);

    // Evaluar resultado de calificación
    if (
      !dataCalif ||
      dataCalif.ResultadoInterface?.Resultado !== 1 ||
      !dataCalif.MontoAprobado ||
      dataCalif.MontoAprobado <= 0
    ) {
      console.warn(
        "⚠️ [Calificación Rechazada / Sin Monto]:",
        dataCalif?.ResultadoInterface?.Mensaje,
      );
      console.groupEnd();
      return {
        aprobado: false,
        montoMaximo: 0,
        cuotas: [],
        mensaje: dataCalif?.ResultadoInterface?.Mensaje || "No aprobado",
      };
    }

    console.log(
      `🎉 [Calificación Exitosa] Monto Aprobado: $${dataCalif.MontoAprobado}`,
    );

    const payloadCalculador = {
      LoginInterface: LOGIN_INTERFACE,
      IdSolicitudPendiente: dataCalif.IdSolicitudPendiente || 0,
      ImporteCuota: 0,
      Monto: dataCalif.MontoAprobado,
      IdArticulo: dataCalif.Articulo
        ? dataCalif.Articulo[0]?.IdArticulo || 0
        : 0,
      IdComercio: realIdComercio,
      FechaPrimerVencimiento: new Date().toISOString(),
      CodigoPricing: "",
    };

    console.log(
      "3️⃣ [ObtenerCalculadorCuota] Enviando payload:",
      payloadCalculador,
    );

    const resCuotas = await fetch(
      `${BASE_URL}/api/frontend/ObtenerCalculadorCuota`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadCalculador),
      },
    );
    const dataCuotas = await resCuotas.json();
    console.log("3️⃣ [ObtenerCalculadorCuota] Respuesta recibida:", dataCuotas);

    console.groupEnd();

    return {
      aprobado: true,
      montoMaximo: dataCalif.MontoAprobado,
      idSolicitudPendiente: dataCalif.IdSolicitudPendiente || 0,
      idArticulo: dataCalif.Articulo
        ? dataCalif.Articulo[0]?.IdArticulo || 0
        : 0,
      cuotas: dataCuotas.Cuotas || [],
    };
  } catch (error) {
    console.error("❌ Error general en la consulta Creditech:", error);
    console.groupEnd();
    return { aprobado: false, montoMaximo: 0, cuotas: [] };
  }
};
