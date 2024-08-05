function compareDescriptions() {
    const description = document.getElementById('description').value;

    fetch('/compare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description: description })
    })
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <img src="${item[0]}" alt="Image"><br>
                <p>Similarity: ${item[1].toFixed(4)}</p>
                <button onclick="window.open('${item[0]}', '_blank')">Download Image</button>
            `;
            resultsDiv.appendChild(div);
        });
    });
}

function generateImage() {
    const prompt = document.getElementById('description').value;

    fetch('/generate_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt })
    })
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById('results');
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <img src="${data.image_url}" alt="Generated Image"><br>
            <p>Generated Image:</p>
            <button onclick="window.open('${data.image_url}', '_blank')">Download Image</button>
        `;
        resultsDiv.appendChild(div);
    });
}

function refreshPage() {
    document.getElementById('description').value = '';
    document.getElementById('results').innerHTML = '';
}
