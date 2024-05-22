window.onload = function(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
    } else {
        console.error('Geolocation is not supported by this browser.');
        window.location.href = '/gps-verification/403.html';
    }
}

function isLocationInAustria(latitude, longitude) {
    // Define the bounding box for Austria (approximate)
    const austriaBounds = {
        north: 49.02,
        south: 46.37,
        west: 9.53,
        east: 17.16
    };

    return (
        latitude >= austriaBounds.south &&
        latitude <= austriaBounds.north &&
        longitude >= austriaBounds.west &&
        longitude <= austriaBounds.east
    );
}

function handleLocationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    if (isLocationInAustria(latitude, longitude)) {
        window.location.href = '/success';
    } else {
        window.location.href = '/gps-verification/403.html';
    }
}

function handleLocationError(error) {
    console.error('Error getting location:', error);
    window.location.href = '/gps-verification/403.html';
}

