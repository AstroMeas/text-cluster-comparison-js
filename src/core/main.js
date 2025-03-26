// main.js
import { replaceChars, convertToList, clusterPreprocess, TextPreprocessor } from './preprocessing.js';

// DOM-Elemente
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

// Datenstrukturen für Benutzereinstellungen
let replacements = [];
let separators = [' ', ',', '.'];

// Standard-Separatoren anzeigen
updateSeparatorsList();

// Event-Listener für Buttons
addReplacementButton.addEventListener('click', addReplacement);
addSeparatorButton.addEventListener('click', addSeparator);
processButton.addEventListener('click', processText);

// Funktion zum Hinzufügen einer Zeichenersetzung
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

// Funktion zum Hinzufügen eines Trennzeichens
function addSeparator() {
    const separator = separatorInput.value;
    
    if (separator.length > 0 && !separators.includes(separator)) {
        separators.push(separator);
        updateSeparatorsList();
        separatorInput.value = '';
    }
}

// Aktualisiert die Anzeige der Ersetzungsliste
function updateReplacementsList() {
    replacementListElement.innerHTML = '';
    
    replacements.forEach((replacement, index) => {
        const item = document.createElement('div');
        item.innerHTML = `
            <span>${replacement[0]} → ${replacement[1]}</span>
            <button class="remove-btn" data-type="replacement" data-index="${index}">Entfernen</button>
        `;
        replacementListElement.appendChild(item);
    });
    
    // Event-Listener für Entfernen-Buttons
    document.querySelectorAll('.remove-btn[data-type="replacement"]').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            replacements.splice(index, 1);
            updateReplacementsList();
        });
    });
}

// Aktualisiert die Anzeige der Trennzeichenliste
function updateSeparatorsList() {
    separatorListElement.innerHTML = '';
    
    separators.forEach((separator, index) => {
        const item = document.createElement('div');
        const displayText = separator === ' ' ? '␣ (Leerzeichen)' : separator;
        
        item.innerHTML = `
            <span>${displayText}</span>
            <button class="remove-btn" data-type="separator" data-index="${index}">Entfernen</button>
        `;
        separatorListElement.appendChild(item);
    });
    
    // Event-Listener für Entfernen-Buttons
    document.querySelectorAll('.remove-btn[data-type="separator"]').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            separators.splice(index, 1);
            updateSeparatorsList();
        });
    });
}

// Hauptfunktion zur Textverarbeitung
function processText() {
    const inputText = inputTextElement.value;
    
    if (!inputText.trim()) {
        outputResultElement.textContent = 'Bitte gib einen Text ein.';
        return;
    }
    
    // Erstelle einen TextPreprocessor mit den Benutzereinstellungen
    const preprocessor = new TextPreprocessor({
        separators: separators,
        charsToReplace: replacements,
        toLowerCase: toLowerCaseCheckbox.checked
    });
    
    // Verarbeite den Text
    const tokens = preprocessor.process(inputText);
    
    // Zeige das Ergebnis an
    outputResultElement.textContent = JSON.stringify(tokens, null, 2);
}

// Konsolenausgabe zur Bestätigung, dass das Skript geladen wurde
console.log('Text Preprocessing Demo geladen');