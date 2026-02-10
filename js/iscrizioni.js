/* ==========================================================================
   ISCRIZIONI.JS - VERSIONE DEFINITIVA
   Include: Navigazione Step, Validazione, Supabase DB, EmailJS
   ========================================================================== */

// --- CONFIGURAZIONE CREDENZIALI ---
const SUPABASE_URL = 'https://yndffeyiekjqescytuga.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_woI-SCX19NQlipA2q-1luA_BGAlfDHy'; // La tua Public Key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Credenziali EmailJS
const EMAILJS_SERVICE_ID = 'service_5kkxosd';
const EMAILJS_TEMPLATE_ID = 'template_pu3kmwh';

// --- INIZIALIZZAZIONE ---
document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);
});

let currentStep = 1;
const totalSteps = 4; // Include la schermata di conferma

// Riferimenti DOM
const form = document.getElementById('registrationForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');

// --- 1. NAVIGAZIONE STEP ---
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

    // Mostra step corrente (tranne se è il 4 che è la success card gestita a parte)
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
        // Step finale o caricamento
        document.getElementById('buttonGroup').style.display = 'none';
    }
}

// --- 2. PROGRESS BAR ---
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

// --- 3. VALIDAZIONE ---
function validateStep(step) {
    let valid = true;
    const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
    
    // Reset errori
    errorMessage.classList.remove('active');
    inputs.forEach(input => input.style.borderColor = 'var(--grey-light)');
    
    // Check campi vuoti
    inputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
            input.style.borderColor = 'red';
        }
    });

    if (!valid) {
        errorMessage.innerText = "Per favore, compila tutti i campi obbligatori.";
        errorMessage.classList.add('active');
    }
    
    return valid;
}

// --- 4. RIEPILOGO ---
function updateReview() {
    const reviewContainer = document.getElementById('reviewContent');
    const teamName = document.getElementById('teamName').value;
    const category = document.getElementById('category').value;
    const refName = document.getElementById('referenteName').value;
    const refEmail = document.getElementById('referenteEmail').value;
    
    reviewContainer.innerHTML = `
        <div class="review-section">
            <h3>🏀 Squadra: ${teamName}</h3>
            <p><strong>Categoria:</strong> <span style="text-transform: capitalize;">${category}</span></p>
        </div>
        <div class="review-section" style="border-left-color: var(--purple);">
            <h3>👤 Referente: ${refName}</h3>
            <p>${refEmail}</p>
        </div>
        <p style="color: var(--white-off); font-size: 0.9rem; margin-top: 1rem;">
            <em>Controlla i giocatori nello step precedente se necessario.</em>
        </p>`;
}

// --- 5. LOGICA DI INVIO (DB + EMAIL) ---
window.submitForm = async function() {
    const loading = document.getElementById('loading');
    const successCard = document.getElementById('successCard');
    const btnGroup = document.getElementById('buttonGroup');
    const formSteps = document.querySelectorAll('.form-step');

    // UI: Nascondi form, mostra loading
    formSteps.forEach(step => step.style.display = 'none');
    btnGroup.style.display = 'none';
    loading.classList.add('active');
    errorMessage.classList.remove('active');

    // DATI: Raccogli i valori dal form
    const uniqueCode = 'CNO-' + Math.floor(1000 + Math.random() * 9000);
    const teamName = document.getElementById('teamName').value;
    const category = document.getElementById('category').value;
    const refName = document.getElementById('referenteName').value;
    const refEmail = document.getElementById('referenteEmail').value;
    const refPhone = document.getElementById('referentePhone').value;
    const notes = document.getElementById('notes').value;

    // DATI: Costruisci array giocatori
    const playersArray = [];
    for(let i=1; i<=5; i++) {
        const nameInput = document.getElementsByName(`player${i}Name`)[0];
        const birthInput = document.getElementsByName(`player${i}Birth`)[0];
        
        if(nameInput && nameInput.value) {
            playersArray.push({ 
                name: nameInput.value, 
                birth: birthInput.value 
            });
        }
    }

    try {
        // --- STEP A: SALVATAGGIO SU SUPABASE ---
        // Usiamo i nomi colonna corretti del tuo DB: referente_name, referente_email, ecc.
        const { error: dbError } = await supabaseClient
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
                    notes: notes
                }
            ]);

        if (dbError) throw new Error("Errore Database: " + dbError.message);

        // --- STEP B: INVIO EMAIL (EmailJS) ---
        // Usiamo i nomi variabili del template EmailJS: ref_name, ref_email, ecc.
        const templateParams = {
            registration_code: uniqueCode,
            team_name: teamName,
            category: category,
            ref_name: refName,
            ref_email: refEmail,
            ref_phone: refPhone,
            // Formattiamo i giocatori per la mail
            player1: playersArray[0] ? `${playersArray[0].name} (${playersArray[0].birth})` : '',
            player2: playersArray[1] ? `${playersArray[1].name} (${playersArray[1].birth})` : '',
            player3: playersArray[2] ? `${playersArray[2].name} (${playersArray[2].birth})` : '',
            player4: playersArray[3] ? `${playersArray[3].name} (${playersArray[3].birth})` : '',
            player5: playersArray[4] ? `${playersArray[4].name} (${playersArray[4].birth})` : '',
            notes: notes
        };

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

        // --- STEP C: SUCCESSO ---
        loading.classList.remove('active');
        successCard.classList.add('active');
        updateProgressBar(4); // Completa la barra
        document.getElementById('displayCode').textContent = uniqueCode;

    } catch (error) {
        console.error('ERRORE CRITICO:', error);
        
        // Gestione Errore UI
        loading.classList.remove('active');
        btnGroup.style.display = 'flex';
        // Mostra di nuovo lo step 3 per permettere di riprovare
        document.querySelector('.form-step[data-step="3"]').style.display = 'block';
        
        errorMessage.textContent = "Si è verificato un problema: " + (error.message || error);
        errorMessage.classList.add('active');
    }
};