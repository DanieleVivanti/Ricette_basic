// Gestione del modal
const modal = document.getElementById('recipeModal');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const closeBtn = document.querySelector('.close');
const recipeForm = document.getElementById('recipeForm');
const recipesContainer = document.getElementById('recipesContainer');
const imagePreview = document.getElementById('imagePreview');
const recipeImageInput = document.getElementById('recipeImage');

// Array per memorizzare le ricette
let recipes = [];

// Carica le ricette dal localStorage all'avvio
function loadRecipes() {
    try {
        const savedRecipes = localStorage.getItem('recipes');
        console.log('Dati salvati trovati:', savedRecipes);
        
        if (savedRecipes) {
            recipes = JSON.parse(savedRecipes);
            console.log('Ricette caricate:', recipes);
        } else {
            console.log('Nessuna ricetta trovata nel localStorage');
            recipes = [];
        }
    } catch (error) {
        console.error('Errore nel caricamento delle ricette:', error);
        recipes = [];
    }
}

// Funzione per inizializzare gli event listener
function initializeEventListeners() {
    // Apri il modal
    addRecipeBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        recipeForm.reset();
        imagePreview.innerHTML = '';
    });

    // Chiudi il modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Chiudi il modal quando si clicca fuori
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Anteprima immagine
    recipeImageInput.addEventListener('change', handleImagePreview);

    // Gestione del form
    recipeForm.addEventListener('submit', handleFormSubmit);
}

// Gestione dell'anteprima immagine
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('L\'immagine è troppo grande. Dimensione massima: 5MB');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Anteprima">`;
        };
        reader.onerror = () => {
            alert('Errore durante la lettura dell\'immagine');
        };
        reader.readAsDataURL(file);
    }
}

// Gestione del submit del form
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form inviato');

    try {
        // Disabilita il pulsante di salvataggio
        const saveButton = document.querySelector('.save-recipe-btn');
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvataggio...';

        // Raccogli i dati del form
        const recipeName = document.getElementById('recipeName').value.trim();
        const recipeImage = imagePreview.querySelector('img')?.src || '';
        const recipeIngredients = document.getElementById('recipeIngredients').value.trim();
        const recipeInstructions = document.getElementById('recipeInstructions').value.trim();

        console.log('Dati del form:', {
            name: recipeName,
            hasImage: !!recipeImage,
            ingredients: recipeIngredients,
            instructions: recipeInstructions
        });

        // Validazione
        if (!recipeName || !recipeIngredients || !recipeInstructions) {
            alert('Tutti i campi sono obbligatori');
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save"></i> Salva Ricetta';
            return;
        }

        if (!recipeImage) {
            alert('È necessario caricare un\'immagine');
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save"></i> Salva Ricetta';
            return;
        }

        // Crea l'oggetto ricetta
        const recipe = {
            id: Date.now(),
            name: recipeName,
            image: recipeImage,
            ingredients: recipeIngredients,
            instructions: recipeInstructions
        };

        console.log('Nuova ricetta creata:', recipe);

        // Aggiungi la ricetta all'array
        recipes.push(recipe);
        console.log('Array recipes aggiornato:', recipes);

        // Salva le ricette
        if (saveRecipes()) {
            console.log('Ricetta salvata con successo');
            // Aggiorna la visualizzazione
            displayRecipes();
            // Chiudi il modal
            modal.style.display = 'none';
            // Resetta il form
            recipeForm.reset();
            imagePreview.innerHTML = '';
            // Mostra conferma
            alert('Ricetta salvata con successo!');
        } else {
            console.error('Errore nel salvataggio della ricetta');
            alert('Errore nel salvataggio della ricetta');
        }
    } catch (error) {
        console.error('Errore durante il salvataggio della ricetta:', error);
        alert('Si è verificato un errore durante il salvataggio della ricetta');
    } finally {
        // Riabilita il pulsante di salvataggio
        const saveButton = document.querySelector('.save-recipe-btn');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save"></i> Salva Ricetta';
        }
    }
}

// Salva le ricette nel localStorage
function saveRecipes() {
    try {
        console.log('Tentativo di salvataggio delle ricette:', recipes);
        
        // Verifica che recipes sia un array
        if (!Array.isArray(recipes)) {
            console.error('recipes non è un array:', recipes);
            return false;
        }

        // Converti in stringa JSON
        const recipesString = JSON.stringify(recipes);
        console.log('Stringa JSON da salvare:', recipesString);

        // Salva nel localStorage
        localStorage.setItem('recipes', recipesString);

        // Verifica che il salvataggio sia avvenuto
        const savedData = localStorage.getItem('recipes');
        console.log('Dati salvati nel localStorage:', savedData);

        if (savedData === recipesString) {
            console.log('Salvataggio completato con successo');
            return true;
        } else {
            console.error('Errore nella verifica del salvataggio');
            return false;
        }
    } catch (error) {
        console.error('Errore nel salvataggio delle ricette:', error);
        alert('Si è verificato un errore durante il salvataggio delle ricette');
        return false;
    }
}

// Visualizza le ricette
function displayRecipes() {
    try {
        console.log('Visualizzazione ricette. Numero ricette:', recipes.length);
        recipesContainer.innerHTML = '';
        
        if (recipes.length === 0) {
            recipesContainer.innerHTML = `
                <div class="no-recipes">
                    <i class="fas fa-utensils"></i>
                    <p>Nessuna ricetta disponibile</p>
                    <button class="btn-primary" onclick="document.getElementById('addRecipeBtn').click()">
                        <i class="fas fa-plus"></i> Aggiungi la tua prima ricetta
                    </button>
                </div>
            `;
            return;
        }

        recipes.forEach((recipe, index) => {
            console.log(`Creazione card per ricetta ${index}:`, recipe);
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" onerror="this.src='placeholder.jpg'">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <p class="recipe-ingredients">${recipe.ingredients}</p>
                    <div class="card-actions">
                        <button class="btn-primary" onclick="showRecipeDetails(${recipe.id})">
                            <i class="fas fa-eye"></i> Visualizza
                        </button>
                        <button class="action-btn delete-btn" onclick="confirmDelete(${recipe.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            recipesContainer.appendChild(recipeCard);
        });
    } catch (error) {
        console.error('Errore durante la visualizzazione delle ricette:', error);
        alert('Si è verificato un errore durante la visualizzazione delle ricette');
    }
}

// Funzione per stampare la ricetta in PDF
function printRecipe(id) {
    try {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
            const element = document.createElement('div');
            element.innerHTML = `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h1 style="color: #2d3436; text-align: center; margin-bottom: 20px;">${recipe.name}</h1>
                    <img src="${recipe.image}" alt="${recipe.name}" style="width: 100%; max-height: 300px; object-fit: cover; margin-bottom: 20px;">
                    <div style="margin-bottom: 20px;">
                        <h2 style="color: #2d3436; margin-bottom: 10px;">Ingredienti</h2>
                        <p style="white-space: pre-line;">${recipe.ingredients}</p>
                    </div>
                    <div>
                        <h2 style="color: #2d3436; margin-bottom: 10px;">Istruzioni</h2>
                        <p style="white-space: pre-line;">${recipe.instructions}</p>
                    </div>
                </div>
            `;

            const opt = {
                margin: 1,
                filename: `${recipe.name}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
        }
    } catch (error) {
        console.error('Errore durante la generazione del PDF:', error);
        alert('Si è verificato un errore durante la generazione del PDF');
    }
}

// Funzione per condividere la ricetta via email
function shareRecipe(id) {
    try {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
            const subject = `Ricetta: ${recipe.name}`;
            const body = `
                Ecco la ricetta di ${recipe.name}:

                INGREDIENTI:
                ${recipe.ingredients}

                ISTRUZIONI:
                ${recipe.instructions}
            `;
            
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
        }
    } catch (error) {
        console.error('Errore durante la condivisione della ricetta:', error);
        alert('Si è verificato un errore durante la condivisione della ricetta');
    }
}

// Funzione per confermare l'eliminazione
function confirmDelete(id) {
    try {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
            if (confirm(`Sei sicuro di voler eliminare la ricetta "${recipe.name}"?`)) {
                deleteRecipe(id);
            }
        }
    } catch (error) {
        console.error('Errore durante la conferma di eliminazione:', error);
        alert('Si è verificato un errore durante l\'eliminazione della ricetta');
    }
}

// Funzione per eliminare la ricetta
function deleteRecipe(id) {
    try {
        // Filtra l'array delle ricette
        recipes = recipes.filter(recipe => recipe.id !== id);
        
        // Salva le modifiche
        if (saveRecipes()) {
            // Aggiorna la visualizzazione
            displayRecipes();
            // Chiudi il modal se aperto
            modal.style.display = 'none';
            
            // Mostra conferma
            alert('Ricetta eliminata con successo!');
        }
    } catch (error) {
        console.error('Errore durante l\'eliminazione della ricetta:', error);
        alert('Si è verificato un errore durante l\'eliminazione della ricetta');
    }
}

// Mostra i dettagli della ricetta
function showRecipeDetails(id) {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>${recipe.name}</h2>
            <img src="${recipe.image}" alt="${recipe.name}" style="width: 100%; max-height: 300px; object-fit: cover; margin: 1rem 0;">
            <div class="form-group">
                <h3>Ingredienti</h3>
                <p>${recipe.ingredients}</p>
            </div>
            <div class="form-group">
                <h3>Istruzioni</h3>
                <p>${recipe.instructions}</p>
            </div>
            <div class="action-buttons">
                <button class="action-btn print-btn" onclick="printRecipe(${recipe.id})">
                    <i class="fas fa-print"></i> Stampa PDF
                </button>
                <button class="action-btn share-btn" onclick="shareRecipe(${recipe.id})">
                    <i class="fas fa-envelope"></i> Condividi
                </button>
                <button class="action-btn delete-btn" onclick="confirmDelete(${recipe.id})">
                    <i class="fas fa-trash"></i> Elimina
                </button>
            </div>
            <button class="btn-primary" onclick="closeRecipeDetails()" style="margin-top: 1rem;">
                <i class="fas fa-times"></i> Chiudi
            </button>
        `;
        modal.style.display = 'block';
        
        document.querySelector('.close').addEventListener('click', closeRecipeDetails);
    }
}

// Chiudi i dettagli della ricetta
function closeRecipeDetails() {
    modal.style.display = 'none';
    // Ripristina il form originale
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h2>Nuova Ricetta</h2>
        <form id="recipeForm">
            <div class="form-group">
                <label for="recipeName">Nome Ricetta</label>
                <input type="text" id="recipeName" required>
            </div>
            <div class="form-group">
                <label for="recipeImage">Immagine</label>
                <input type="file" id="recipeImage" accept="image/*" required>
                <div id="imagePreview" class="image-preview"></div>
            </div>
            <div class="form-group">
                <label for="recipeIngredients">Ingredienti</label>
                <textarea id="recipeIngredients" required></textarea>
            </div>
            <div class="form-group">
                <label for="recipeInstructions">Istruzioni</label>
                <textarea id="recipeInstructions" required></textarea>
            </div>
            <button type="submit" class="btn-primary">Salva Ricetta</button>
        </form>
    `;
    // Reattiva gli event listener
    document.getElementById('recipeImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" alt="Anteprima">`;
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('recipeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const recipe = {
            id: Date.now(),
            name: document.getElementById('recipeName').value,
            image: document.getElementById('imagePreview').querySelector('img')?.src || '',
            ingredients: document.getElementById('recipeIngredients').value,
            instructions: document.getElementById('recipeInstructions').value
        };
        recipes.push(recipe);
        saveRecipes();
        displayRecipes();
        modal.style.display = 'none';
        document.getElementById('recipeForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
    });
}

// Inizializza l'applicazione
document.addEventListener('DOMContentLoaded', () => {
    console.log('Applicazione inizializzata');
    // Carica le ricette salvate
    loadRecipes();
    // Inizializza gli event listener
    initializeEventListeners();
    // Mostra le ricette
    displayRecipes();
}); 