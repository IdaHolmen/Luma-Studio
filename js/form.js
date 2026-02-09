const API_BASE = "http://localhost:3000";

function setText(el, text) {
  if (!el) return;
  el.textContent = text || "";
  el.style.visibility = text ? "visible" : "hidden";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`POST ${url} failed (${res.status}): ${txt}`);
  }

  return res.json().catch(() => ({}));
}

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const fullnameInput = document.querySelector("#fullname");
  const emailInput = document.querySelector("#email");
  const messageInput = document.querySelector("#message");

  const fullnameError = document.querySelector("#fullname-error");
  const emailError = document.querySelector("#email-error");
  const messageError = document.querySelector("#message-error");

  const countEl = document.querySelector("#message-count");
  const statusEl = document.querySelector("#submission-status");

  const MAX_NAME = 100;
  const MAX_MESSAGE = 300;

  function updateCounter() {
    const len = messageInput?.value?.length || 0;
    if (countEl) countEl.textContent = `Tegn: ${len}`;

    if (len > MAX_MESSAGE) {
      setText(messageError, `Melding kan maks være ${MAX_MESSAGE} tegn ⚠️`);
    } else if (messageError?.textContent?.includes("maks")) {
      setText(messageError, "");
    }
  }

  function validate() {
    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    let ok = true;

    setText(statusEl, "");

    if (!fullname) {
      ok = false;
      setText(fullnameError, "Fullt navn er påkrevd ⚠️");
    } else if (fullname.length > MAX_NAME) {
      ok = false;
      setText(fullnameError, `Fullt navn må være under ${MAX_NAME} tegn ⚠️`);
    } else {
      setText(fullnameError, "");
    }

    if (!email) {
      ok = false;
      setText(emailError, "E-post er påkrevd ⚠️");
    } else if (!validateEmail(email)) {
      ok = false;
      setText(emailError, "Skriv inn en gyldig e-postadresse ⚠️");
    } else {
      setText(emailError, "");
    }

    if (!message) {
      ok = false;
      setText(messageError, "Melding er påkrevd ⚠️");
    } else if (message.length > MAX_MESSAGE) {
      ok = false;
      setText(messageError, `Melding kan maks være ${MAX_MESSAGE} tegn ⚠️`);
    } else {
      setText(messageError, "");
    }

    fullnameInput.classList.toggle("has-error", !!fullnameError?.textContent);
    emailInput.classList.toggle("has-error", !!emailError?.textContent);
    messageInput.classList.toggle("has-error", !!messageError?.textContent);

    return { ok, fullname, email, message };
  }

  messageInput?.addEventListener("input", updateCounter);
  updateCounter();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const v = validate();
    if (!v.ok) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await postJSON(`${API_BASE}/api/messages`, {
        fullname: v.fullname,
        email: v.email,
        message: v.message,
      });

      setText(statusEl, "Takk! Meldingen er sendt ✅");
      form.reset();
      updateCounter();
    } catch (err) {
      console.error(err);
      setText(statusEl, "Noe gikk galt. Prøv igjen litt senere ⚠️");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupContactForm();
});
