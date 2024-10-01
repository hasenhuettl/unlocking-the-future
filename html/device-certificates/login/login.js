window.onload = function(){
  const urlParams = new URLSearchParams(window.location.search);

  const authMethod = document.title;
  const startTime = urlParams.get('startTime');
  const action = urlParams.get('action');
  const readyTime = new Date().getTime();
  const timeMs = readyTime - startTime;

  const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
  window.location.href = 'https://authenticate.hasenhuettl.cc/success?' + params;
}

