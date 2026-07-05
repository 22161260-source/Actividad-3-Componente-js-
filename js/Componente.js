/* ============================================================
   FARO.JS
   Librería reutilizable de componentes visuales interactivos
   en JavaScript puro (sin frameworks).

   API pública: window.Faro
     Faro.modal(opciones)
     Faro.toast(opciones)
   ============================================================ */

(function (global) {
  "use strict";

  /* ---------- utilidades internas ---------- */
  function crearElemento(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  /* ============================================================
     1. MODAL
     Faro.modal({
       title, content, confirmText, cancelText,
       onConfirm, onCancel
     })
     Devuelve un objeto con .close()
     ============================================================ */
  function modal(opciones) {
    const cfg = Object.assign(
      {
        title: "Título",
        content: "Contenido del modal.",
        confirmText: "Aceptar",
        cancelText: "Cancelar",
        showCancel: true,
        onConfirm: null,
        onCancel: null,
      },
      opciones || {}
    );

    const overlay = crearElemento("div", "faro-modal-overlay");
    const box = crearElemento("div", "faro-modal");

    const header = crearElemento("div", "faro-modal-header");
    const title = crearElemento("h3", "faro-modal-title", cfg.title);
    const closeBtn = crearElemento("button", "faro-modal-close", "&times;");
    closeBtn.setAttribute("aria-label", "Cerrar");
    header.append(title, closeBtn);

    const body = crearElemento("div", "faro-modal-body");
    if (typeof cfg.content === "string") {
      body.innerHTML = cfg.content;
    } else if (cfg.content instanceof Node) {
      body.appendChild(cfg.content);
    }

    const footer = crearElemento("div", "faro-modal-footer");
    if (cfg.showCancel) {
      const cancelBtn = crearElemento("button", "faro-btn", cfg.cancelText);
      cancelBtn.addEventListener("click", () => {
        if (typeof cfg.onCancel === "function") cfg.onCancel();
        cerrar();
      });
      footer.appendChild(cancelBtn);
    }
    const confirmBtn = crearElemento("button", "faro-btn faro-btn-primary", cfg.confirmText);
    confirmBtn.addEventListener("click", () => {
      if (typeof cfg.onConfirm === "function") cfg.onConfirm();
      cerrar();
    });
    footer.appendChild(confirmBtn);

    box.append(header, body, footer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add("faro-open"));

    function cerrar() {
      overlay.classList.remove("faro-open");
      setTimeout(() => overlay.remove(), 150);
      document.removeEventListener("keydown", onKeydown);
    }

    function onKeydown(e) {
      if (e.key === "Escape") cerrar();
    }
    document.addEventListener("keydown", onKeydown);

    closeBtn.addEventListener("click", () => {
      if (typeof cfg.onCancel === "function") cfg.onCancel();
      cerrar();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cerrar();
    });

    return { close: cerrar, element: overlay };
  }

  /* ============================================================
     2. TOAST
     Faro.toast({ message, type, duration })
     type: "info" | "success" | "error" | "warning"
     ============================================================ */
  let toastRegion = null;

  function toast(opciones) {
    const cfg = Object.assign(
      { message: "", type: "info", duration: 3200 },
      opciones || {}
    );

    if (!toastRegion) {
      toastRegion = crearElemento("div", "faro-toast-region");
      document.body.appendChild(toastRegion);
    }

    const claseTipo = ["success", "error", "warning"].includes(cfg.type) ? `faro-${cfg.type}` : "";
    const item = crearElemento("div", `faro-toast ${claseTipo}`.trim(), cfg.message);
    toastRegion.appendChild(item);

    requestAnimationFrame(() => item.classList.add("faro-show"));

    const quitar = () => {
      item.classList.remove("faro-show");
      setTimeout(() => item.remove(), 150);
    };

    setTimeout(quitar, cfg.duration);

    return { close: quitar };
  }

  /* ---------- exponer API pública ---------- */
  global.Faro = { modal, toast };
})(window);
