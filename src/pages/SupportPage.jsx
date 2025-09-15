import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "@/lib/i18n";

const SupportPage = () => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honey: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (form.honey) return;
    const to = "support@meditation.ai";
    const subject = encodeURIComponent(
      `[Meditation.AI] ${form.subject || t("supportPage.form.subject_placeholder")}`
    );
    const body = encodeURIComponent(
      `${t("supportPage.form.name_label")}: ${form.name}\n` +
      `${t("supportPage.form.email_label")}: ${form.email}\n\n` +
      `${t("supportPage.form.message_label")}:\n${form.message}`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Helmet>
        <title>{t("resourcesMenu.support")} - Meditation.AI</title>
        <meta name="description" content={t("supportPage.description")} />
      </Helmet>

      <div className="min-h-[70vh] bg-gradient-to-b from-[#F6FAFF] to-white">
        <div className="mx-auto max-w-5xl px-3 sm:px-4 lg:px-6 py-8 sm:py-10">
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 items-start">
            <div>
              <section className="mb-5 rounded-xl border border-slate-200 bg-[#F7F8FC] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug text-slate-900">
                      {t("resourcesMenu.support")}
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-slate-600 text-sm sm:text-base">
                      {t("supportPage.subtitle")}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center">
                    <div className="rounded-lg bg-violet-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm whitespace-nowrap">
                      {t("supportPage.cta")}
                    </div>
                  </div>
                </div>
              </section>

              <p className="text-[11px] font-semibold tracking-wider text-blue-600 mb-2">
                {t("supportPage.kicker")}
              </p>

              <p className="mt-1.5 text-slate-600 text-sm sm:text-base">
                {t("supportPage.description")}
              </p>

              <div className="relative mt-6 flex justify-center -ml-4 md:-ml-8">
                <img
                  src="https://horizons-cdn.hostinger.com/b165068b-ef99-4afb-83a7-dadb10c1561e/8fafc196880542f909742c77317aa98f.png"
                  alt="Mascota de soporte de Meditation.AI"
                  className="h-80 w-auto select-none pointer-events-none"
                  draggable={false}
                />
                <div className="absolute left-[calc(100%-180px)] top-3 hidden md:block">
                  <div className="absolute -left-2 top-3 h-2.5 w-2.5 rotate-45 bg-white border-l border-t border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.06)]" />
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <span className="text-slate-700 text-sm">
                      {t("supportPage.bubble")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
              <form onSubmit={onSubmit} className="space-y-3.5">
                <input
                  type="text"
                  name="honey"
                  value={form.honey}
                  onChange={onChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    {t("supportPage.form.name_label")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder={t("supportPage.form.name_placeholder")}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    {t("supportPage.form.email_label")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder={t("supportPage.form.email_placeholder")}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    {t("supportPage.form.subject_label")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    placeholder={t("supportPage.form.subject_placeholder")}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    {t("supportPage.form.message_label")}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    placeholder={t("supportPage.form.message_placeholder")}
                    required
                    rows={5}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-blue-500"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="h-10 w-full rounded-lg px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                  >
                    {t("supportPage.form.submit")}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  {t("supportPage.form.privacy_hint")}{" "}
                  <a href="/privacidad" className="underline underline-offset-2">
                    {t("supportPage.form.privacy_link")}
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;