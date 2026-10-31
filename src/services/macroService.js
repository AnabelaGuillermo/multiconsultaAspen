const BASE_URL = import.meta.env.DEV ? "/api-macro" : (import.meta.env.VITE_MACRO_URL || "https://api.onscore.io");
const USERNAME = import.meta.env.VITE_MACRO_USER;
const PASSWORD = import.meta.env.VITE_MACRO_PASS;

let tokenCache = null;

const mapSexoMacro = (genero) => {
  return String(genero) === "2" ? "F" : "M";
};

const obtenerTokenMacro = async () => {
  if (tokenCache) return tokenCache;

  try {
    const res = await fetch(`${BASE_URL}/v1/authentication/login`, {
      method: "POST",
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Tenant": "macro" // Obligatorio para el login[cite: 16]
      },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [Macro Auth] Estado HTTP ${res.status}:`, errorText);
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      tokenCache = data.accessToken;
      return tokenCache;
    }
  } catch (error) {
    console.error("❌ [Macro Auth] Error de red o parseo:", error);
  }
  return null;
};

export const cotizarMacro = async ({
  dni,
  genero,
  persona,
  montoFinanciar,
}) => {
  console.group("🚀 --- INICIANDO FLUJO DE COTIZACIÓN BANCO MACRO ---");

  try {
    const token = await obtenerTokenMacro();
    if (!token) throw new Error("No se pudo autenticar con Banco Macro");

    let firstName = "CLIENTE";
    let lastName = "NUEVO";
    if (persona && persona.includes(",")) {
      const partes = persona.split(",");
      lastName = partes[0].trim();
      firstName = partes[1].trim();
    } else if (persona) {
      firstName = persona;
    }

    const payload = {
      customerId: String(dni),
      customerGender: mapSexoMacro(genero),
      customerFirstName: firstName,
      customerLastName: lastName,
    };

    if (montoFinanciar) {
      payload.requestedAmount = Number(montoFinanciar);
    }

    console.log("📤 [Macro Risk Analysis] Enviando payload:", payload);

    const res = await fetch(`${BASE_URL}/v1/macro/risk-analysis-folders`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Tenant": "macro", // 👈 Vital: requerido también en la consulta de riesgo[cite: 13]
        "Authorization": `Bearer ${token}` // 👈 Token obtenido en el login[cite: 13]
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("📥 [Macro Risk Analysis] Respuesta:", data);
    console.groupEnd();

    if (!res.ok) {
      return {
        aprobado: false,
        mensaje: data.errorCode || "Error en la evaluación de riesgo",
      };
    }

    const aprobado = data.status === "APPROVED";

    return {
      aprobado: aprobado,
      montoMaximo: data.offerMaximumAmount || 0,
      planes: (data.offerSimulations || []).map(sim => ({
        quantityRate: sim.installments,
        amountRate: sim.amount,
        cft: sim.totalFinancialCost,
        tea: sim.effectiveAnnualRate,
      })).sort((a, b) => a.quantityRate - b.quantityRate),
      mensaje: aprobado ? "" : "Sin oferta disponible en Banco Macro",
    };

  } catch (error) {
    console.error("❌ Error en consulta Banco Macro:", error);
    console.groupEnd();
    return { aprobado: false, mensaje: "Error al conectar con el servidor de Macro" };
  }
};