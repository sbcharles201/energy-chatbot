const https = require('https');

exports.handler = async (event) => {
    console.log("Received event:", event);

    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://sbcharles201.github.io",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: "",
        };
    }

    // Validate and parse request body
    if (!event.body) {
        console.error("No request body");
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "https://sbcharles201.github.io",
            },
            body: JSON.stringify({ error: "No request body" }),
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "https://sbcharles201.github.io",
            },
            body: JSON.stringify({ error: "Error parsing JSON input" }),
        };
    }

    // Construct OpenAI API request
    const userQuestion = body.question;
    const dataString = JSON.stringify({
        prompt: `Answer the following question about energy bills: ${userQuestion}`,
        temperature: 0.5,
        max_tokens: 500,
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

    // Make API request and handle response
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let response = '';
            res.on('data', (chunk) => {
                response += chunk;
            });
            res.on('end', () => {
                try {
                    const responseData = JSON.parse(response);
                    resolve({
                        statusCode: 200,
                        headers: {
                            "Access-Control-Allow-Origin": "https://sbcharles201.github.io",
                        },
                        body: JSON.stringify({ answer: responseData.choices[0].text })
                    });
                } catch (error) {
                    console.error("Error parsing OpenAI response:", error);
                    reject({
                        statusCode: 500,
                        headers: {
                            "Access-Control-Allow-Origin": "https://sbcharles201.github.io",
                        },
                        body: JSON.stringify({ error: "Failed to process the request" })
                    });
                }
            });
        });

        req.on('error', (error) => {
            console.error("Request error:", error);
            reject({
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "https://sbcharles201.github.io",
                },
                body: JSON.stringify({ error: error.message })
            });
        });

        req.write(dataString);
        req.end();
    });
};
