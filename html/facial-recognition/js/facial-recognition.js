const authMethod = document.title;
let startTime;

// Load face-api models
faceapi.nets.tinyFaceDetector.loadFromUri('./models');
faceapi.loadFaceLandmarkModel('./models');
faceapi.loadFaceExpressionModel('./models');

window.onload = function(){
    startTime = new Date().getTime();

    document.getElementById('registerBtn').addEventListener('click', () => {
        captureAndUpload('/facial-recognition-api/signup', 'img1.jpg');
    });
 
    document.getElementById('loginBtn').addEventListener('click', () => {
        captureAndUpload('/facial-recognition-api/login', 'img2.jpg');
    });
};

const captureAndUpload = async (endpoint, filename) => {

    showLoad();
    try {

        const readyTime = new Date().getTime();
        const timeMs = readyTime - startTime;

        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        // Request access to the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        showMain()
        $('#container').show();
        $('main').hide();

        // Wait for the video to be ready
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve();
            };
            video.onerror = (error) => {
                reject(error);
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
                const minWidth  = canvas.width  * 0.25; // Minimum face size threshold in pixels
                const minHeight = canvas.height * 0.25; // Minimum face size threshold in pixels
        
                // Check if the detected face is fully visible and above a certain size threshold
                if (box.width >= minWidth && box.height >= minHeight) {
                    // Oval center and radius
                    const ovalCenterX = canvas.width / 2;
                    const ovalCenterY = canvas.height / 2;
                    const ovalRadiusX = ovalCenterX * 0.5; // 75% of canvas width / 2
                    const ovalRadiusY = ovalCenterY * 0.5; // canvas height / 2
        
                    // Face bounding box center
                    const faceCenterX = box.x + box.width / 2;
                    const faceCenterY = box.y + box.height / 2;
        
                    // Check face tilt and gaze direction using landmarks
                    const leftEye = landmarks.getLeftEye();
                    const rightEye = landmarks.getRightEye();
                    const nose = landmarks.getNose();
                    const mouth = landmarks.getMouth();
        
                    const isNotTilted = Math.abs(leftEye[0].y - rightEye[0].y) < 10; // Adjust threshold as needed
                    const isLookingAtCamera = (nose[3].x > leftEye[0].x && nose[3].x < rightEye[0].x) &&
                                              (mouth[0].y > nose[6].y); // Adjust criteria as needed
        
                    if (isNotTilted && isLookingAtCamera) {

                        console.log("Face is within the oval, not tilted, and looking into the camera.");
        
                        const parts = endpoint.split('/');
                        const action = parts.pop(); // Return login or signup from url
                        const readyTime = new Date().getTime();
                        const timeMs = readyTime - startTime;

                        // Entire face detected and meets the size threshold
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        $('#container').hide();
                        $('main').show();
                        stream.getTracks().forEach(track => track.stop()); // Stop all video streams
                        $('#message').remove();
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
                                    const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
                                    window.location.href = '/success?' + params;
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
                        if (!isNotTilted) {
                          showSuccess("Please keep your face straight.");
                        } else if (!isLookingAtCamera) {
                          showSuccess("Please look at the camera.");
                        }
                    }
                } else {
                    showSuccess("Please move closer to the camera.");
                }
            } else {
                showSuccess("No face detected.");
            }
            // Restart face detection after a short delay
            setTimeout(detectFace, 500);
        }
        // Start face detection after a short delay
        setTimeout(detectFace, 500);
    } catch (error) {
        showMain();
        showError(error);
    }
};
