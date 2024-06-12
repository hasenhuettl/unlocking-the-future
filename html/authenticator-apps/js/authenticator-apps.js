window.onload = function(){
    $("#signup").on("click", function(){ signup() });
    $("#login").on("click", function(){ login() });
}

function signup() {
    window.location.href = "signup";
}

function login() {
    window.location.href = "login";
}

