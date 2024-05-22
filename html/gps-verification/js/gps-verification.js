window.onload = function(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
    } else {
        console.error('Geolocation is not supported by this browser.');
        window.location.href = '/gps-verification/403.html';
    }
}

async function checkLocationWithAPI(latitude, longitude) {
    try {
        const response = await fetch(`/gps-verification/api?lat=${latitude}&lon=${longitude}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        const results = data.features;
        if (results.length > 0) {
            const country = results[0].properties.country_code;
            return country && country.toUpperCase() === 'AT'; // 'AT' is the ISO country code for Austria
        }
        return false;
    } catch (error) {
        console.error('Error fetching location data:', error);
        return false;
    }
}

async function handleLocationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const inAustria = await checkLocationWithAPI(latitude, longitude);
    if (inAustria) {
        window.location.href = '/success';
    } else {
        window.location.href = '/gps-verification/403.html';
    }
}

function handleLocationError(error) {
    console.error('Error getting location:', error);
    window.location.href = '/gps-verification/403.html';
}

