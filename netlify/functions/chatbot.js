const https = require('https');

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const userQuestion = body.question;
    
    const dataString = JSON.stringify({
        prompt: `Answer the following question about energy bills: ${userQuestion}`,
        temperature: 0.5,
        max_tokens: 100,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        model: "gpt-3.5-turbo-instruct"
    });

    const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let response = '';
            res.on('data', (chunk) => {
                response += chunk;
            });
            res.on('end', () => {
                const responseData = JSON.parse(response);
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ answer: responseData.choices[0].text })
                });
            });
        });

        req.on('error', (error) => {
            reject({ statusCode: 500, body: JSON.stringify({ error: error.message }) });
        });

        req.write(dataString);
        req.end();
    });
};
