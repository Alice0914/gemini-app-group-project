const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: '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' });

const express = require('express');
const path = require('path')

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/generate', async (req, res) => {
  const text = req.body.text; 
  console.log(text)

  const speechFile = path.resolve("/home/user/test/speech.mp3");

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);

  console.log(`Audio file saved to ${speechFile}`);

  res.json({"msg": "Successfully generated audio file!"});
});

app.get('/api', (req, res) => {

  res.json({"msg": "Hello world"});
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})
