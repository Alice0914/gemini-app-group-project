import { streamGemini } from './gemini-api.js';

const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const uploadNewButton = document.getElementById('uploadNewButton');
const analyzeButton = document.getElementById('analyzeButton');
const loadingDiv = document.getElementById('loading');
const dragDropArea = document.getElementById('dragDropArea');
const domMain = document.querySelector('#main');
const domResults = document.querySelector('#result');
const goBack = document.getElementById('goBack');
const domScores = document.querySelectorAll('.score');
const domScorePct = document.querySelectorAll('.score-pct');
const domSuggestions = document.querySelector('#result-suggestions');

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                dragDropArea.style.display = 'none';
                uploadNewButton.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
}

imageUpload.addEventListener('change', (event) => {
    event.preventDefault();
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
    imageUpload.click();
});

const showResults = show => {
    if (!show) {
        domMain.setAttribute('style','display:block');
        domResults.setAttribute('style','display:none');
    } else {
        domMain.setAttribute('style','display:none');
        domResults.setAttribute('style','display:block');
    }
};

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

analyzeButton.addEventListener('click', async function (event) {
    event.preventDefault();
    loadingDiv.style.display = 'block';

    try {
        const file = imageUpload.files[0];
        if (!file) {
            throw new Error('Please select an image.');
        }

        const imageBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result.split(',')[1]);
            reader.readAsDataURL(file);
        });

        const contents = [
            {
                role: 'user',
                parts: [
                    { inline_data: { mime_type: file.type, data: imageBase64 } },
                    { text: `Analyze this interior image and provide a JSON response in the exact format below:

{
    "score": <integer between 0 and 100>,
    "Current Style": "<A concise paragraph describing the current style>",
    "Improvement Suggestions": "1. <First suggestion> 2. <Second suggestion> 3. <Third suggestion>",
    "Eco-Friendly Home Decor Ideas": "1. <First idea name>: <Brief description>. Materials: <List materials>. Steps: <Brief steps>. <Optional: Tutorial link> 2. <Second idea following the same format> 3. <Third idea following the same format>"
}

Ensure that the response is a valid JSON object with no line breaks within each value.` }
                ]
            }
        ];

        const stream = streamGemini({
            model: 'gemini-1.5-pro',
            contents,
        });

        let buffer = [];
        showResults(true);

        for await (let chunk of stream) {
            buffer.push(chunk);
            try {
                const data = JSON.parse(buffer.join(''));

                for (let title in data) {
                    if (title === 'score') {
                        domScores.forEach(dom => dom.innerHTML = data.score);
                        domScorePct.forEach(dom => dom.setAttribute('style', `width: ${data.score}%`));
                    } else {
                        const description = data[title].replace(/(\s\d\.\s)/g, '<br />$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        domSuggestions.innerHTML = domSuggestions.innerHTML + getSuggestionTemplate({ title:title, description:description });
                    }
                }

                // Log the Data object to the console for easy access
                console.log('Data object:', Data);
            } catch (e) {
                console.log(e);
            } finally {
                loadingDiv.style.display = 'none';
                //domResults.style.display = 'block';
            }
        }
    } catch (e) {
        console.error('Error:', error);
        domResults.innerHTML = 'An error occurred while analyzing the image: ' + error.message;
    }
});

document.addEventListener('submit', function (event) {
    event.preventDefault();
});

goBack.addEventListener('click', function () {
    imagePreview.style.display = 'none';
    dragDropArea.style.display = 'block';
    uploadNewButton.style.display = 'none';
    imageUpload.value = '';
    domSuggestions.innerHTML = '';
    domScores.forEach(dom => dom.innerHTML = 'Calculating...');
    domScorePct.forEach(dom => dom.setAttribute('style', `width: 0%`));
    domResults.style.display = 'none';
    showResults(false);
});