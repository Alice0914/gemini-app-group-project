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
const domDescriptions = document.querySelector('#result-descriptions');
const textareaDescription = document.getElementById('description');
const textareaResults = document.getElementById('description-results');
const textareaContent = textareaResults.querySelector('.content');

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                dragDropArea.style.display = 'none';
                analyzeButton.style.display = 'block';
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

uploadNewButton.addEventListener('click', event => {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    analyzeButton.style.display = 'none';
    uploadNewButton.style.display = 'none';
    dragDropArea.style.display = 'block';
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
    domDescriptions.style.display = 'none';

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

        const detailedPrompt = `Please analyze the interior design and give it a score out of 100. Describe the current style.
                                Suggest three improvement suggestions and eco-Ffiendly home decor ideas. Output your result in JSON 
                                format. The JSON object should have the following fields: score, Current Style, Improvement Suggestions, and 
                                Eco-Friendly Home Decor Ideas. The score field should be an integer. All other fields should be strings.
                                Ensure that the response is a valid JSON object with no line breaks within each value.
                                Here are some examples:
                                Example 2:
                                {
                                    "score": 80,
                                    "Current Style": "The living room exhibits a contemporary design with a well-coordinated color scheme. It features sleek furniture, a balanced layout, and tasteful decorative elements. The space feels inviting and harmonious, with a good mix of textures and materials.",
                                    "Improvement Suggestions": "1. Add a statement art piece: Introduce a large, eye-catching artwork to create a focal point and inject personality. 2. Enhance lighting: Incorporate layered lighting with a mix of ambient, task, and accent lights to create depth and mood. 3. Introduce natural elements: Bring in indoor plants or natural wood accents to add warmth and organic texture to the space.",
                                    "Eco-Friendly Home Decor Ideas": "1. Vintage Book Planter: Transform old hardcover books into unique planters. Materials: Old hardcover books, utility knife, plastic liner, soil, succulents. Steps: Hollow out book pages, insert plastic liner, add soil and plants. Tutorial: https://www.apartmenttherapy.com/how-to-make-a-book-planter-234719 2. Repurposed Window Frame Mirror: Convert an old window frame into a decorative mirror. Materials: Old window frame, mirror glass, adhesive. Steps: Clean frame, cut mirror to fit, attach mirror to frame. Guide: https://www.bobvila.com/articles/diy-mirror-frame/ 3. Eco-friendly Wall Hanging: Create a wall hanging using natural materials. Materials: Driftwood or branch, yarn, beads. Steps: Wrap yarn around branch, create hanging strands with knots and beads. Instructions: https://www.ehow.com/how_7694461_make-driftwood-wall-hanging.html"
                                }

                                Example 3:
                                { 
                                    "score": 70,
                                    "Current Style": "The room displays a casual contemporary style with a neutral color palette. It features basic furnishings and shows some attempt at cohesion, but lacks depth and personal touches. The overall look is pleasant but somewhat generic.",
                                    "Improvement Suggestions": "1. Add texture: Incorporate various textures through throw pillows, area rugs, and window treatments to add visual interest and depth. 2. Introduce accent colors: Use artwork, decorative objects, or textiles to bring in pops of color that complement the existing neutral tones. 3. Personalize the space: Display personal items, family photos, or unique collectibles to give the room more character and reflect the occupants' personality.",
                                    "Eco-Friendly Home Decor Ideas": "1. Upcycled Pallet Coffee Table: Create a rustic coffee table from a wooden pallet. Materials: Wooden pallet, sandpaper, wood stain, casters. Steps: Sand pallet, apply stain, attach casters. Tutorial: https://www.bobvila.com/articles/diy-pallet-coffee-table/ 2. Mason Jar Wall Sconces: Transform mason jars into charming wall-mounted lights. Materials: Mason jars, pipe clamps, wooden board, candles or LED lights. Steps: Attach jars to board using pipe clamps, add lighting. Guide: https://www.countryliving.com/diy-crafts/how-to/g3388/mason-jar-crafts/ 3. Fabric Scrap Throw Pillow: Make decorative pillows from fabric scraps. Materials: Fabric scraps, sewing machine, pillow stuffing. Steps: Sew fabric pieces together, create pillow cover, stuff and close. Instructions: https://www.thesprucecrafts.com/make-patchwork-throw-pillows-2978070"
                                }

                                Example 4:
                                {
                                    "score": 60,
                                    "Current Style": "The space has a basic, somewhat disjointed appearance. There's a mix of furniture styles without a clear theme, and the room lacks a cohesive color scheme. The overall impression is that of a space in transition, with potential for improvement.",
                                    "Improvement Suggestions": "1. Define a color scheme: Choose a consistent palette to tie the room together and guide future purchases. 2. Create a focal point: Add a statement piece like a large artwork or an eye-catching furniture item to anchor the room. 3. Improve furniture arrangement: Rearrange furniture to create better flow and define functional areas within the space.",
                                    "Eco-Friendly Home Decor Ideas": "1. Recycled Bottle Vases: Transform glass bottles into elegant vases. Materials: Glass bottles, spray paint, twine. Steps: Clean bottles, spray paint, wrap with twine for added texture. Tutorial: https://www.goodhousekeeping.com/home/craft-ideas/how-to/g139/bottle-crafts-0409/ 2. Cardboard Box Storage Ottomans: Convert sturdy cardboard boxes into functional storage ottomans. Materials: Cardboard boxes, fabric, foam padding, glue. Steps: Cover boxes with padding and fabric, add a lid. Guide: https://www.hgtv.com/design/make-and-celebrate/handmade/how-to-make-an-ottoman-from-a-cardboard-box 3. Tin Can Herb Garden: Create a vertical herb garden using tin cans. Materials: Tin cans, paint, soil, herbs, mounting materials. Steps: Paint cans, drill drainage holes, mount, plant herbs. Instructions: https://www.gardenersworld.com/how-to/diy/how-to-make-a-vertical-garden-for-herbs/"
                                }

                                Example 5:
                                {
                                    "score": 50,
                                    "Current Style": "The room appears unfinished and lacks a coherent style. Furniture placement seems random, and there's a noticeable absence of decorative elements and personal touches. The space feels bare and uninviting, with little attention to design principles.",
                                    "Improvement Suggestions": "1. Establish a layout: Rearrange furniture to create conversation areas and improve flow throughout the space. 2. Add soft furnishings: Introduce curtains, rugs, and throw pillows to soften the space and add comfort and color. 3. Incorporate wall decor: Hang artwork, mirrors, or shelving to fill empty wall spaces and add visual interest.",
                                    "Eco-Friendly Home Decor Ideas": "1. Pallet Wood Wall Art: Create a rustic wall piece using reclaimed pallet wood. Materials: Pallet wood, sandpaper, paint or stain, nails. Steps: Disassemble pallet, arrange wood pieces, paint or stain, mount on wall. Tutorial: https://www.thesprucecrafts.com/pallet-projects-for-the-home-4138372 2. T-shirt Yarn Rug: Turn old t-shirts into a unique area rug. Materials: Old t-shirts, large crochet hook or loom. Steps: Cut t-shirts into strips, join strips, crochet or weave into a rug. Guide: https://www.instructables.com/T-Shirt-Rug/ 3. Wine Cork Board: Make a functional bulletin board from wine corks. Materials: Wine corks, picture frame, glue. Steps: Arrange corks in frame, glue in place. Instructions: https://www.hgtv.com/design/make-and-celebrate/handmade/how-to-make-a-cork-bulletin-board"
                                }

                                Example 6:
                                {
                                    "score": 40,
                                    "Current Style": "The space appears neglected and poorly planned. There's a lack of essential furniture, and what's present seems mismatched and poorly maintained. The room lacks any discernible style or theme, giving an impression of disorganization and neglect.",
                                    "Improvement Suggestions": "1. Invest in key pieces: Add essential furniture items like a proper sofa, coffee table, and storage units to establish basic functionality. 2. Implement a color scheme: Choose a simple color palette to guide your design choices and create visual cohesion. 3. Deep clean and organize: Thoroughly clean the space and organize existing items to create a fresh canvas for improvements.",
                                    "Eco-Friendly Home Decor Ideas": "1. Cardboard Box Shelving: Create modular shelving units from sturdy cardboard boxes. Materials: Cardboard boxes, glue, paint or contact paper. Steps: Reinforce boxes, decorate exterior, stack and secure. Tutorial: https://www.1001pallets.com/cardboard-shelves/ 2. Plastic Bottle Vertical Garden: Turn plastic bottles into hanging planters. Materials: Plastic bottles, rope, soil, small plants. Steps: Cut bottles, drill holes, thread rope, fill with soil and plants. Guide: https://www.gardeningknowhow.com/special/containers/plastic-bottle-vertical-garden.htm 3. Newspaper Basket: Weave old newspapers into a decorative basket. Materials: Newspapers, glue, paint. Steps: Roll newspaper into tubes, weave into basket shape, paint or varnish. Instructions: https://www.thesprucecrafts.com/weave-a-basket-from-newspaper-4125743"
                                }

                                `;

        const contents = [
            {
                role: 'user',
                parts: [
                    { inline_data: { mime_type: file.type, data: imageBase64 } },
                    { text: detailedPrompt }
                ]
            }
        ];

        const stream = streamGemini({
            model: 'gemini-1.5-flash',
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
                goBack.style.display = 'block';
            }
        }
        domDescriptions.style.display = 'block';
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
    analyzeButton.style.display = 'none';
    imageUpload.value = '';
    domSuggestions.innerHTML = '';
    domScores.forEach(dom => dom.innerHTML = 'Calculating...');
    domScorePct.forEach(dom => dom.setAttribute('style', `width: 0%`));
    domResults.style.display = 'none';
    goBack.style.display = 'none';
    showResults(false);
});

const history = () => {
    let current = 0;
    let data = [];

    return {
        setCurrent: c => current = c,
        getCurrent: () => current,
        setData: d => { 
            data.push(d); 
            current = data.length - 1; 
        },
        getNext: () => data[current+1] ? data[++current] : false,
        getPrev: () => data[current-1] ? data[--current] : false,
        hasNext: () => data[current+1] ? true : false,
        hasPrev: () => data[current-1] ? true : false
    }
};

const _history = history();

document.getElementById('btn-compare').addEventListener('click', compareDescriptions);
textareaResults.style.display = 'none';
const btnHistoryPrev = textareaResults.querySelector('#btn-history-prev');
const btnHistoryNext = textareaResults.querySelector('#btn-history-next');
btnHistoryPrev.style.display = 'none';
btnHistoryNext.style.display = 'none';
btnHistoryPrev.addEventListener('click', function () {
    updateImageResults(_history.getPrev());
});
btnHistoryNext.addEventListener('click', function () {
    updateImageResults(_history.getNext());
});

const updateImageResults = data => {
    btnHistoryPrev.style.display = _history.hasPrev() ? 'block' : 'none';
    btnHistoryNext.style.display = _history.hasNext() ? 'block' : 'none';
    
    if (textareaContent) textareaContent.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div class="result-item-image">
                <img src="${item[0]}" />
            </div>
        `;
        
        textareaContent.appendChild(div);
    });
    textareaResults.style.display = 'block';
};

function compareDescriptions(e) {
    fetch('/compare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description: textareaDescription.value })
    })
    .then(response => response.json())
    .then(data => {
        _history.setData(data);
        updateImageResults(data);
        textareaDescription.value = "";
    });
}

document.getElementById('btn-reset').addEventListener('click', function (e) {
    textareaDescription.value = "";
    textareaContent.innerHTML = "";
    textareaResults.style.display = 'none';
});

const modal = document.getElementById('myModal');
const modalImg = modal.querySelector('img');
const closeBtn = document.querySelector('.close');

textareaResults.addEventListener('click', function (e) {
    e.stopPropagation();
    if (e.target.tagName === 'IMG') {
        modal.style.display = 'flex';
        modal.classList.remove('hide');
        modalImg.src = e.target.src;
    }
});

// Close modal when clicking on the close button
closeBtn.onclick = function() {
    modal.style.display = 'none';
}

// Close modal when clicking outside the modal content
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}