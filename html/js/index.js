$( document ).ready(function() {

  displayLanguageButtons();

  var userPreferredLanguage = localStorage.getItem('language');

  $('a[data-i18n="Smart_Cards"], a[data-i18n="USB_Keys"], a[data-i18n="SSO"]').each(function() {
    var currentHref = $(this).attr('href');
    var newHref = currentHref + "?language=" + userPreferredLanguage;
    $(this).attr('href', newHref);
  });

  document.getElementById('clearData').addEventListener('click', async () => {
    let text = "Clear all data?";
    if (confirm(text) == true) {
      try {
        const response = await fetch('/scripts/clearData', {
          method: 'POST',
        });

        const responseData = await response.json();

        if (responseData.success) {
          showSuccess(responseData.message);
        } else {
          showError(responseData.message);
        }
      } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while processing your request.');
      }
    }
  });
});

$( function() {
  $( document ).tooltip();
} );

