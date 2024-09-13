document.addEventListener('DOMContentLoaded', function() {
    // Populate the voice selector dropdown
    const voiceSelector = document.getElementById('voiceSelector');
    
    function populateVoices() {
        const voices = window.speechSynthesis.getVoices();
        voiceSelector.innerHTML = ''; // Clear existing options
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelector.appendChild(option);
        });
    }

    // Initial population and update on voice change
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    // Form submission and voice input handling
    document.getElementById('questionForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const question = document.getElementById('question').value;

        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'question': question
            }),
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('response').innerText = data.answer;
            if (readAloud) {
                speakText(data.answer);  // Convert response text to speech
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Voice-to-Text Functionality
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    document.getElementById('startVoice').addEventListener('click', function() {
        recognition.start();
    });

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('question').value = transcript;
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };

    // Text-to-Speech Functionality
    let readAloud = true;  // Flag to control whether to read aloud or not

    document.getElementById('speakResponse').addEventListener('click', function() {
        const responseText = document.getElementById('response').innerText;
        if (responseText) {
            speakText(responseText);
        }
    });

    function speakText(text) {
        const selectedVoiceName = voiceSelector.value;
        const voices = window.speechSynthesis.getVoices();
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
    }

    // Toggle read aloud feature
    document.getElementById('startVoice').addEventListener('click', function() {
        readAloud = false; // Disable read aloud if using voice input
    });
});
