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

  document.querySelectorAll('.save-state').forEach(function(checkbox) {
      checkbox.addEventListener('change', saveCheckboxState);
  });

  loadCheckboxState();
});

$( function() {
  $( document ).tooltip({
        position: {
            my: "center bottom-10",
            at: "center top",
        }
  });
} );

function saveCheckboxState() {
    document.querySelectorAll('.save-state').forEach(function(checkbox) {
        setCookie(checkbox.dataset.id, checkbox.checked ? 'checked' : '', 7);
    });
}

function loadCheckboxState() {
    document.querySelectorAll('.save-state').forEach(function(checkbox) {
        const state = getCookie(checkbox.dataset.id);
        if (state === 'checked') {
            checkbox.checked = true;
        }
    });
}

function uncheckAll() {
    document.querySelectorAll('.save-state').forEach(function(checkbox) {
        checkbox.checked = false;
    });
    document.querySelectorAll('.save-state').forEach(function(checkbox) {
        eraseCookie(checkbox.dataset.id);
    });
    showSuccess("Unchecked all checkboxes");
}

