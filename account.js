(function () {
  'use strict';
  const enabled = document.querySelector('meta[name="eachveya-preview-account"]')?.content === 'enabled';
  const demoContacts = { phone: '+8610000000001', email: 'learner1@example.test' };

  function demoMethod(contact) {
    if (/^learner[1-9]\d{0,2}@example\.test$/i.test(contact)) return 'email';
    if (/^\+8610000000[0-9]{3}$/.test(contact)) return 'sms';
    return null;
  }

  async function request(path, body, owner) {
    const options = { credentials: 'same-origin', headers: {}, signal: AbortSignal.timeout(15_000) };
    if (owner) options.headers['X-EachVeya-Account'] = owner;
    if (body !== undefined) {
      options.method = 'POST';
      options.headers['Content-Type'] = 'application/json';
      options.headers['X-EachVeya-Request'] = 'web-v1';
      options.body = JSON.stringify(body);
    }
    const response = await fetch(path, options);
    const value = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(value.error || 'unavailable'), { status: response.status });
    return value;
  }

  globalThis.EachVeyaAccount = { enabled, demoContacts, demoMethod, request };
})();
