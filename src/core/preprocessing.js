/**
 * Text preprocessing module optimized for clustering algorithms
 * Provides string manipulation, tokenization, and dual representation (strings and hashes)
 * for improved performance in text analysis applications.
 */

/**
 * A simple and fast string hashing function (djb2)
 * @param {string} str - String to hash
 * @returns {number} - 32-bit integer hash value
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + char code
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to 32-bit unsigned integer
}

/**
 * Replaces specified characters in a text using a mapping
 * @param {string} text - The input text where characters will be replaced
 * @param {Array<Array<string>>} charsToReplace - A list of [original_char, replacement_char] arrays
 * @returns {string} The text with characters replaced according to the provided mapping
 */
export function replaceChars(text, charsToReplace = null) {
  if (!charsToReplace || charsToReplace.length === 0) {
    return text;
  }
  
  let result = text;
  
  // Apply each replacement
  for (const [original, replacement] of charsToReplace) {
    // Use global regular expression to replace all occurrences
    const regex = new RegExp(escapeRegExp(original), 'g');
    result = result.replace(regex, replacement);
  }
  
  return result;
}

/**
 * Helper function to escape special characters in regular expressions
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
  // Escape special characters that have meaning in regular expressions
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Tokenizes text by splitting it based on specified separators
 * @param {string} text - The input text to be processed
 * @param {Array<string>} separators - A list of separator characters used to split the text
 * @param {boolean} charByChar - If true, each character will be treated as a separate token
 * @returns {Array<string>} A list of cleaned and tokenized strings
 */
export function tokenize(text, separators = [' ', ',', '.'], charByChar = false) {
  // If character by character splitting is requested, return each character as a token
  if (charByChar) {
    return text.split('').filter(char => char.trim().length > 0);
  }
  
  // Start with the original text in an array
  let result = [text];
  
  // Process each separator
  for (const separator of separators) {
    try {
      // Use flatMap to handle nested arrays
      result = result.flatMap(part => part.split(separator));
    } catch (e) {
      // Silent error handling
    }
  }
  
  // Remove empty strings and trim whitespace
  result = result
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return result;
}

/**
 * Preprocesses text and returns both string tokens and hash values
 * @param {string} text - The input text to be preprocessed
 * @param {Array<string>} separators - A list of separator characters used to split the text
 * @param {Array<Array<string>>} charsToReplace - A list of [original_char, replacement_char] arrays
 * @param {boolean} charByChar - If true, each character will be treated as a separate token
 * @returns {Object} An object containing both string tokens and their hash representations
 */
export function preprocessText(text, separators = [' ', ',', '.'], charsToReplace = null, charByChar = false) {
  // Handle non-string input
  if (typeof text !== 'string') {
    text = String(text);
  }
  
  // Apply character replacements
  const processedText = replaceChars(text, charsToReplace);
  
  // Tokenize the text
  const stringTokens = tokenize(processedText, separators, charByChar);
  
  // Create hash values for faster operations
  const hashTokens = stringTokens.map(token => hashString(token));
  
  // Create token-to-hash mapping for quick lookups
  const tokenToHash = {};
  const hashToToken = {};
  
  stringTokens.forEach((token, index) => {
    const hash = hashTokens[index];
    tokenToHash[token] = hash;
    hashToToken[hash] = token;
  });
  
  return {
    originalText: text,
    processedText: processedText,
    stringTokens: stringTokens,
    hashTokens: hashTokens,
    tokenToHash: tokenToHash,
    hashToToken: hashToToken,
    tokenCount: stringTokens.length
  };
}

/**
 * Creates a frequency map from tokens
 * @param {Array<string|number>} tokens - Array of tokens (either strings or hash values)
 * @returns {Object} A map of token to frequency
 */
export function createFrequencyMap(tokens) {
  const freqMap = {};
  
  for (const token of tokens) {
    freqMap[token] = (freqMap[token] || 0) + 1;
  }
  
  return freqMap;
}

/**
 * Creates a position index for tokens
 * @param {Array<string|number>} tokens - Array of tokens (either strings or hash values)
 * @returns {Object} A map of token to array of positions
 */
export function createPositionIndex(tokens) {
  const posIndex = {};
  
  tokens.forEach((token, position) => {
    if (!posIndex[token]) {
      posIndex[token] = [];
    }
    posIndex[token].push(position);
  });
  
  return posIndex;
}

/**
 * TextProcessor class provides an object-oriented interface for text preprocessing operations
 * with both string and hash representations for optimized performance
 */
export class TextProcessor {
  /**
   * Creates a new TextProcessor instance
   * @param {Object} options - Configuration options
   * @param {Array<string>} [options.defaultSeparators=[' ', ',', '.']] - Default separators to use
   * @param {Array<Array<string>>} [options.defaultReplacements=[]] - Default character replacements
   * @param {boolean} [options.characterByCharacter=false] - Whether to tokenize character by character
   */
  constructor({
    defaultSeparators = [' ', ',', '.'],
    defaultReplacements = [],
    characterByCharacter = false
  } = {}) {
    this.defaultSeparators = defaultSeparators;
    this.defaultReplacements = defaultReplacements;
    this.characterByCharacter = characterByCharacter;
  }
  
  /**
   * Replace characters in text
   * @param {string} text - Input text
   * @param {Array<Array<string>>} [replacements=this.defaultReplacements] - Character replacements
   * @returns {string} - Text with replacements applied
   */
  replaceChars(text, replacements = this.defaultReplacements) {
    return replaceChars(text, replacements);
  }
  
  /**
   * Tokenize text into an array of strings
   * @param {string} text - Input text
   * @param {Array<string>} [separators=this.defaultSeparators] - Separators for tokenization
   * @param {boolean} [charByChar=this.characterByCharacter] - Whether to tokenize character by character
   * @returns {Array<string>} - Array of tokens
   */
  tokenize(text, separators = this.defaultSeparators, charByChar = this.characterByCharacter) {
    return tokenize(text, separators, charByChar);
  }
  
  /**
   * Process text and create dual representation (strings and hashes)
   * @param {string} text - Input text
   * @param {Array<string>} [separators=this.defaultSeparators] - Separators for tokenization
   * @param {Array<Array<string>>} [replacements=this.defaultReplacements] - Character replacements
   * @param {boolean} [charByChar=this.characterByCharacter] - Whether to tokenize character by character
   * @returns {Object} - Processed text with string and hash representations
   */
  process(text, separators = this.defaultSeparators, replacements = this.defaultReplacements, charByChar = this.characterByCharacter) {
    return preprocessText(text, separators, replacements, charByChar);
  }
  
  /**
   * Process two texts and prepare them for comparison or clustering
   * @param {string} text1 - First input text
   * @param {string} text2 - Second input text
   * @param {Array<string>} [separators=this.defaultSeparators] - Separators for tokenization
   * @param {Array<Array<string>>} [replacements=this.defaultReplacements] - Character replacements
   * @param {boolean} [charByChar=this.characterByCharacter] - Whether to tokenize character by character
   * @returns {Object} - Object containing processed versions of both texts
   */
  processTextsForComparison(text1, text2, separators = this.defaultSeparators, replacements = this.defaultReplacements, charByChar = this.characterByCharacter) {
    const processed1 = this.process(text1, separators, replacements, charByChar);
    const processed2 = this.process(text2, separators, replacements, charByChar);
    
    return {
      text1: processed1,
      text2: processed2,
      // Some convenience properties for comparison
      text1Length: processed1.stringTokens.length,
      text2Length: processed2.stringTokens.length
    };
  }
  
  /**
   * Creates index structures for faster operations on processed text
   * @param {Object} processedText - Result from process() method
   * @returns {Object} - The input object enhanced with index structures
   */
  createIndexes(processedText) {
    // Using hash tokens for performance
    processedText.frequencyMap = createFrequencyMap(processedText.hashTokens);
    processedText.positionIndex = createPositionIndex(processedText.hashTokens);
    
    return processedText;
  }
}

/**
 * Converts a string to a list of tokens based on separators
 * @param {string} text - Input text
 * @param {Array<string>} separators - Characters to use as separators
 * @returns {Array<string>} - List of tokens
 */
export function convertToList(text, separators = [' ', ',', '.']) {
  return tokenize(text, separators);
}

/**
 * Preprocesses text specifically for clustering algorithms
 * @param {string} text - Input text
 * @param {Object} options - Processing options
 * @returns {Object} - Processed text data ready for clustering
 */
export function clusterPreprocess(text, options = {}) {
  // Default options
  const defaultOptions = {
    toLowerCase: true,
    separators: [' ', ',', '.', '!', '?', ';', ':', '\n', '\t'],
    replacements: [],
    removeStopwords: false
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  // Apply lowercase if requested
  let processedText = text;
  if (mergedOptions.toLowerCase) {
    processedText = processedText.toLowerCase();
  }

  // Create a processed text object
  const result = preprocessText(
    processedText, 
    mergedOptions.separators, 
    mergedOptions.replacements
  );

  // Add frequency information
  result.frequencies = createFrequencyMap(result.stringTokens);

  return result;
}

/**
 * TextPreprocessor class designed specifically for the web demo
 * with simplifications for easier usage in the UI
 */
export class TextPreprocessor {
  /**
   * Creates a new TextPreprocessor instance
   * @param {Object} options - Configuration options
   * @param {Array<string>} [options.separators=[' ', ',', '.']] - Separators for tokenization
   * @param {Array<Array<string>>} [options.charsToReplace=[]] - Character replacements
   * @param {boolean} [options.toLowerCase=false] - Whether to convert text to lowercase
   */
  constructor({
    separators = [' ', ',', '.'],
    charsToReplace = [],
    toLowerCase = false
  } = {}) {
    this.separators = separators;
    this.charsToReplace = charsToReplace;
    this.toLowerCase = toLowerCase;
  }

  /**
   * Process text and return tokens
   * @param {string} text - Input text to process
   * @returns {Array<string>} - Array of processed tokens
   */
  process(text) {
    // Apply lowercase if requested
    let processedText = text;
    if (this.toLowerCase) {
      processedText = processedText.toLowerCase();
    }

    // Apply character replacements
    processedText = replaceChars(processedText, this.charsToReplace);

    // Tokenize the text
    return tokenize(processedText, this.separators);
  }
}