/* ===================================
   REGISTRATION FORM - COMPLETE LOGIC WITH RECAPTCHA
   =================================== */

// --- CONFIGURAZIONE CREDENZIALI ---
const SUPABASE_URL = 'https://yndffeyiekjqescytuga.supabase.co';
const SUPABASE_KEY = 'sb_publishable_woI-SCX19NQlipA2q-1luA_BGAlfDHy';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Credenziali EmailJS
const EMAILJS_SERVICE_ID = 'service_5kkxosd';
const EMAILJS_TEMPLATE_ID = 'template_pu3kmwh';

// --- INIZIALIZZAZIONE ---
document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);
    setupFormValidation();
});

let currentStep = 1;
const totalSteps = 4;

// Riferimenti DOM
const form = document.getElementById('registrationForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');

// ===================================
// 1. NAVIGAZIONE STEP
// ===================================
window.changeStep = function(n) {
    // Se si va avanti, valida lo step corrente
    if (n === 1 && !validateStep(currentStep)) return false;
    
    currentStep += n;
    showStep(currentStep);
    updateProgressBar(currentStep);
    
    // Se arriviamo al riepilogo, popola i dati
    if (currentStep === 3) updateReview();
    
    // Scroll in alto
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function showStep(step) {
    // Nascondi tutti gli step
    document.querySelectorAll('.form-step').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    // Mostra step corrente
    if (step < 4) {
        const activeStep = document.querySelector(`.form-step[data-step="${step}"]`);
        if (activeStep) {
            activeStep.style.display = 'block';
            activeStep.classList.add('active');
        }
    }

    // Gestione Bottoni
    if (step === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    } else if (step === 2) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    } else if (step === 3) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        document.getElementById('buttonGroup').style.display = 'none';
    }
}

// ===================================
// 2. PROGRESS BAR
// ===================================
function updateProgressBar(step) {
    const steps = document.querySelectorAll('.progress-steps .step');
    const progressLine = document.getElementById('progressLine');
    
    steps.forEach((s, index) => {
        const stepNum = index + 1;
        if (stepNum < step) {
            s.classList.add('completed');
            s.classList.remove('active');
        } else if (stepNum === step) {
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });
    
    const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
    progressLine.style.width = progressPercent + '%';
}

// ===================================
// 3. VALIDAZIONE RAFFORZATA
// ===================================
function setupFormValidation() {
    // Validazione real-time per email
    const emailInput = document.getElementById('referenteEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
    }

    // Validazione real-time per telefono
    const phoneInput = document.getElementById('referentePhone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            validatePhone(this);
        });
    }

    // Validazione real-time per nome squadra
    const teamNameInput = document.getElementById('teamName');
    if (teamNameInput) {
        teamNameInput.addEventListener('blur', function() {
            validateTeamName(this);
        });
    }
}

function validateStep(step) {
    let valid = true;
    const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
    
    // Reset errori
    errorMessage.classList.remove('active');
    inputs.forEach(input => {
        input.style.borderColor = 'var(--grey-light)';
    });
    
    // Check campi vuoti
    inputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
            input.style.borderColor = 'red';
        }
    });

    // VALIDAZIONE SPECIFICA PER STEP 1 (Dati Squadra)
    if (step === 1) {
        const teamName = document.getElementById('teamName');
        const category = document.getElementById('category');
        const refName = document.getElementById('referenteName');
        const refEmail = document.getElementById('referenteEmail');
        const refPhone = document.getElementById('referentePhone');

        // Validazione nome squadra
        if (!validateTeamName(teamName)) {
            valid = false;
        }

        // Validazione categoria
        if (!category.value) {
            valid = false;
            category.style.borderColor = 'red';
        }

        // Validazione nome referente
        if (!validateFullName(refName)) {
            valid = false;
        }

        // Validazione email
        if (!validateEmail(refEmail)) {
            valid = false;
        }

        // Validazione telefono
        if (!validatePhone(refPhone)) {
            valid = false;
        }
    }

    // VALIDAZIONE SPECIFICA PER STEP 2 (Giocatori)
    if (step === 2) {
        let playersValid = true;
        
        // Controlla i primi 3 giocatori (obbligatori)
        for (let i = 1; i <= 3; i++) {
            const nameInput = document.getElementsByName(`player${i}Name`)[0];
            const birthInput = document.getElementsByName(`player${i}Birth`)[0];

            if (!nameInput.value.trim()) {
                playersValid = false;
                nameInput.style.borderColor = 'red';
            } else if (!validateFullName(nameInput)) {
                playersValid = false;
            }

            if (!birthInput.value) {
                playersValid = false;
                birthInput.style.borderColor = 'red';
            } else if (!validateBirthDate(birthInput)) {
                playersValid = false;
            }
        }

        // Controlla giocatori 4 e 5 (opzionali, ma se uno è compilato, entrambi i campi devono esserlo)
        for (let i = 4; i <= 5; i++) {
            const nameInput = document.getElementsByName(`player${i}Name`)[0];
            const birthInput = document.getElementsByName(`player${i}Birth`)[0];

            const hasName = nameInput.value.trim() !== '';
            const hasBirth = birthInput.value !== '';

            if (hasName && !hasBirth) {
                playersValid = false;
                birthInput.style.borderColor = 'red';
                showErrorMessage('Se inserisci un giocatore opzionale, compila anche la data di nascita.');
            } else if (!hasName && hasBirth) {
                playersValid = false;
                nameInput.style.borderColor = 'red';
                showErrorMessage('Se inserisci una data di nascita, compila anche il nome del giocatore.');
            } else if (hasName && hasBirth) {
                if (!validateFullName(nameInput)) playersValid = false;
                if (!validateBirthDate(birthInput)) playersValid = false;
            }
        }

        valid = playersValid;
    }

    if (!valid && !errorMessage.classList.contains('active')) {
        showErrorMessage('Per favore, compila tutti i campi obbligatori correttamente.');
    }
    
    return valid;
}

// ===================================
// 4. FUNZIONI DI VALIDAZIONE SINGOLE
// ===================================

function validateTeamName(input) {
    const value = input.value.trim();
    
    // Minimo 3 caratteri, massimo 50
    if (value.length < 3) {
        input.style.borderColor = 'red';
        showErrorMessage('Il nome della squadra deve contenere almeno 3 caratteri.');
        return false;
    }
    
    if (value.length > 50) {
        input.style.borderColor = 'red';
        showErrorMessage('Il nome della squadra non può superare i 50 caratteri.');
        return false;
    }

    // Controllo caratteri speciali pericolosi
    const dangerousChars = /[<>{}[\]\\]/;
    if (dangerousChars.test(value)) {
        input.style.borderColor = 'red';
        showErrorMessage('Il nome della squadra contiene caratteri non validi.');
        return false;
    }
    
    input.style.borderColor = 'var(--cyan)';
    return true;
}

function validateFullName(input) {
    const value = input.value.trim();
    
    // Minimo 2 caratteri (nome + cognome)
    if (value.length < 2) {
        input.style.borderColor = 'red';
        showErrorMessage('Inserisci nome e cognome completi.');
        return false;
    }

    // Deve contenere almeno uno spazio (nome + cognome)
    if (!value.includes(' ')) {
        input.style.borderColor = 'red';
        showErrorMessage('Inserisci nome e cognome (es. Mario Rossi).');
        return false;
    }

    // Solo lettere, spazi, apostrofi e accenti
    const nameRegex = /^[a-zA-ZàèéìòùÀÈÉÌÒÙ' ]+$/;
    if (!nameRegex.test(value)) {
        input.style.borderColor = 'red';
        showErrorMessage('Il nome può contenere solo lettere, spazi e apostrofi.');
        return false;
    }

    input.style.borderColor = 'var(--cyan)';
    return true;
}

function validateEmail(input) {
    const value = input.value.trim();
    
    // Regex email più rigorosa
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(value)) {
        input.style.borderColor = 'red';
        showErrorMessage('Inserisci un indirizzo email valido (es. nome@esempio.it).');
        return false;
    }

    // Controlla che non ci siano spazi
    if (value.includes(' ')) {
        input.style.borderColor = 'red';
        showErrorMessage('L\'email non può contenere spazi.');
        return false;
    }

    // Controlla lunghezza massima
    if (value.length > 100) {
        input.style.borderColor = 'red';
        showErrorMessage('L\'email è troppo lunga.');
        return false;
    }

    input.style.borderColor = 'var(--cyan)';
    return true;
}

function validatePhone(input) {
    const value = input.value.trim();
    
    // Rimuovi spazi e caratteri comuni per validazione
    const cleanPhone = value.replace(/[\s\-()]/g, '');
    
    // Deve essere un numero
    if (!/^\+?\d+$/.test(cleanPhone)) {
        input.style.borderColor = 'red';
        showErrorMessage('Il numero di telefono può contenere solo cifre, spazi, +, -, ().');
        return false;
    }

    // Lunghezza tra 9 e 15 cifre (standard internazionale)
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        input.style.borderColor = 'red';
        showErrorMessage('Inserisci un numero di telefono valido (9-15 cifre).');
        return false;
    }

    input.style.borderColor = 'var(--cyan)';
    return true;
}

function validateBirthDate(input) {
    const value = input.value;
    
    if (!value) {
        input.style.borderColor = 'red';
        return false;
    }

    const birthDate = new Date(value);
    const today = new Date();
    const minDate = new Date(1920, 0, 1);
    
    // Data non può essere nel futuro
    if (birthDate > today) {
        input.style.borderColor = 'red';
        showErrorMessage('La data di nascita non può essere nel futuro.');
        return false;
    }

    // Data non può essere prima del 1920
    if (birthDate < minDate) {
        input.style.borderColor = 'red';
        showErrorMessage('Inserisci una data di nascita valida.');
        return false;
    }

    // Calcola età
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    // Controllo età minima (5 anni per minibasket)
    if (age < 5) {
        input.style.borderColor = 'red';
        showErrorMessage('Il giocatore deve avere almeno 5 anni.');
        return false;
    }

    // Controllo età massima (100 anni)
    if (age > 100) {
        input.style.borderColor = 'red';
        showErrorMessage('Inserisci una data di nascita valida.');
        return false;
    }

    input.style.borderColor = 'var(--cyan)';
    return true;
}

// ===================================
// 5. RIEPILOGO
// ===================================
function updateReview() {
    const reviewContainer = document.getElementById('reviewContent');
    const teamName = document.getElementById('teamName').value;
    const category = document.getElementById('category').value;
    const refName = document.getElementById('referenteName').value;
    const refEmail = document.getElementById('referenteEmail').value;
    const refPhone = document.getElementById('referentePhone').value;

    // Raccogli giocatori
    let playersHTML = '';
    for (let i = 1; i <= 5; i++) {
        const nameInput = document.getElementsByName(`player${i}Name`)[0];
        const birthInput = document.getElementsByName(`player${i}Birth`)[0];
        
        if (nameInput && nameInput.value.trim()) {
            const birthDate = new Date(birthInput.value);
            const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            playersHTML += `
                <div class="review-item">
                    <span class="review-label">Giocatore ${i}:</span>
                    <span class="review-value">${nameInput.value} (${age} anni)</span>
                </div>
            `;
        }
    }

    const notes = document.getElementById('notes').value;
    
    reviewContainer.innerHTML = `
        <div class="review-section">
            <h3>🏀 Dati Squadra</h3>
            <div class="review-item">
                <span class="review-label">Nome Squadra:</span>
                <span class="review-value">${teamName}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Categoria:</span>
                <span class="review-value" style="text-transform: capitalize;">${category}</span>
            </div>
        </div>
        
        <div class="review-section" style="border-left-color: var(--purple);">
            <h3>👤 Referente</h3>
            <div class="review-item">
                <span class="review-label">Nome:</span>
                <span class="review-value">${refName}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Email:</span>
                <span class="review-value">${refEmail}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Telefono:</span>
                <span class="review-value">${refPhone}</span>
            </div>
        </div>
        
        <div class="review-section" style="border-left-color: var(--cyan);">
            <h3>⛹️ Giocatori</h3>
            ${playersHTML}
        </div>
        
        ${notes ? `
        <div class="review-section" style="border-left-color: var(--grey-light);">
            <h3>📝 Note</h3>
            <p style="color: var(--white-off);">${notes}</p>
        </div>
        ` : ''}
    `;
}

// SUBMIT CON RECAPTCHA
window.submitForm = async function() {
    const loading = document.getElementById('loading');
    const successCard = document.getElementById('successCard');
    const btnGroup = document.getElementById('buttonGroup');
    const formSteps = document.querySelectorAll('.form-step');

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        showErrorMessage('⚠️ Per favore, completa la verifica reCAPTCHA per dimostrare che non sei un robot.');
        window.scrollTo({ top: document.querySelector('.form-card').offsetTop - 100, behavior: 'smooth' });
        return;
    }

    if (!validateStep(3)) {
        grecaptcha.reset();
        return;
    }

    formSteps.forEach(step => step.style.display = 'none');
    btnGroup.style.display = 'none';
    loading.classList.add('active');
    errorMessage.classList.remove('active');

    const uniqueCode = 'CNO-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const teamName = document.getElementById('teamName').value.trim();
    const category = document.getElementById('category').value;
    const refName = document.getElementById('referenteName').value.trim();
    const refEmail = document.getElementById('referenteEmail').value.trim().toLowerCase();
    const refPhone = document.getElementById('referentePhone').value.trim();
    const notes = document.getElementById('notes').value.trim();

    const playersArray = [];
    for (let i = 1; i <= 5; i++) {
        const nameInput = document.getElementsByName(`player${i}Name`)[0];
        const birthInput = document.getElementsByName(`player${i}Birth`)[0];
        
        if (nameInput && nameInput.value.trim()) {
            playersArray.push({
                name: nameInput.value.trim(),
                birth: birthInput.value
            });
        }
    }

    try {
        console.log('📊 Tentativo salvataggio su Supabase...');
        const { data: dbData, error: dbError } = await supabaseClient
            .from('iscrizioni')
            .insert([
                {
                    registration_code: uniqueCode,
                    team_name: teamName,
                    category: category,
                    referente_name: refName,
                    referente_email: refEmail,
                    referente_phone: refPhone,
                    players: playersArray,
                    notes: notes || null,
                    recaptcha_verified: true
                }
            ])
            .select();

        if (dbError) {
            console.error('❌ Errore Database:', dbError);
            throw new Error('Errore nel salvataggio dei dati: ' + dbError.message);
        }

        console.log('✅ Dati salvati su Supabase:', dbData);

        console.log('📧 Tentativo invio email...');
        
        let playersList = '';
        playersArray.forEach((player, index) => {
            const birthDate = new Date(player.birth);
            const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            playersList += `${index + 1}. ${player.name} (${age} anni - nato il ${player.birth})\n`;
        });

        const templateParams = {
            registration_code: uniqueCode,
            team_name: teamName,
            category: category,
            ref_name: refName,
            ref_email: refEmail,
            ref_phone: refPhone,
            player1: playersArray[0] ? `${playersArray[0].name} (${playersArray[0].birth})` : '',
            player2: playersArray[1] ? `${playersArray[1].name} (${playersArray[1].birth})` : '',
            player3: playersArray[2] ? `${playersArray[2].name} (${playersArray[2].birth})` : '',
            player4: playersArray[3] ? `${playersArray[3].name} (${playersArray[3].birth})` : '',
            player5: playersArray[4] ? `${playersArray[4].name} (${playersArray[4].birth})` : '',
            players_list: playersList,
            player_count: playersArray.length,
            notes: notes || 'Nessuna'
        };

        console.log('📧 Parametri email:', templateParams);

        const emailResponse = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('✅ Email inviata con successo:', emailResponse);

        loading.classList.remove('active');
        successCard.classList.add('active');
        updateProgressBar(4);
        document.getElementById('displayCode').textContent = uniqueCode;

        grecaptcha.reset();

    } catch (error) {
        console.error('❌ ERRORE CRITICO:', error);
        
        grecaptcha.reset();
        
        loading.classList.remove('active');
        btnGroup.style.display = 'flex';
        
        document.querySelector('.form-step[data-step="3"]').style.display = 'block';
        
        let errorMsg = 'Si è verificato un errore durante l\'invio. ';
        
        if (error.message.includes('email')) {
            errorMsg += 'Controlla che l\'indirizzo email sia corretto.';
        } else if (error.message.includes('Database')) {
            errorMsg += 'Problema con il salvataggio dei dati. Riprova tra qualche minuto.';
        } else {
            errorMsg += error.message || 'Riprova o contattaci per assistenza.';
        }
        
        showErrorMessage(errorMsg);
    }
};

// UTILITY FUNCTIONS
function showErrorMessage(message) {
    errorMessage.textContent = '⚠️ ' + message;
    errorMessage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideErrorMessage() {
    errorMessage.classList.remove('active');
}

// MOBILE MENU
window.toggleMenu = function() {
    const menu = document.getElementById('navMenu');
    const btn = document.querySelector('.mobile-menu-btn');
    menu.classList.toggle('active');
    btn.classList.toggle('active');
};

function closeMenu() {
    const menu = document.getElementById('navMenu');
    const btn = document.querySelector('.mobile-menu-btn');
    menu.classList.remove('active');
    btn.classList.remove('active');
}

// PREVENZIONE INVII MULTIPLI
let isSubmitting = false;

const originalSubmit = window.submitForm;
window.submitForm = async function() {
    if (isSubmitting) {
        console.warn('⚠️ Invio già in corso...');
        return;
    }
    
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    
    try {
        await originalSubmit();
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
};