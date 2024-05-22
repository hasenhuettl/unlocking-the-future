window.onload = function(){
 
    document.getElementById('registerBtn').addEventListener('click', () => {
        captureAndUpload('/facial-recognition-api/upload', 'img1.jpg');
    });
 
    document.getElementById('loginBtn').addEventListener('click', () => {
        captureAndUpload('/facial-recognition-api/login', 'img2.jpg');
    });
};

const captureAndUpload = async (endpoint, filename) => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Load face-api models
    await faceapi.nets.tinyFaceDetector.loadFromUri('./models');

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

    const detectFace = async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
        if (detections.length > 0) {
            // Check if the detected face is fully visible and above a certain size threshold
            const detection = detections[0];
            const box = detection.box;
            const minFaceSize = 200; // Minimum face size threshold in pixels

            if (box.width >= minFaceSize && box.height >= minFaceSize) {
                // Entire face detected and meets the size threshold
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
                return;
            }
        }
        // Retry face detection after a short delay if no valid face is detected
        setTimeout(detectFace, 500);
    };

    // Start detecting faces
    detectFace();
};

function showMain() {
    $(".loader").hide();
    $("main").show();
}

function showLoad() {
    $(".loader").show(); // show loading
    $("main").hide();
}
