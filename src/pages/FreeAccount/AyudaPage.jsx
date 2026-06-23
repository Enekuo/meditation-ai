import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const FAQ = [
  {
    q: "¿Cómo se calculan los porcentajes con activos en distintas divisas?",
    a: "Todos los valores de posición se convierten a tu divisa base (configurable en Ajustes) usando tipos de cambio actualizados diariamente. Así el porcentaje de cada activo refleja su peso real en el patrimonio total, independientemente de en qué divisa cotice.",
  },
  {
    q: "¿Con qué frecuencia se actualizan los precios y tipos de cambio?",
    a: "Los tipos de cambio se descargan automáticamente una vez al día desde una API pública y quedan en caché local. Los precios de las posiciones provienen de los datos que tú introduces o importas desde IBKR; la app no hace scraping de precios en tiempo real.",
  },
  {
    q: "¿Puedo usar la aplicación con cualquier bróker?",
    a: "Sí. Puedes introducir los datos manualmente desde cualquier bróker. La importación automática está optimizada para extractos de IBKR en formato CSV/Flex.",
  },
];

const ASUNTOS = [
  "Problema técnico",
  "Duda sobre mi cartera",
  "Sugerencia de mejora",
  "Otro",
];

const EMPTY_FORM = { nombre: "", email: "", asunto: "", mensaje: "" };

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function AyudaPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.email.trim()) e.email = "El email es obligatorio.";
    else if (!validateEmail(form.email)) e.email = "Introduce un email válido.";
    if (!form.asunto) e.asunto = "Selecciona un asunto.";
    if (!form.mensaje.trim()) e.mensaje = "El mensaje no puede estar vacío.";
    else if (form.mensaje.trim().length < 10) e.mensaje = "El mensaje debe tener al menos 10 caracteres.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    setSubmitting(true);

    // TODO: conectar a backend de envío (email o BD) cuando se decida el método
    setTimeout(() => {
      setSubmitting(false);
      setForm(EMPTY_FORM);
      setErrors({});
      toast({
        title: "Mensaje enviado",
        description: "Te responderemos en menos de 48 horas. ¡Gracias por escribirnos!",
      });
    }, 800);
  };

  const inputBase =
    "w-full rounded-xl border px-3 py-2 text-[13px] outline-none transition-colors " +
    "bg-white dark:bg-gray-800 " +
    "border-[#d9e2f1] dark:border-gray-600 " +
    "text-[#2f3a56] dark:text-gray-100 " +
    "placeholder:text-slate-400 dark:placeholder:text-gray-500 " +
    "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900";

  const errorInput = "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900";

  return (
    <div className="min-h-screen bg-[#f5f7fc] dark:bg-gray-950">
      <div className="max-w-[820px] mx-auto px-6 py-8 space-y-6">

        {/* Título */}
        <div>
          <div className="w-11 h-1 rounded-full bg-blue-500 mb-2" />
          <h1 className="text-[18px] md:text-[19px] font-bold tracking-tight text-[#2f3a56] dark:text-gray-100 uppercase">
            Ayuda
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-gray-400">
            Encuentra respuestas a las preguntas más comunes o escríbenos directamente.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#edf1f7] dark:border-gray-700 bg-[#f9fafc] dark:bg-gray-800">
            <p className="text-[13px] font-bold uppercase tracking-wide text-[#3b455e] dark:text-gray-300">
              Preguntas frecuentes
            </p>
          </div>
          <div className="divide-y divide-[#edf1f7] dark:divide-gray-700">
            {FAQ.map((item, i) => (
              <div key={i} className="px-5 py-4">
                <p className="text-[13px] font-semibold text-[#2f3a56] dark:text-gray-100 mb-1">
                  {item.q}
                </p>
                <p className="text-[13px] text-slate-500 dark:text-gray-400 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario de contacto */}
        <div className="bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#edf1f7] dark:border-gray-700 bg-[#f9fafc] dark:bg-gray-800">
            <p className="text-[13px] font-bold uppercase tracking-wide text-[#3b455e] dark:text-gray-300">
              Contactar con soporte
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-5 py-5 space-y-4">
            {/* Nombre + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={`${inputBase} ${errors.nombre ? errorInput : ""}`}
                />
                {errors.nombre && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`${inputBase} ${errors.email ? errorInput : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">
                Asunto <span className="text-red-400">*</span>
              </label>
              <select
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                className={`${inputBase} ${errors.asunto ? errorInput : ""}`}
              >
                <option value="">Selecciona un asunto…</option>
                {ASUNTOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {errors.asunto && (
                <p className="mt-1 text-[11px] text-red-500">{errors.asunto}</p>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">
                Mensaje <span className="text-red-400">*</span>
              </label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows={5}
                placeholder="Describe tu consulta con el mayor detalle posible…"
                className={`${inputBase} resize-none ${errors.mensaje ? errorInput : ""}`}
              />
              {errors.mensaje && (
                <p className="mt-1 text-[11px] text-red-500">{errors.mensaje}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <p className="text-[11px] text-slate-400 dark:text-gray-500">
                Te responderemos en menos de 48 horas.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-5 rounded-xl bg-[#2f6fed] hover:bg-[#2560d4] disabled:opacity-60 text-white text-[13px] font-semibold transition-colors"
              >
                {submitting ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
