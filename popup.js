const responseDiv = document.getElementById('response');
const inputField = document.getElementById('input-field');
const submitButton = document.getElementById('submit-button');

submitButton.addEventListener('click', () => {
  const prompt = inputField.value;
  chrome.runtime.sendMessage({ prompt }, (response) => {
    responseDiv.textContent = response.answer;
  });
});

// Connect to the background script
const backgroundPort = chrome.runtime.connect({ name: 'popupToBackground' });

// Listen for messages from the background script
backgroundPort.onMessage.addListener((message) => {
  if (message.action === 'displayResponse') {
    responseDiv.textContent = message.data;
  }
});

