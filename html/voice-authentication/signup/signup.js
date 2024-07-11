let stream;
let chunks = [];
let isRecording = false;

const authMethod = document.title;
let startTime;

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
                })
                .catch(function(err) {
                    showError('Error: ' + err);
                });
        } else {
            stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            $('#recordVoice').text('Record Voice').removeClass("recording");
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

