exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `
      <html>
        <head><title>Test Function</title></head>
        <body>
          <h1>Netlify Function Test</h1>
          <p>This function is working!</p>
          <p>Path: ${event.path}</p>
          <p>Query: ${JSON.stringify(event.queryStringParameters)}</p>
        </body>
      </html>
    `,
  };
};
