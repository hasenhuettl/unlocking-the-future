document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('clearData').addEventListener('click', async () => {
    try {
      const [clearDataResponse, resetIPResponse] = await Promise.all([
        fetch('/scripts/clearData', {
          method: 'POST',
        }),
        fetch('/ip-address-filtering-api/reset', {
          method: 'POST',
          redirect: 'manual' // Prevent automatic following of redirects
        })
      ]);
    
      const clearDataResult = await clearDataResponse.json();
    
      if (clearDataResult.success && resetIPResponse.status === 302) {
        showSuccess('Data cleared successfully.');
      } else {
        const errorMessage = [
          clearDataResult.success ? null : clearDataResult.message,
        ].filter(msg => msg).join(' ');
        showError(errorMessage || 'An error occurred while processing your request.');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('An error occurred while processing your request.');
    }
  });
});


