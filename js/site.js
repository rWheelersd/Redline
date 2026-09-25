/* Supply real details here. Unfilled fields stay visible as placeholders.
   Instagram must use data-social="instagram" in the HTML. */
const REDLINE_CONTACT = {
  email: "",
  phone: "",
  x: "",
  facebook: "",
  instagram: ""
};

(function () {
  "use strict";
  document.querySelectorAll("[data-contact], [data-social]").forEach((node) => {
    const kind = node.dataset.contact || node.dataset.social;
    if (!Object.prototype.hasOwnProperty.call(REDLINE_CONTACT, kind)) return;
    const value = REDLINE_CONTACT[kind].trim();
    if (!value) return; // Keep the HTML content visible when no value is supplied.

    let href;
    if (kind === "email") href = `mailto:${value}`;
    else if (kind === "phone") href = `tel:${value.replace(/[^+\d]/g, "")}`;
    else {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") return;
        href = url.href;
      } catch (_) { return; }
    }

    const link = document.createElement("a");
    link.href = href;
    link.textContent = node.closest(".footer-socials") ? {
      x: "X", facebook: "Facebook", instagram: "Instagram"
    }[kind] : value;
    if (node.dataset.social) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    node.replaceWith(link);
  });
})();
