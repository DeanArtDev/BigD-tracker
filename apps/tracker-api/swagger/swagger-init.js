(function waitForSwaggerUI() {
  if (typeof window.ui === 'undefined') {
    setTimeout(waitForSwaggerUI, 100);
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    window.ui.preauthorizeApiKey('access-token', token);
  }
})();
