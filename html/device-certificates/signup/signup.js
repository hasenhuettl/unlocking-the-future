window.onload = function() {
  let startTime = new Date().getTime();
  const action = 'signup';
  const params = new URLSearchParams({ action, startTime }).toString();

  $("#download").on("click", function(){
    const username = $("#username").val();
    const certFile = `${username}.p12`;
    showLoad();

    $.ajax({
        url: '/device-certificates-api/generate_certificate',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username: username }),
        success: function(response) {
            showMain();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/device-certificates/certs/' + certFile, true);
            xhr.responseType = 'blob';
            xhr.onload = function() {
              if (xhr.status === 200) {
                var url = window.URL.createObjectURL(xhr.response);
                var a = document.createElement('a');
                a.href = url;
                a.download = certFile;
                a.click();
                $("#continue").prop('disabled', false);
              }
            };
            xhr.send();
            showSuccess("Download complete");
        },
        error: function(xhr, ajaxOptions, error) {
            showMain();
            showError( xhr.responseText );
        }
    });
  });

  $("#continue").on("click", function(){ window.location.href = "https://device-certificates.hasenhuettl.cc/index.html?" + params; });
};

