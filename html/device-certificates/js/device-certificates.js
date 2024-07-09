
window.onload = function(){
    $("#signup").on("click", function(){ signup() });
    $("#login").on("click", function(){ login() });
}

function signup() {
    window.location.href = "/device-certificates/signup/";
}

function login() {
    let startTime = new Date().getTime();
    const action = 'login';
    const params = new URLSearchParams({ action, startTime }).toString();
    window.location.href = "https://device-certificates.hasenhuettl.cc/index.html?" + params;
}

