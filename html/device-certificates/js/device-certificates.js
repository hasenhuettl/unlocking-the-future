
window.onload = function(){
    $("#signup").on("click", function(){ signup() });
    $("#login").on("click", function(){ login() });
}

function signup() {
    window.location.href = "/device-certificates/signup/";
}

function login() {
    window.location.href = "https://device-certificates.hasenhuettl.cc/";
}

