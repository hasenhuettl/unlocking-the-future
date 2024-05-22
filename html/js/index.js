document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('clearData').addEventListener('click', async () => {
      try {
          const response = await fetch('/scripts/clearData', {
              method: 'POST',
          });
          const responseData = await response.json();
          if (responseData.success) {
              showSuccess(responseData.message);
          } else {
              alert('Error: ' + responseData.message);
          }
      } catch (error) {
          console.error('Error:', error);
          showError('An error occurred while processing your request.');
      }
  });
});


