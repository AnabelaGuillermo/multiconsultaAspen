const BASE_URL = import.meta.env.VITE_DIRECTO_URL || "/api-directo";
const USERNAME = import.meta.env.VITE_DIRECTO_USER || "ASPENMULTICONSULTA";
const PASSWORD = import.meta.env.VITE_DIRECTO_PASS || "DIRECTO10858";

let tokenCache = null;

const mapSexo = (genero) => {
  return String(genero) === "2" ? "3" : "2";
};

const obtenerTokenDirecto = async () => {
  if (tokenCache) return tokenCache;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [Directo Auth] Estado HTTP ${res.status}:`, errorText);
      return null;
    }

    const data = await res.json();
    if (data.token) {
      tokenCache = data.token;
      return tokenCache;
    }
  } catch (error) {
    console.error("❌ [Directo Auth] Error de red o parseo:", error);
  }
  return null;
};

export const obtenerDatosPersonaDirecto = async (dni, genero = "1") => {
  const token = await obtenerTokenDirecto();
  if (!token) return null;

  const sexTypeId = mapSexo(genero);

  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/services/get_by_dni_type?sexTypeId=${sexTypeId}&dni=${dni}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data.names && data.names.length > 0) {
      const persona = data.names[0];
      return `${persona.lastName} ${persona.firstName}`.trim();
    }
  } catch (error) {
    console.error("❌ [Directo GetPersona] Error:", error);
  }
  return null;
};

export const cotizarDirecto = async ({
  dni,
  genero,
  persona,
  politicaDirecto = "1",
  montoFinanciar,
  pendingRequestId = null,
}) => {
  console.group("🚀 --- INICIANDO FLUJO DE COTIZACIÓN CRÉDITO DIRECTO ---");

  try {
    const token = await obtenerTokenDirecto();
    if (!token) throw new Error("No se pudo autenticar con Crédito Directo");

    let requestId = pendingRequestId;
    let maxAmount = null;
    let campaignMsg = "";

    if (!requestId) {
      const sexTypeId = mapSexo(genero);
      const nameFormatted = persona
        ? persona.replace(/\s+/, ",")
        : "CLIENTE,NUEVO";

      const payloadScoring = {
        name: nameFormatted,
        dni: String(dni),
        sexTypeId: String(sexTypeId),
        policyProduct: String(politicaDirecto),
        informedCommerceCode: "000",
      };

      console.log("1️⃣ [Directo Scoring] Enviando payload:", payloadScoring);

      const resScoring = await fetch(`${BASE_URL}/api/v1/services/rating`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadScoring),
      });

      const dataScoring = await resScoring.json();
      console.log("1️⃣ [Directo Scoring] Respuesta:", dataScoring);

      if (
        !resScoring.ok ||
        !dataScoring.offer ||
        dataScoring.offer.length === 0
      ) {
        console.warn(
          "⚠️ [Directo Rechazado / Sin Oferta]:",
          dataScoring.message,
        );
        console.groupEnd();
        return {
          aprobado: false,
          mensaje: dataScoring.message || "Sin oferta disponible",
        };
      }

      const oferta = dataScoring.offer[0];
      maxAmount = oferta.maximumAmount;
      requestId = dataScoring.pendingRequestId;
      campaignMsg = dataScoring.campaignMessage || "";
    }

    const montoACotizar = montoFinanciar ? Number(montoFinanciar) : maxAmount;

    const payloadPlanes = {
      amount: montoACotizar,
      pendingRequestId: String(requestId),
    };

    console.log("2️⃣ [Directo Deadlines] Enviando payload:", payloadPlanes);

    const resPlanes = await fetch(`${BASE_URL}/api/v1/services/deadlines`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadPlanes),
    });

    const dataPlanes = await resPlanes.json();
    console.log("2️⃣ [Directo Deadlines] Respuesta:", dataPlanes);

    console.groupEnd();

    return {
      aprobado: true,
      montoMaximo: maxAmount,
      pendingRequestId: requestId,
      campana: campaignMsg,
      planes: (dataPlanes.deadlines || []).sort(
        (a, b) => a.quantityRate - b.quantityRate,
      ),
    };
  } catch (error) {
    console.error("❌ Error en consulta Crédito Directo:", error);
    console.groupEnd();
    return { aprobado: false, mensaje: "Error al conectar con el servidor" };
  }
};
