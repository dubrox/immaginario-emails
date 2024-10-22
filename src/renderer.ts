const parseButton = document.getElementById('parse-button') as HTMLButtonElement;
const copyButton = document.getElementById('copy-button') as HTMLButtonElement;
const saveButton = document.getElementById('save-button') as HTMLButtonElement;
const loadButton = document.getElementById('load-button') as HTMLButtonElement;
const emailInput = document.getElementById('email-input') as HTMLTextAreaElement;
const statusText = document.getElementById('status-text') as HTMLDivElement;

const { ipcRenderer, clipboard } = require('electron');

parseButton.addEventListener('click', () => {
  const rawText = emailInput.value;
  const emails = splitEmails(rawText);

  // Explicitly specify the type of the arrays
  const invalidEmails: string[] = [];
  const validEmails: string[] = [];

  emails.forEach((email) => {
    if (validateEmail(email)) {
      validEmails.push(email);
    } else {
      invalidEmails.push(email);
    }
  });

  if (invalidEmails.length > 0) {
    statusText.innerHTML = `I seguenti indirizzi sono da correggere:<br>${invalidEmails
      .map(
        (email) =>
          `<a href="#" class="invalid-email">${escapeHtml(email)}</a>`
      )
      .join('<br>')}`;
    copyButton.disabled = true;
    saveButton.disabled = true;
    addInvalidEmailClickHandlers(invalidEmails);
  } else {
    // No invalid emails, proceed to remove duplicates and sort
    const uniqueEmails = Array.from(new Set(validEmails));
    uniqueEmails.sort();
    emailInput.value = uniqueEmails.join(',\n');
    statusText.innerText = 'Tutte le email sono valide, eventuali duplicati sono stati rimossi, e la lista è stata ordinata alfabeticamente.';
    copyButton.disabled = false;
    saveButton.disabled = false;
  }
});

copyButton.addEventListener('click', () => {
  clipboard.writeText(emailInput.value);
  statusText.innerText = 'Lista copiata e pronta da incollare.';
});

saveButton.addEventListener('click', async () => {
  const data = emailInput.value;
  const result = await ipcRenderer.invoke('save-file', data);
  if (result.success) {
    statusText.innerText = 'Lista salvata.';
  }
});

loadButton.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('load-file');
  if (result.success) {
    emailInput.value = result.data;
    statusText.innerText = 'Lista caricata.';
  }
});

function splitEmails(text: string): string[] {
  // Split emails by commas, semicolons, and line breaks
  return text
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

function validateEmail(email: string): boolean {
  // Regex to validate emails with optional display names and angle brackets
  const emailRegex = /^((?:"[^"]+"|[^",\s<>]+)\s*<\s*)?[^@<\s]+@[^@<\s]+\.[^@<\s]+(\s*>)?$/;
  return emailRegex.test(email);
}

function addInvalidEmailClickHandlers(invalidEmails: string[]) {
  const invalidEmailElements = document.querySelectorAll('.invalid-email');
  invalidEmailElements.forEach((element, index) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      highlightEmailInTextarea(invalidEmails[index]);
    });
  });
}

function highlightEmailInTextarea(email: string) {
  const text = emailInput.value;
  const startIndex = text.indexOf(email);
  if (startIndex !== -1) {
    emailInput.focus();
    emailInput.setSelectionRange(startIndex, startIndex + email.length);
    const lineHeight = 16; // Adjust this value based on your font size
    const lineNumber = text.substr(0, startIndex).split('\n').length - 1;
    emailInput.scrollTop = lineNumber * lineHeight;
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe.replace(/[&<"']/g, function (m) {
    switch (m) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '"':
        return '&quot;';
      default:
        return '&#039;';
    }
  });
}
