const defaultEntries = [
    { number: "hi", url: "copy text here", special: "this is a test" },
    { number: "here", url: "this is", special: "text here" },
];

// Load entries from localStorage if available, otherwise use default
let entries = [];
const savedEntries = localStorage.getItem('entries');
if (savedEntries) {
    try {
        entries = JSON.parse(savedEntries);
    } catch (e) {
        entries = [...defaultEntries];
    }
} else {
    entries = [...defaultEntries];
}

// DOM elements
const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('resultsList');
const specialList = document.getElementById('specialList');
const specialMenu = document.getElementById('specialMenu');
const addMoreBtn = document.getElementById('addMoreBtn');
const addEntryForm = document.getElementById('addEntryForm');
const newNumber = document.getElementById('newNumber');
const newUrl = document.getElementById('newUrl');
const newSpecial = document.getElementById('newSpecial');
const saveEntryBtn = document.getElementById('saveEntryBtn');
const cancelEntryBtn = document.getElementById('cancelEntryBtn');
const themeBtn = document.getElementById('themeBtn');
const themeSelector = document.getElementById('themeSelector');
const themeOptions = document.querySelectorAll('.theme-option');
const clearBtn = document.getElementById('clearBtn');
const showDeleteBtn = document.getElementById('showDeleteBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const exportFileBtn = document.getElementById('exportFileBtn');
const importFileBtn = document.getElementById('importFileBtn');
const importForm = document.getElementById('importForm');
const importData = document.getElementById('importData');
const confirmImportBtn = document.getElementById('confirmImportBtn');
const cancelImportBtn = document.getElementById('cancelImportBtn');
const notification = document.getElementById('notification');
const editModeBtn = document.getElementById('editModeBtn');
const editEntryForm = document.getElementById('editEntryForm');
const editNumber = document.getElementById('editNumber');
const editUrl = document.getElementById('editUrl');
const editSpecial = document.getElementById('editSpecial');
const updateEntryBtn = document.getElementById('updateEntryBtn');
const cancelEditEntryBtn = document.getElementById('cancelEditEntryBtn');
let deleteMode = false;
let editMode = false;
let entryBeingEdited = null;

// Initially hide the forms, but keep special menu visible
addEntryForm.style.display = 'none';
themeSelector.style.display = 'none';
importForm.style.display = 'none';

// Initial render of all entries
renderEntries(entries);

// Add event listeners
searchInput.addEventListener('input', handleSearch);
addMoreBtn.addEventListener('click', toggleAddEntryForm);
saveEntryBtn.addEventListener('click', saveNewEntry);
cancelEntryBtn.addEventListener('click', toggleAddEntryForm);
themeBtn.addEventListener('click', toggleThemeSelector);
clearBtn.addEventListener('click', clearSearch);
showDeleteBtn.addEventListener('click', toggleDeleteMode);
exportBtn.addEventListener('click', exportEntries);
importBtn.addEventListener('click', toggleImportForm);
exportFileBtn.addEventListener('click', exportEntriesToFile);
importFileBtn.addEventListener('click', importEntriesFromFile);
confirmImportBtn.addEventListener('click', importEntries);
cancelImportBtn.addEventListener('click', toggleImportForm);
editModeBtn.addEventListener('click', toggleEditMode);
updateEntryBtn.addEventListener('click', updateEntry);
cancelEditEntryBtn.addEventListener('click', hideEditEntryForm);

// Add event listeners to theme options
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        changeTheme(theme);
        toggleThemeSelector();
    });
});

// Load saved theme from localStorage if available
loadSavedTheme();

/**
 * Load saved theme from localStorage
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
    // The default is gold theme (no class needed)
}

/**
 * Change website theme
 * @param {string} theme - Theme name
 */
function changeTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    
    // Add class for selected theme (if not gold which is default)
    if (theme !== 'gold') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('selectedTheme', theme);
    
    // Update active state on theme options
    themeOptions.forEach(option => {
        const optionTheme = option.getAttribute('data-theme');
        if (optionTheme === theme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

/**
 * Toggle the visibility of the theme selector
 */
function toggleThemeSelector() {
    // Hide add entry form if it's open
    addEntryForm.style.display = 'none';
    
    const isVisible = themeSelector.style.display === 'block';
    
    if (isVisible) {
        themeSelector.style.display = 'none';
    } else {
        themeSelector.style.display = 'block';
    }
}

/**
 * Toggle the visibility of the add entry form
 */
function toggleAddEntryForm() {
    // Hide theme selector if it's open
    themeSelector.style.display = 'none';
    
    const isVisible = addEntryForm.style.display === 'block';
    
    if (isVisible) {
        addEntryForm.style.display = 'none';
        // Clear form fields when closing
        newNumber.value = '';
        newUrl.value = '';
        newSpecial.value = '';
    } else {
        addEntryForm.style.display = 'block';
        // Focus on the first field
        newNumber.focus();
    }
}

/**
 * Save a new entry from the form
 */
function saveNewEntry() {
    const number = newNumber.value.trim();
    const url = newUrl.value.trim();
    const special = newSpecial.value.trim();
    
    // Validate required fields
    if (!number) {
        showNotification('Please enter a number', 1500);
        newNumber.focus();
        return;
    }
    
    if (!url) {
        showNotification('Please enter a URL', 1500);
        newUrl.focus();
        return;
    }
    
    // Create new entry
    const newEntry = {
        number: number,
        url: url
    };
    
    // Add special text if provided
    if (special) {
        newEntry.special = special;
    }
    
    // Add to beginning of entries array
    entries.unshift(newEntry);
    
    // Save to localStorage
    localStorage.setItem('entries', JSON.stringify(entries));
    
    // Re-render the list and close the form
    renderEntries(entries);
    toggleAddEntryForm();
    
    // Show notification
    showNotification('New entry added successfully!');
}

/**
 * Handle search functionality
 */
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Clear both lists
    resultsList.innerHTML = '';
    specialList.innerHTML = '';
    
    if (searchTerm === '') {
        // If search is empty, show all entries without highlighting
        renderEntries(entries);
        // Keep the special menu visible
        return;
    }
    
    // Filter entries based on search term
    const filteredEntries = entries.filter(entry => 
        entry.number.toLowerCase().includes(searchTerm) || 
        entry.url.toLowerCase().includes(searchTerm) ||
        (entry.special && entry.special.toLowerCase().includes(searchTerm))
    );
    
    // Render filtered entries with highlighting
    renderEntries(filteredEntries, searchTerm);
}

/**
 * Format special text with hashtags styled properly
 * @param {string} text - Special text to format
 * @param {string} highlightTerm - Term to highlight (optional)
 * @returns {string} - Formatted HTML
 */
function formatSpecialText(text, highlightTerm = '') {
    if (!text) return '';
    
    // First highlight any search terms
    let formattedText = highlightMatch(text, highlightTerm);
    
    // Check if the text starts with a hashtag
    if (formattedText.startsWith('#')) {
        // Find where the hashtag ends (at space or end of string)
        const spaceIndex = formattedText.indexOf(' ');
        if (spaceIndex === -1) {
            // The entire text is a hashtag
            return `<span class="hashtag">${formattedText}</span>`;
        } else {
            // Extract hashtag and rest of text
            const hashtag = formattedText.substring(0, spaceIndex);
            const restOfText = formattedText.substring(spaceIndex);
            return `<span class="hashtag">${hashtag}</span>${restOfText}`;
        }
    }
    
    return formattedText;
}

/**
 * Render entries to the DOM
 * @param {Array} entriesToRender - Entries to be displayed
 * @param {string} highlightTerm - Term to highlight (optional)
 */
function renderEntries(entriesToRender, highlightTerm = '') {
    // Clear current results
    resultsList.innerHTML = '';
    specialList.innerHTML = '';
    
    // Split entries into regular and special
    const regularEntries = entriesToRender.filter(entry => !entry.special);
    const specialEntries = entriesToRender.filter(entry => entry.special);
    
    // Handle empty results
    if (entriesToRender.length === 0) {
        resultsList.innerHTML = '<li class="result-item">No matching entries found</li>';
        specialMenu.style.display = 'none';
        return;
    }
    
    // Show/hide special menu based on whether there are special entries
    specialMenu.style.display = specialEntries.length > 0 ? 'block' : 'none';
    
    // Render regular entries
    if (regularEntries.length === 0 && highlightTerm) {
        resultsList.innerHTML = '<li class="result-item">No regular entries match your search</li>';
    } else {
        regularEntries.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.className = 'result-item';
            
            const numberSpan = document.createElement('span');
            numberSpan.className = 'number';
            numberSpan.innerHTML = highlightMatch(entry.number, highlightTerm);
            
            const linkContainer = document.createElement('div');
            linkContainer.className = 'link-container';
            
            const linkText = document.createElement('span');
            linkText.className = 'link-text';
            linkText.innerHTML = highlightMatch(entry.url, highlightTerm);
            
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-btn';
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', () => copyToClipboard(entry.url));
            
            linkContainer.appendChild(linkText);
            linkContainer.appendChild(copyButton);
            
            listItem.appendChild(numberSpan);
            listItem.appendChild(linkContainer);
            
            // Add delete button if in delete mode
            if (deleteMode) {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteEntry(entry));
                listItem.appendChild(deleteButton);
            }
            
            // Add edit button if in edit mode
            if (editMode) {
                const editButton = document.createElement('button');
                editButton.className = 'edit-btn';
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => showEditEntryForm(entry));
                listItem.appendChild(editButton);
            }
            
            resultsList.appendChild(listItem);
        });
    }
    
    // Render special entries
    specialEntries.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.className = 'special-entry-item';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'special-number';
        numberSpan.innerHTML = highlightMatch(entry.number, highlightTerm);
        
        const linkSpan = document.createElement('span');
        linkSpan.className = 'special-link';
        linkSpan.innerHTML = highlightMatch(entry.url, highlightTerm);
        
        const textSpan = document.createElement('span');
        textSpan.className = 'special-text';
        textSpan.innerHTML = formatSpecialText(entry.special, highlightTerm);
        
        const copyButton = document.createElement('button');
        copyButton.className = 'special-copy-btn';
        copyButton.textContent = 'Copy Link';
        // Copy only URL when button is clicked
        copyButton.addEventListener('click', () => {
            copyToClipboard(entry.url);
        });
        
        listItem.appendChild(numberSpan);
        listItem.appendChild(linkSpan);
        listItem.appendChild(textSpan);
        listItem.appendChild(copyButton);
        
        // Add delete button if in delete mode
        if (deleteMode) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteEntry(entry));
            listItem.appendChild(deleteButton);
        }
        
        // Add edit button if in edit mode
        if (editMode) {
            const editButton = document.createElement('button');
            editButton.className = 'edit-btn';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => showEditEntryForm(entry));
            listItem.appendChild(editButton);
        }
        
        specialList.appendChild(listItem);
    });
}

/**
 * Highlight matching parts of text
 * @param {string} text - Text to check for matches
 * @param {string} term - Term to highlight
 * @returns {string} - Text with highlighted HTML
 */
function highlightMatch(text, term) {
    if (!term) return text;
    
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);
    
    if (index === -1) return text;
    
    const beforeMatch = text.substring(0, index);
    const match = text.substring(index, index + term.length);
    const afterMatch = text.substring(index + term.length);
    
    return `${beforeMatch}<span class="highlight">${match}</span>${afterMatch}`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    // Use modern Clipboard API if available, otherwise fallback to the old approach
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Visual feedback for successful copy
                const activeButton = document.activeElement;
                const originalText = activeButton.textContent;
                
                activeButton.textContent = 'Copied!';
                activeButton.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    activeButton.textContent = originalText;
                    activeButton.style.backgroundColor = '';
                }, 1500);
            })
            .catch(err => {
                showNotification('Failed to copy text: ' + err.message, 1500);
                console.error('Failed to copy text: ', err);
                
                // Fallback to old method
                copyToClipboardFallback(text);
            });
    } else {
        copyToClipboardFallback(text);
    }
}

/**
 * Fallback method for copying to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboardFallback(text) {
    try {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = text;
        tempTextarea.setAttribute('readonly', '');
        tempTextarea.style.position = 'absolute';
        tempTextarea.style.left = '-9999px';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        
        if (successful) {
            // Visual feedback for successful copy
            const activeButton = document.activeElement;
            const originalText = activeButton.textContent;
            
            activeButton.textContent = 'Copied!';
            activeButton.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                activeButton.textContent = originalText;
                activeButton.style.backgroundColor = '';
            }, 1500);
        } else {
            showNotification('Failed to copy text', 1500);
        }
    } catch (err) {
        showNotification('Failed to copy text: ' + err.message, 1500);
        console.error('Failed to copy text: ', err);
    }
}

/**
 * Clear the search input and reset display
 */
function clearSearch() {
    searchInput.value = '';
    renderEntries(entries);
    searchInput.focus();
}

function toggleDeleteMode() {
    deleteMode = !deleteMode;
    renderEntries(entries);
    showDeleteBtn.classList.toggle('active', deleteMode);
    showDeleteBtn.textContent = deleteMode ? 'done' : 'delete';
}

function deleteEntry(entry) {
    // Implement the logic to delete the entry from the entries array and update localStorage
    entries = entries.filter(e => e.number !== entry.number);
    localStorage.setItem('entries', JSON.stringify(entries));
    renderEntries(entries);
}

/**
 * Toggle the visibility of the import form
 */
function toggleImportForm() {
    // Hide other forms if they're open
    addEntryForm.style.display = 'none';
    themeSelector.style.display = 'none';
    
    const isVisible = importForm.style.display === 'block';
    
    if (isVisible) {
        importForm.style.display = 'none';
        importData.value = '';
    } else {
        importForm.style.display = 'block';
        importData.focus();
    }
}

/**
 * Show a confirmation dialog with custom UI
 * @param {string} message - The message to display
 * @param {function} onConfirm - Function to call when confirmed
 */
function showConfirmation(message, onConfirm) {
    // Create confirmation container
    const confirmContainer = document.createElement('div');
    confirmContainer.className = 'confirmation-dialog';
    
    // Create message element
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    
    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'confirmation-buttons';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Yes';
    confirmBtn.className = 'confirm-btn';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'No';
    cancelBtn.className = 'cancel-btn';
    
    // Add event listeners
    confirmBtn.addEventListener('click', () => {
        document.body.removeChild(confirmContainer);
        onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(confirmContainer);
    });
    
    // Assemble the dialog
    buttonContainer.appendChild(confirmBtn);
    buttonContainer.appendChild(cancelBtn);
    confirmContainer.appendChild(messageEl);
    confirmContainer.appendChild(buttonContainer);
    
    // Show the dialog
    document.body.appendChild(confirmContainer);
}

/**
 * Show a notification message that fades after 0.5 seconds
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 500)
 */
function showNotification(message, duration = 500) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

/**
 * Export entries to a file that can be downloaded
 */
function exportEntriesToFile() {
    try {
        if (!entries || entries.length === 0) {
            showNotification('No entries to export', 1500);
            return;
        }
        const dataToExport = JSON.stringify(entries, null, 2);
        const filename = 'entries_export_' + new Date().toISOString().slice(0,10) + '.json';
        // Android Chrome workaround
        if (navigator.userAgent.toLowerCase().includes('android')) {
            const blob = new Blob([dataToExport], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            showNotification('Entries exported to a file successfully!');
            return;
        }
        // Default
        const blob = new Blob([dataToExport], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        showNotification('Entries exported to a file successfully!');
    } catch (error) {
        showNotification('Error exporting data: ' + error.message, 1500);
    }
}

/**
 * Import entries from a file
 */
function importEntriesFromFile() {
    try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,application/json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) {
                document.body.removeChild(fileInput);
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    let importedEntries = JSON.parse(e.target.result);
                    if (!Array.isArray(importedEntries)) {
                        showNotification('Invalid import data format - not an array', 1500);
                        document.body.removeChild(fileInput);
                        return;
                    }
                    showConfirmation(`This will REPLACE all current entries with ${importedEntries.length} imported entries. Continue?`, () => {
                        try {
                            entries = importedEntries;
                            localStorage.setItem('entries', JSON.stringify(entries));
                            renderEntries(entries);
                            showNotification(`Import successful! Replaced all entries with ${importedEntries.length} imported entries.`);
                        } catch (importError) {
                            showNotification('Error during import: ' + importError.message, 1500);
                        }
                    });
                } catch (error) {
                    showNotification('Error processing file: ' + error.message, 1500);
                } finally {
                    document.body.removeChild(fileInput);
                }
            };
            reader.onerror = function() {
                showNotification('Error reading file', 1500);
                document.body.removeChild(fileInput);
            };
            reader.readAsText(file);
        });
        fileInput.click();
        setTimeout(() => {
            if (document.body.contains(fileInput)) {
                document.body.removeChild(fileInput);
            }
        }, 60000);
    } catch (error) {
        showNotification('Error importing file: ' + error.message, 1500);
    }
}

/**
 * Export entries to a JSON string that can be copied and used for import
 */
function exportEntries() {
    try {
        const dataToExport = JSON.stringify(entries);
        
        // Use modern Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataToExport)
                .then(() => {
                    showNotification('Export data copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    
                    // Fallback to old method
                    const tempTextarea = document.createElement('textarea');
                    tempTextarea.value = dataToExport;
                    document.body.appendChild(tempTextarea);
                    tempTextarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempTextarea);
                    
                    showNotification('Export data copied to clipboard!');
                });
        } else {
            // Fallback for browsers that don't support clipboard API
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = dataToExport;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(tempTextarea);
            
            if (successful) {
                showNotification('Export data copied to clipboard!');
            } else {
                showNotification('Failed to copy export data', 1500);
            }
        }
    } catch (error) {
        showNotification('Error exporting data: ' + error.message, 1500);
    }
}

/**
 * Import entries from a JSON string
 */
function importEntries() {
    try {
        const dataToImport = importData.value.trim();
        if (!dataToImport) {
            showNotification('Please paste exported data first!', 1500);
            return;
        }
        let importedEntries;
        try {
            importedEntries = JSON.parse(dataToImport);
        } catch (parseError) {
            showNotification('Invalid JSON format: ' + parseError.message, 1500);
            console.error('JSON parse error:', parseError);
            return;
        }
        if (!Array.isArray(importedEntries)) {
            showNotification('Invalid import data format - not an array', 1500);
            return;
        }
        if (importedEntries.length === 0) {
            showNotification('No entries found in imported data', 1500);
            return;
        }
        showConfirmation(`This will REPLACE all current entries with ${importedEntries.length} imported entries. Continue?`, () => {
            try {
                entries = importedEntries;
                localStorage.setItem('entries', JSON.stringify(entries));
                renderEntries(entries);
                toggleImportForm();
                showNotification(`Import successful! Replaced all entries with ${importedEntries.length} imported entries.`);
            } catch (importError) {
                showNotification('Error during import: ' + importError.message, 1500);
                console.error('Import error:', importError);
            }
        });
    } catch (error) {
        showNotification('Error importing data: ' + error.message, 1500);
        console.error('Import error:', error);
    }
}

function toggleEditMode() {
    editMode = !editMode;
    renderEntries(entries);
    editModeBtn.classList.toggle('active', editMode);
    editModeBtn.textContent = editMode ? 'done' : 'edit';
}

function showEditEntryForm(entry) {
    entryBeingEdited = entry;
    editNumber.value = entry.number;
    editUrl.value = entry.url;
    editSpecial.value = entry.special || '';
    editEntryForm.classList.add('active');
}

function hideEditEntryForm() {
    entryBeingEdited = null;
    editEntryForm.classList.remove('active');
}

function updateEntry() {
    if (!entryBeingEdited) return;
    const number = editNumber.value.trim();
    const url = editUrl.value.trim();
    const special = editSpecial.value.trim();
    if (!number) {
        showNotification('Please enter a number', 1500);
        editNumber.focus();
        return;
    }
    if (!url) {
        showNotification('Please enter a URL', 1500);
        editUrl.focus();
        return;
    }
    // Update entry in entries array
    const idx = entries.findIndex(e => e.number === entryBeingEdited.number && e.url === entryBeingEdited.url);
    if (idx !== -1) {
        entries[idx] = { number, url };
        if (special) entries[idx].special = special;
    }
    localStorage.setItem('entries', JSON.stringify(entries));
    renderEntries(entries);
    hideEditEntryForm();
    showNotification('Entry updated successfully!');
}

// Use touch events for buttons for better mobile support
[...document.querySelectorAll('button')].forEach(btn => {
    btn.addEventListener('touchstart', e => { btn.classList.add('active'); });
    btn.addEventListener('touchend', e => { btn.classList.remove('active'); });
}); 