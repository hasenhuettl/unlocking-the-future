var userPreferredLanguage;

window.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    userPreferredLanguage = urlParams.get('language');
    if (userPreferredLanguage) { localStorage.setItem('language', userPreferredLanguage) }

    userPreferredLanguage = localStorage.getItem('language') || 'en';
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
      element.textContent = langData[key];
    });
}

function setBackgroundColor() {
    if (userPreferredLanguage == 'en') {
        $('#EN').prop( "disabled", true );
        $('#DE').prop( "disabled", false );
    } else if (userPreferredLanguage == 'de') {
        $('#EN').prop( "disabled", false );
        $('#DE').prop( "disabled", true );
    }
}

// show success message
function showSuccess( message ) {
    $('#message').remove();
    $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).fadeOut(4000).append(
      $('<span>').attr('id', 'messagetext').css('background-color', 'green').text(message))
    );
}

// show error message
function showError( message ) {
    $('#message').remove();
    $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).delay(6000).fadeOut(4000).append(
      $('<span>').attr('id', 'messagetext').css('background-color', 'red').text(message))
    );
}

function showMain() {
    $(".loader").hide();
    $("main").show();
}

function showLoad() {
    $(".loader").show(); // show loading
    $("main").hide();
}
