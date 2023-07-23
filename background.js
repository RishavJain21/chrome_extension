const GPT_API_KEY = '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'; // Replace with your GPT-3.5 API key
const GPT_API_ENDPOINT = 'https://api.openai.com/v1/engines/davinci-codex/completions';

// Listen for connections from the popup script
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popupToBackground') {
    port.onMessage.addListener((message) => {
      if (message.prompt) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          if (tab && tab.url) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: () => document.documentElement.outerHTML
              },
              (results) => {
                if (!results || results.length === 0 || !results[0].result) {
                  port.postMessage({ action: 'displayResponse', data: 'Error: Unable to retrieve tab content.' });
                  return;
                }

                const pageContent = results[0].result;
                const promptWithTabData = `${message.prompt}\n\nCurrent Tab URL: ${tab.url}\nTitle: ${tab.title}\nPage Content: ${pageContent}`;

                const requestOptions = {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GPT_API_KEY}`
                  },
                  body: JSON.stringify({
                    prompt: promptWithTabData,
                    max_tokens: 100
                  })
                };

                fetch(GPT_API_ENDPOINT, requestOptions)
                  .then((response) => response.json())
                  .then((data) => {
                    const answer = data.choices[0]?.text.trim() || 'No response from GPT.';
                    
                    // Send the response to the popup with the correct object structure
                    port.postMessage({ action: 'displayResponse', data: answer });
                  })
                  .catch((error) => {
                    port.postMessage({ action: 'displayResponse', data: 'Error fetching data from GPT.' });
                  });
              }
            );
          }
        });
      }
    });
  }
});
