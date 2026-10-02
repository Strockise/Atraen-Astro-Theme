/**
 * Form handling for every Webflow `.w-form` (newsletter + contact).
 *
 * Webflow forms post to Webflow's servers, which doesn't work outside Webflow. This listener runs in the
 * capture phase (before webflow.js), sends the fields as JSON to PUBLIC_FORM_ENDPOINT and toggles the
 * original success (.w-form-done) / error (.w-form-fail) blocks exactly like Webflow does.
 *
 * No endpoint configured → demo mode: the success message is shown and nothing is sent.
 */
const ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

function show(el: Element | null, visible: boolean) {
  if (el instanceof HTMLElement) el.style.display = visible ? 'block' : 'none';
}

async function submit(form: HTMLFormElement) {
  const wrapper = form.closest('.w-form');
  const done = wrapper?.querySelector('.w-form-done') ?? null;
  const fail = wrapper?.querySelector('.w-form-fail') ?? null;
  const button = form.querySelector<HTMLInputElement>('input[type="submit"], button[type="submit"]');
  const label = button?.value;

  if (button) {
    button.disabled = true;
    if (button instanceof HTMLInputElement) button.value = button.dataset.wait || 'Please wait...';
  }
  show(fail, false);

  let ok = true;
  if (ENDPOINT) {
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ form: form.dataset.name ?? form.name, ...data }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
  }

  if (button) {
    button.disabled = false;
    if (button instanceof HTMLInputElement && label !== undefined) button.value = label;
  }
  if (ok) {
    form.reset();
    form.style.display = 'none';
    show(done, true);
  } else {
    show(fail, true);
  }
}

window.addEventListener(
  'submit',
  (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.closest('.w-form')) return;
    // Stop webflow.js from posting to Webflow.
    event.preventDefault();
    event.stopPropagation();
    if (!form.reportValidity()) return;
    void submit(form);
  },
  true,
);
