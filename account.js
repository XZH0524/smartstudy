(function () {
  'use strict';
  const enabled = document.querySelector('meta[name="eachveya-preview-account"]')?.content === 'enabled';

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

  globalThis.EachVeyaAccount = { enabled, request };
})();
