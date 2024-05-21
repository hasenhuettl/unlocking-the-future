window.onload = function(){
    const captureAndUpload = async (endpoint, filename) => {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
 
        // Request access to the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
 
        // Wait for the video to be ready
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve();
            };
        });
 
        // Capture the image after 3 seconds
        setTimeout(() => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            video.style.display = 'none';
            stream.getTracks().forEach(track => track.stop()); // Stop all video streams
            showLoad();
 
            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('file', blob, filename);
 
                // Upload the image to the server
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                });
 
                if (response.ok) {
                    const result = await response.json();
                    if (result.message === "OK") {
                      window.location.href = "/success";
                    } else {
                      showMain();
                      alert(result.message);
                    }
                } else {
                    showMain();
                    alert('Failed to upload image.');
                }
            }, 'image/jpeg');
        }, 3000); // Take the picture after 3 seconds
    };
 
    document.getElementById('registerBtn').addEventListener('click', () => {
        captureAndUpload('/facial-recognition-api/upload', 'img1.jpg');
    });
 
    document.getElementById('loginBtn').addEventListener('click', () => {
        captureAndUpload('/facial-recognition-api/login', 'img2.jpg');
    });
};

function showMain() {
    $(".loader").hide();
    $("main").show();
}

function showLoad() {
    $(".loader").show(); // show loading
    $("main").hide();
}
