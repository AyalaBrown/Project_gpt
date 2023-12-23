const express = require('express');
require('dotenv').config();

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/prompts', (req, res) => {
  const runPrompt = async () => {
    const userInput = req.body["prompt-input"];
    const prompt = `
    I'm creating AI blessings, please give me 3 blessings for ${userInput}. 
    Also, return the response in a parsable JSON format like follow:
    {
      "1":"...",
      "2":"...",
      "3":"..."
    }
    `;

    const response = await openai.completions.create({
      model:'text-davinci-003',
      prompt:prompt,
      max_tokens:100,
    });

    const parsableJSONresponse = response.choices[0].text;

    console.log('response text: ', parsableJSONresponse)

    let parsedResponse;
    try{
        parsedResponse = JSON.parse(parsableJSONresponse);
    }catch(error) {
      console.error("Error parsing JSON response", error);
      return {};
    }
    console.log(parsedResponse)
    console.log("prompt 1: ", parsedResponse["1"])
    console.log("prompt 2: ", parsedResponse["2"])
    console.log("prompt 3: ", parsedResponse["3"])

    return {parsedResponse};
  }


  runPrompt().then(({parsedResponse}) => {
    console.log(parsedResponse);
    // console.log(Object.keys(parsedResponse).length);
    if(parsedResponse && Object.keys(parsedResponse).length>0) {
      res.render('index', {content: 'prompts', response: parsedResponse, error: undefined});
    }else {
      res.render('index', {content: 'prompts', response: undefined, error: 'Unable to parse response from OpenAi.'});
    }
  });
});

app.listen(process.env.PORT, (req, res) => {
  console.log(`listening on ${process.env.PORT}....`);
})

