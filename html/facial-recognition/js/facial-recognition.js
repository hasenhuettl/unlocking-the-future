// Load face-api models
faceapi.nets.tinyFaceDetector.loadFromUri('./models');
faceapi.loadFaceLandmarkModel('./models');
faceapi.loadFaceExpressionModel('./models');

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

    // Request access to the camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    $('#container').show();
    $('main').hide();

    // Wait for the video to be ready
    await new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve();
        };
    });

    const detectFace = async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        
        if (detections.length > 0) {
            const detection = detections[0];
            const box = detection.detection.box;
            const landmarks = detection.landmarks;
            const minFaceSize = 200; // Minimum face size threshold in pixels
    
            // Check if the detected face is fully visible and above a certain size threshold
            if (box.width >= minFaceSize && box.height >= minFaceSize) {
                // Oval center and radii
                const ovalCenterX = 400;
                const ovalCenterY = 300;
                const ovalRadiusX = 150;
                const ovalRadiusY = 200;
    
                // Face bounding box center
                const faceCenterX = box.x + box.width / 2;
                const faceCenterY = box.y + box.height / 2;
    
                // Check if the face center is within the oval
                const normalizedX = (faceCenterX - ovalCenterX) / ovalRadiusX;
                const normalizedY = (faceCenterY - ovalCenterY) / ovalRadiusY;
                const isInOval = (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
    
                // Check face tilt and gaze direction using landmarks
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const nose = landmarks.getNose();
                const mouth = landmarks.getMouth();
    
                const isNotTilted = Math.abs(leftEye[0].y - rightEye[0].y) < 10; // Adjust threshold as needed
                const isLookingAtCamera = (nose[3].x > leftEye[0].x && nose[3].x < rightEye[0].x) &&
                                          (mouth[0].y > nose[6].y); // Adjust criteria as needed
    
                if (isInOval && isNotTilted && isLookingAtCamera) {
                    console.log("Face is within the oval, not tilted, and looking into the camera.");
    
                    // Entire face detected and meets the size threshold
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    $('#container').hide();
                    $('main').show();
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
                                showError(result.message);
                            }
                        } else {
                            const result = await response.json();
                            showMain();
                            showError(result.message);
                        }
                    }, 'image/jpeg');
                    return;
                } else {
                    if (!isInOval) {
                      showSuccess("Please position your face.");
                    } else if (!isNotTilted) {
                      showSuccess("Please keep your face straight.");
                    } else if (!isLookingAtCamera) {
                      showSuccess("Please look at the camera.");
                    }
                }
            }
            showSuccess("Please move closer to the camera.");
        } else {
            showError("No face detected.");
        }
        // Restart face detection after a short delay
        setTimeout(detectFace, 500);
    }
    // Start face detection after a short delay
    setTimeout(detectFace, 500);
};
