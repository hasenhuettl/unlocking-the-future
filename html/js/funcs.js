var userPreferredLanguage;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

window.addEventListener('DOMContentLoaded', async () => {
    let username = getCookie("username");
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get('username');
    userPreferredLanguage = urlParams.get('language');

    if (urlUsername) { username = urlUsername; }

    if( $('#username').length && username ) {
        document.getElementById('username').value = username;
    } else if ( !username ) {
        showError('Please first register this device <a href="/register-device/index.html">via this link</a>');
    }

    if (userPreferredLanguage) { localStorage.setItem('language', userPreferredLanguage); }
    userPreferredLanguage = localStorage.getItem('language') || 'en'; // Default to 'en' if no preference
    const langData = await fetchLanguageData(userPreferredLanguage);
    updateContent(langData);
});

async function changeLanguage(lang) {
    await setLanguagePreference(lang);
    const langData = await fetchLanguageData(lang);
    updateContent(langData);
}

async function fetchLanguageData(lang) {
    const response = await fetch(`${lang}.json`);
    return response.json();
}

function setLanguagePreference(lang) {
    localStorage.setItem('language', lang);
    location.reload();
}

function updateContent(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');

        if (langData[key]) {
            element.textContent = langData[key];
        }

        // Update title attribute if it exists in the language data
        const titleKey = `${key}_Title`;
        if (langData[titleKey] && element.hasAttribute('title')) {
            element.setAttribute('title', langData[titleKey]);
        }
    });
}

function displayLanguageButtons() {
    if (userPreferredLanguage == 'en') {
        $('#EN').prop( "disabled", true );
        $('#DE').prop( "disabled", false );
    } else if (userPreferredLanguage == 'de') {
        $('#EN').prop( "disabled", false );
        $('#DE').prop( "disabled", true );
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

// show success message
function showSuccess( message ) {
    $('#message').remove();
    $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).fadeOut(4000).append(
      $('<span>').attr('id', 'messagetext').css('background-color', 'green').html(message))
    );
}

// show error message
function showError( message ) {
    $('#message').remove();
    $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).delay(6000).fadeOut(4000).append(
      $('<span>').attr('id', 'messagetext').css('background-color', 'red').html(message))
    );
}

function showMain() {
    $(".loader").hide();
    $("main").show();
}

function showLoad() {
    $(".loader").show();
    $("main").hide();
}
