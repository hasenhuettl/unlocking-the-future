const pokemons = [
    ["bulbasaur.png", "charmander.png", "squirtle.png"], // Generation 1
    ["chikorita.png", "cyndaquil.png", "totodile.png"], // Generation 2
    ["treecko.png", "torchic.png", "mudkip.png"], // Generation 3
    ["turtwig.png", "chimchar.png", "piplup.png"], // Generation 4
    ["snivy.png", "tepig.png", "oshawott.png"], // Generation 5
    ["chespin.png", "fennekin.png", "froakie.png"] // Generation 6
]

const apiUrl = 'https://authenticate.hasenhuettl.cc/game-based-authentication-api';
let currentStep = 0;
var myVal = "";

window.onload = function(){
    $('#game').hide();
    $("#login").on("click", function(){ login(); });
    $("#signup").on("click", function(){ signup(); });

    $('#password').on('keyup', function(event) {
        $('#password').val(myVal);
        if (event.key >= '1' && event.key <= '3') {
            handleSelection(parseInt(event.key));
        } else {
            showError("Please use values between 1 to 3");
        }
    });

    // Preload images
    pokemons.flat().forEach(pokemon => {
        const img = new Image();
        img.src = `/images/${pokemon}`;
    });

    startGame()
}

function resetInput() {
    myVal = "";
    $('#password').val(myVal);
}

// Reset the password field and start a new game
function startGame() {
    currentStep = 0;
    $('#game').show();
    resetInput();
    displayGeneration();
}

function displayGeneration() {
    const gameArea = $('#game');
    gameArea.empty(); // Clear previous images
    const generation = pokemons[currentStep];

    generation.forEach((pokemon, index) => {
        const img = $('<img>', {
            src: `/images/${pokemon}`,
            class: 'pokemon-button',
            click: () => handleSelection(index + 1)
        });
        gameArea.append(img);
    });
}

function handleSelection(selection) {
    const currentPasswordValue = $('#password').val();
    myVal = currentPasswordValue + selection;
    $('#password').val(myVal);
    currentStep++;

    if (currentStep >= pokemons.length) {
        $('#game').hide();
    } else {
        displayGeneration();
    }
}

async function login() {
    const username = $("#username").val();
    const password = $("#password").val();
    try {
        const response = await fetch(apiUrl + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            window.location.href = '/success';
        } else {
            showError(result.error);
            startGame()
        }
    } catch (error) {
        showError('Network error: ' + error);
        startGame()
    }
}

async function signup() {
    const username = $("#username").val();
    const password = $("#password").val();
    try {
        const response = await fetch(apiUrl + '/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            window.location.href = '/success';
        } else {
            showError(result.error);
            startGame()
        }
    } catch (error) {
        showError('Network error: ' + error);
        startGame()
    }
}

