// main.js
import { replaceChars, convertToList, clusterPreprocess, TextPreprocessor } from './preprocessing.js';

// DOM elements
const inputTextElement = document.getElementById('inputText');
const toLowerCaseCheckbox = document.getElementById('toLowerCase');
const originalCharInput = document.getElementById('originalChar');
const replacementCharInput = document.getElementById('replacementChar');
const addReplacementButton = document.getElementById('addReplacement');
const replacementListElement = document.getElementById('replacementList');
const separatorInput = document.getElementById('separator');
const addSeparatorButton = document.getElementById('addSeparator');
const separatorListElement = document.getElementById('separatorList');
const processButton = document.getElementById('processButton');
const outputResultElement = document.getElementById('outputResult');

// Data structures for user settings
let replacements = [];
let separators = [' ', ',', '.'];

// Display default separators
updateSeparatorsList();

// Event listeners for buttons
addReplacementButton.addEventListener('click', addReplacement);
addSeparatorButton.addEventListener('click', addSeparator);
processButton.addEventListener('click', processText);

// Function to add a character replacement
function addReplacement() {
    const original = originalCharInput.value;
    const replacement = replacementCharInput.value;
    
    if (original.length > 0) {
        replacements.push([original, replacement]);
        updateReplacementsList();
        originalCharInput.value = '';
        replacementCharInput.value = '';
    }
}

// Function to add a separator
function addSeparator() {
    const separator = separatorInput.value;
    
    if (separator.length > 0 && !separators.includes(separator)) {
        separators.push(separator);
        updateSeparatorsList();
        separatorInput.value = '';
    }
}

// Updates the display of the replacement list
function updateReplacementsList() {
    replacementListElement.innerHTML = '';
    
    replacements.forEach((replacement, index) => {
        const item = document.createElement('div');
        item.innerHTML = `
            <span>${replacement[0]} → ${replacement[1]}</span>
            <button class="remove-btn" data-type="replacement" data-index="${index}">Remove</button>
        `;
        replacementListElement.appendChild(item);
    });
    
    // Event listeners for remove buttons
    document.querySelectorAll('.remove-btn[data-type="replacement"]').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            replacements.splice(index, 1);
            updateReplacementsList();
        });
    });
}

// Updates the display of the separator list
function updateSeparatorsList() {
    separatorListElement.innerHTML = '';
    
    separators.forEach((separator, index) => {
        const item = document.createElement('div');
        const displayText = separator === ' ' ? '␣ (Space)' : separator;
        
        item.innerHTML = `
            <span>${displayText}</span>
            <button class="remove-btn" data-type="separator" data-index="${index}">Remove</button>
        `;
        separatorListElement.appendChild(item);
    });
    
    // Event listeners for remove buttons
    document.querySelectorAll('.remove-btn[data-type="separator"]').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            separators.splice(index, 1);
            updateSeparatorsList();
        });
    });
}

// Main function for text processing
function processText() {
    const inputText = inputTextElement.value;
    
    if (!inputText.trim()) {
        outputResultElement.textContent = 'Please enter a text.';
        return;
    }
    
    // Create a TextPreprocessor with user settings
    const preprocessor = new TextPreprocessor({
        separators: separators,
        charsToReplace: replacements,
        toLowerCase: toLowerCaseCheckbox.checked
    });
    
    // Process the text
    const tokens = preprocessor.process(inputText);
    
    // Display the result
    outputResultElement.textContent = JSON.stringify(tokens, null, 2);
}

// Console output to confirm that the script has loaded
console.log('Text Preprocessing Demo loaded');