window.onload = function(){
    $("#signup").on("click", function(){ signup() });
    $("#login").on("click", function(){ login() });
}

function signup() {
    window.location.href = "/ip-address-filtering-api/";
}

function login() {
    window.location.href = "/ip-address-filtering/login/";
}

