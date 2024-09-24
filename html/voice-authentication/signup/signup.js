let stream;
let chunks = [];
let isRecording = false;
let audioContext;
let analyserNode;
let frequencyData;
let barGraphDomElements = [];
let animationId;
let isStarted = false;

const authMethod = document.title;
let startTime;

const generateBarGraph = (numDataPoints) => {
    const bars = document.getElementById('bargraph');
    bars.innerHTML = '';  // Clear any existing bars

    barGraphDomElements = [];
    for (let i = 0; i < numDataPoints; ++i) {
        let node = document.createElement('div');
        node.className = 'bar';
        bars.appendChild(node);
        barGraphDomElements.push(node);
    }

    return barGraphDomElements;
};

const getBigBinIndex = (frequencyBins) => {
    let biggestIndex = 0;
    frequencyBins.forEach((bin, index) => {
        if (bin > frequencyBins[biggestIndex]) {
            biggestIndex = index;
        }
    });
    return biggestIndex;
};

const updateSpectrogram = (timestamp) => {
    if (!analyserNode) return;
    analyserNode.getByteFrequencyData(frequencyData);
    const bigBinIndex = getBigBinIndex(frequencyData);
    const binSize = (audioContext.sampleRate) / analyserNode.fftSize;

    barGraphDomElements.forEach((element, index) => {
        element.style.height = (1 + frequencyData[index]) + 'px';
        element.style.backgroundColor = 'lightpink';
        if (index === bigBinIndex) {
            element.style.backgroundColor = 'red';
        }
    });

    animationId = requestAnimationFrame(updateSpectrogram);
};

const toggleSpectrogram = (action) => {
    if (action === 'start' && !isStarted) {
        isStarted = true;
        let fftSize = 1024;

        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        } catch (e) {
            alert('Web Audio API is not supported in this browser');
            return;
        }

        let source = audioContext.createMediaStreamSource(stream);
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = fftSize;
        audioContext.resume();
        source.connect(analyserNode);

        frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
        barGraphDomElements = generateBarGraph(analyserNode.frequencyBinCount);

        animationId = requestAnimationFrame(updateSpectrogram);

    } else if (action === 'stop' && isStarted) {
        isStarted = false;
        cancelAnimationFrame(animationId);  // Stop the animation
        if (audioContext) {
            audioContext.close();  // Stop audio processing
        }
        barGraphDomElements.forEach((element) => {
            element.style.height = '0px';  // Reset bar heights
        });
        const mainfrequencyDomElement = document.getElementById('mainfrequency');
        mainfrequencyDomElement.textContent = '';
    }
};

$( document ).ready(function() {
    startTime = new Date().getTime();

    const category = "";
    if (localStorage.getItem('language') === 'de') {
        $('#quote').text("Gib jedem Tag die Chance, der schönste deines Lebens zu werden.");
    } else {
        $.ajax({
            method: 'GET',
            url: '/random-quote?' + category,
            contentType: 'application/json',
            success: function(result) {
                $('#quote').text(result[0].content);
            },
            error: function ajaxError(jqXHR) {
                console.error('Error: ', jqXHR.responseText);
            }
        });
    }

    $( "#signup" ).on( "click", function() {
        const action = 'signup';
        const readyTime = new Date().getTime();
        const timeMs = readyTime - startTime;
        
        const username = $('#username').val();
        let file = $('#files')[0].files[0]

        let formData = new FormData();
        formData.append('userId', username);
        formData.append('voice', file);

        showLoad();

        $.ajax({
            url: '/voice-authentication-api/signup',
            method: 'POST',
            contentType: 'application/json',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
                window.location.href = '/success?' + params
                // showSuccess(response.message);
            },
            error: function(xhr, ajaxOptions, error) {
                showMain();
                showError( xhr.responseText );
            }
        });
    });

    $('#recordVoice').on('click', function() {
        if (!isRecording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(audioStream) {
                    stream = audioStream;
                    startRecording();
                    isRecording = true;
                    $('#recordVoice').text('Stop Recording').addClass("recording");
                    toggleSpectrogram('start');
                })
                .catch(function(err) {
                    showError('Error: ' + err);
                });
        } else {
            stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            $('#recordVoice').text('Record Voice').removeClass("recording");
            $('#signup').prop("disabled", false);
            toggleSpectrogram('stop');
        }
    });

});

function startRecording() {
    let recorder = new MediaRecorder(stream);

    recorder.ondataavailable = function(e) {
        chunks.push(e.data);
    };

    recorder.onstop = function(e) {
        let blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        chunks = []; // Clear chunks for next recording
        let fileInput = $('#files')[0];
        let file = new File([blob], 'voice_sample.ogg', { type: 'audio/ogg' });
        let dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
    };

    recorder.start();
}

function startBarChart() {
    const generateBarGraph = (numDataPoints) => {
        var audioContext;

        const bars = document.getElementById('bargraph');

        var barGraphDomElements = [];
        for (var i = 0; i < numDataPoints; ++i) {
            let node = document.createElement('div');
            node.className = 'bar';
            bars.appendChild(node);
            barGraphDomElements.push(node);
        }

        return barGraphDomElements;
    }

    const getBigBinIndex = (frequencyBins) => {
        let biggestIndex = 0;
        frequencyBins.forEach((bin, index) => {
            if (bin > frequencyBins[biggestIndex]) {
                biggestIndex = index;
            }
        });

        return biggestIndex;
    }

    var fftSize = 1024;
    var audioContext;

    var analyserNode;
    var frequencyData;
    var lastUpdate = 0;

    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    } catch (e) {
        alert('Web Audio API is not supported in this browser');
    }

    const update = (timestamp) => {
        if (timestamp - lastUpdate > 50) {
            analyserNode.getByteFrequencyData(frequencyData);
            const bigBinIndex = getBigBinIndex(frequencyData);
            const binSize = (audioContext.sampleRate) / fftSize;
            lastUpdate = timestamp;
        }
        requestAnimationFrame(update);
    }

    // Acquire microphone access.
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    }).then(stream => {
        var source = audioContext.createMediaStreamSource(stream);
        analyserNode = audioContext.createAnalyser(source);
        analyserNode.fftSize = fftSize;
        audioContext.resume();
        source.connect(analyserNode);
        console.log(analyserNode.frequencyBinCount);
        frequencyData = new Uint8Array(analyserNode.frequencyBinCount)
        barGraphDomElements = generateBarGraph(analyserNode.frequencyBinCount);
        window.requestAnimationFrame(update);
    });
}
