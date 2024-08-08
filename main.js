document.addEventListener('DOMContentLoaded', function () {
    const domMain = document.querySelector('#main');
    const domResults = document.querySelector('#result');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeButton = document.getElementById('analyzeButton');
    const uploadNewButton = document.getElementById('uploadNewButton');
    const goBack = document.getElementById('goBack');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const dragDropArea = document.getElementById('dragDropArea');
    const apiUrl = 'https://5001-idx-gemini-api-app-1722702714038.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev/gemini-api-app-93cd0/us-central1/analyzeEcoInterior';

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    dragDropArea.style.display = 'none';
                    uploadNewButton.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file.');
            }
        }
    }

    imageInput.addEventListener('change', function (event) {
        handleFiles(event.target.files);
    });

    dragDropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('dragover');
    });

    dragDropArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
    });

    dragDropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    dragDropArea.addEventListener('click', function () {
        imageInput.click();
    });

    uploadNewButton.addEventListener('click', function () {
        imagePreview.style.display = 'none';
        dragDropArea.style.display = 'block';
        uploadNewButton.style.display = 'none';
        imageInput.value = '';
        resultDiv.style.display = 'none';
    });

    const getSuggestionTemplate = data => {
        return `
        <div class="suggestion-item">
            <h3 class="text-[#201A09] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                ${data.title}
            </h3>
            <div class="flex gap-4 bg-[#FBF8EF] px-4 py-3">
                <div class="text-[#201A09] flex items-center justify-center rounded-lg bg-[#F5EFDB] shrink-0 size-12" data-icon="Lightbulb" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                        d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"
                        ></path>
                    </svg>
                </div>
                <div class="flex flex-1 flex-col justify-center">
                    <p class="text-[#A07D1C] text-sm font-normal leading-normal">
                        ${data.description}
                    </p>
                </div>
            </div>
        </div>
        `;
    };

    const showResults = show => {
        if (!show) {
            domMain.setAttribute('style','display:block');
            domResults.setAttribute('style','display:none');
        } else {
            domMain.setAttribute('style','display:none');
            domResults.setAttribute('style','display:block');
        }
    };

    analyzeButton.addEventListener('click', async function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!imageInput.files || imageInput.files.length === 0) {
            alert('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageInput.files[0]);

        resultDiv.style.display = 'none';
        loadingDiv.style.display = 'block';

        const domScores = document.querySelectorAll('.score');
        const domScorePct = document.querySelectorAll('.score-pct');
        const domSuggestions = document.querySelector('#result-suggestions');
        
        try {
            console.log('api url:', apiUrl);
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            const data = await response.json();
            console.log('main', domMain);
            showResults(true);

            console.log("RECEIVED", data);
            domSuggestions.innerHTML = "";

            for (let title in data) {
                if (title === 'score') {
                    domScores.forEach(dom => dom.innerHTML = data.score);
                    domScorePct.forEach(dom => dom.setAttribute('style', `width: ${data.score}%`));
                } else {
                    const description = data[title].replace(/(\s\d\.\s)/g, '<br />$1');
                    domSuggestions.innerHTML = domSuggestions.innerHTML + getSuggestionTemplate({ title:title, description:description });
                }
            }

            /*resultDiv.innerHTML = `
                <h3>Analysis Result:</h3>
                <p>Score: ${data.score}</p>
                <p>Current Style: ${data.current_style}</p>
                <p>Improvement Suggestions: ${data.improvement_suggestions}</p>
                <p>Eco-Friendly Home Decor Ideas: ${data.ecofriendly_home_decor}</p>
            `;*/
            
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = 'An error occurred while analyzing the image: ' + error.message;
        } finally {
            loadingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    });

    document.addEventListener('submit', function (event) {
        event.preventDefault();
    });

    window.onbeforeunload = function () {
        return "Are you sure you want to leave this page?";
    };

    /*
    document.querySelector('#goBack').addEventListener('click', evt => {
        showResults(false);
    });
    */

    goBack.addEventListener('click', function () {
        imagePreview.style.display = 'none';
        dragDropArea.style.display = 'block';
        uploadNewButton.style.display = 'none';
        imageInput.value = '';
        resultDiv.style.display = 'none';
        showResults(false);
    });

});
