const translations = {
    ru: {
        title: "Ультимативный \"Любимая игра meme\"",
        h1: "УЛЬТИМАТИВНЫЙ \"ЛЮБИМАЯ ИГРА MEME\"",
        placeholder: "Кликни сюда и нажми Ctrl+V чтобы вставить изображение",
        noImageAlert: "В буфере обмена нет изображения. Убедитесь, что вы скопировали изображение.",
        screenshotButton: "Генерировать скриншот",
        clearButton: "Очистить",
        toggleLeft: "Я здесь чисто изображения вставить",
        toggleRight: "Хочу также написать комментарии",
        langButton: "EN",
        clearConfirm: "Вы уверены, что хотите очистить все сохранённые изображения и названия? Это действие нельзя отменить.",
        phrases: [
            "Игра, которую должен пройти каждый", "Лучшая история", "Любимый визуальный стиль", "Заставляет задуматься", "\"Я тебя закончу, когда-нибудь..\"", "Любимая серия игр", "Лучшая боёвка", "Хорошая игра с плохим комьюнити", "Фанатская игра для фанатов от фанатов", "Игра с наибольшим наигранным временем",
            "200iq стратегия", "Ты любишь, но все ненавидят", "Ты ненавидишь, но всем нравится", "Недооценено", "Переоценено", "Годная инди", "Годная ААА", "Мясо, матюки, убийства...", "Лучшая детская игра", "Когда сиквел лучше оригинала",
            "Годнота отечественных разрабов", "ОМГ эта атмосфера", "Любимый антагонист", "Любимый протагонист", "Любимый второстепенный персонаж", "Упущенный потенциал", "Наибольшее разочарование", "Ремейк/ремастер, который смог", "Вот раньше были игры...", "Друг познаётся в коопе",
            "Ночной кошмар казуальщика", "Игра не для всех", "Любимый симулятор", "Депрессивная игра", "Лучший саундтрек", "\"Почему мне это нравится?\"", "Всегда возвращаешься", "Любимая бесплатная игра", "Нелюбимая игра от любимого разрабочика", "Любимая игра от нелюбимого издателя",
            "Лучший шутер", "Лучший юмор", "Лучший мультиплеер", "Лучший хоррор", "Лучший рогалик", "Лучший выживач/песочница", "Самая первая игра, в которую ты играл", "Самая ожидаемая игра", "Любимая игра для мобилки", "Лучшая концовка"
        ]
    },
    en: {
        title: "The Ultimate \"Favorite Game Meme\"",
        h1: "THE ULTIMATE \"FAVORITE GAME MEME\"",
        placeholder: "Click here and press Ctrl+V to paste an image",
        noImageAlert: "No image found on clipboard. Make sure you copied an image.",
        screenshotButton: "Generate Screenshot",
        clearButton: "Clear",
        toggleLeft: "I'm only here to paste images",
        toggleRight: "I also want to comment on some/all categories",
        langButton: "RU",
        clearConfirm: "Are you sure you want to clear all saved images and texts? This action cannot be undone.",
        phrases: [
            "A game everyone should play", "Best story", "Favorite visual style", "Makes you think", "\"I'll finish you... someday\"", "Favorite game series", "Best combat", "Good game, bad community", "A fan game for fans by fans", "Most played game",
            "200iq strategy", "You love it, everyone hates it", "You hate it, everyone loves it", "Underrated", "Overrated", "Great indie", "Great AAA", "Gore, swearing, violence...", "Best kids' game", "When the sequel is better",
            "Great local dev game", "OMG this atmosphere", "Favorite antagonist", "Favorite protagonist", "Favorite side character", "Wasted potential", "Biggest disappointment", "A remake/remaster that delivered", "They don't make 'em like they used to", "A friend is tested in co-op",
            "A casual's nightmare", "Not for everyone", "Favorite simulator", "Depressing game", "Best soundtrack", "\"Why do I like this?\"", "You always come back to", "Favorite free-to-play", "Disliked game from a fav developer", "Favorite game from a disliked publisher",
            "Best shooter", "Best humor", "Best multiplayer", "Best horror", "Best roguelike", "Best survival/sandbox", "The very first game you played", "Most anticipated game", "Favorite mobile game", "Best ending"
        ]
    }
};

const icons = {
    screenshot: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"/></svg>',

    clear: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>',
    lang: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/></svg>',
    save: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>',
    cancel: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>',
    themeLight: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>',
    themeDark: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-218l101-97 55 53-97 101-59-57Z"/></svg>'
};

let currentLang = 'ru';
let currentPlaceholder = null;
let db;
const grid = document.querySelector('.grid');
let isViewMode = false;
let pendingExportType = null;
const filenameModal = document.getElementById('filename-modal');
const filenameInput = document.getElementById('filename-input');
const filenameSaveBtn = document.getElementById('filename-save-btn');
function initDB(callback) {
    const request = indexedDB.open('imageMemeDB', 3);
    request.onerror = (event) => console.error("Database error: " + event.target.errorCode);
    request.onsuccess = (event) => {
        db = event.target.result;
        callback();
    };
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;
        if (oldVersion < 1) {
            db.createObjectStore('images', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
            db.createObjectStore('customTexts', { keyPath: 'id' });
        }
        if (oldVersion < 3) {
            db.createObjectStore('comments', { keyPath: 'id' });
        }
    };
}

const saveImage = (index, imageData) => {
    if (!db) return;
    const transaction = db.transaction(['images'], 'readwrite');
    const objectStore = transaction.objectStore('images');
    objectStore.put({ id: index, image: imageData });
};

const loadImages = () => {
    if (!db) return;
    const transaction = db.transaction(['images'], 'readonly');
    const objectStore = transaction.objectStore('images');
    const placeholders = document.querySelectorAll('.image-placeholder');

    objectStore.getAll().onsuccess = (event) => {
        const images = event.target.result;
        images.forEach(item => {
            if (placeholders[item.id]) {
                let imageUrl;
                if (item.image instanceof Blob) {
                    imageUrl = URL.createObjectURL(item.image);
                } else {
                    imageUrl = item.image;
                }
                
                placeholders[item.id].style.backgroundImage = `url(${imageUrl})`;
                placeholders[item.id].innerText = '';
            }
        });
    };
};

const saveText = (index, text) => {
    if (!db) return;
    const id = `${currentLang}_${index}`;
    const transaction = db.transaction(['customTexts'], 'readwrite');
    const objectStore = transaction.objectStore('customTexts');
    objectStore.put({ id: id, text: text });
};

const loadTexts = () => {
    if (!db) return;
    const transaction = db.transaction(['customTexts'], 'readonly');
    const objectStore = transaction.objectStore('customTexts');
    const textElements = document.querySelectorAll('.card p');

    objectStore.getAll().onsuccess = (event) => {
        const allTexts = event.target.result;
        allTexts.forEach(item => {
            const [lang, indexStr] = item.id.split('_');
            if (lang === currentLang) {
                const index = parseInt(indexStr);
                if (textElements[index]) {
                    textElements[index].innerText = item.text;
                }
            }
        });
    };
};

document.addEventListener('paste', (event) => {
    if (!currentPlaceholder) return;

    const items = event.clipboardData.items;
    let imageFound = false;
    
    for (let item of items) {
        if (item.type.startsWith('image/')) {
            imageFound = true;
            const blob = item.getAsFile();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                processImage(e.target.result, (compressedBase64) => {
                    const placeholderIndex = parseInt(currentPlaceholder.dataset.index);
                    
                    saveImage(placeholderIndex, compressedBase64);
                    
                    currentPlaceholder.style.backgroundImage = `url(${compressedBase64})`;
                    currentPlaceholder.innerText = '';
                    currentPlaceholder.classList.remove('active-slot');
                    currentPlaceholder = null;
                });
            };
            reader.readAsDataURL(blob);
            break;
        }
    }
    
    if (!imageFound) {
        alert(translations[currentLang].noImageAlert);
    }
});

function processImage(base64Str, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetWidth = 264;
        const targetHeight = 352;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        
        const x = (targetWidth - newWidth) / 2;
        const y = (targetHeight - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        callback(compressedDataUrl);
    };
    img.src = base64Str;
}

function generateGrid(lang) {
    grid.innerHTML = '';
    const t = translations[lang];

    t.phrases.forEach((phrase, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerText = t.placeholder;
        placeholder.dataset.index = index;

        if (!isViewMode) {
            placeholder.addEventListener('click', (event) => {
                document.querySelectorAll('.image-placeholder').forEach(el => {
                    el.classList.remove('active-slot');
                });
                currentPlaceholder = event.target;
                currentPlaceholder.classList.add('active-slot');
            });
        }

        const text = document.createElement('p');
        text.contentEditable = !isViewMode;
        text.innerText = phrase;

        if (!isViewMode) {
            text.addEventListener('blur', (event) => {
                saveText(index, event.target.innerText);
            });
        }

        card.appendChild(placeholder);
        card.appendChild(text);
        grid.appendChild(card);
    });

    loadImages();
}

function updateUI(lang) {
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    document.querySelector('h1').innerText = t.h1;

    document.getElementById('screenshot').innerHTML = `${icons.screenshot}<span>${t.screenshotButton}</span>`;
    document.getElementById('clear').innerHTML = `${icons.clear}<span>${t.clearButton}</span>`;
    document.getElementById('lang-toggle').innerHTML = `${icons.lang}<span>${t.langButton}</span>`;

    generateGrid(lang);
}

function getAllData(callback) {
    if (!db) {
        callback({ images: {}, texts: {} });
        return;
    }

    const data = { images: {}, texts: {} };
    let imagesProcessed = 0;
    let imagesToProcess = 0;

    const imgTransaction = db.transaction(['images'], 'readonly');
    imgTransaction.objectStore('images').getAll().onsuccess = (event) => {
        const images = event.target.result;
        let processedCount = 0;

        if (images.length === 0) {
            loadTexts();
            return;
        }

        images.forEach(item => {
            if (typeof item.image === 'string') {
                data.images[item.id] = item.image;
                processedCount++;
                if (processedCount === images.length) loadTexts();
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    data.images[item.id] = e.target.result;
                    processedCount++;
                    if (processedCount === images.length) loadTexts();
                };
                reader.readAsDataURL(item.image);
            }
        });
    };

    function loadTexts() {
        const txtTransaction = db.transaction(['customTexts'], 'readonly');
        txtTransaction.objectStore('customTexts').getAll().onsuccess = (event) => {
            const texts = event.target.result;
            texts.forEach(item => { data.texts[item.id] = item.text; });
            callback(data);
        };
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    const btn = document.getElementById('theme-toggle');
    if(btn) btn.innerHTML = isDark ? icons.themeDark : icons.themeLight;
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        }
    }
    updateThemeIcon();
}

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

document.getElementById('screenshot').addEventListener('click', () => {
    generateScreenshot('the_ultimate_game_meme');
});

function generateScreenshot(customName) {
    const elementToCapture = document.getElementById('capture-area');

    html2canvas(elementToCapture, {
        backgroundColor: "#ffffff",
        windowWidth: 1920,
        windowHeight: 1080,
        useCORS: true,
        scale: 1,
        onclone: (clonedDoc) => {
            clonedDoc.body.classList.remove('dark-mode');
            const clonedControls = clonedDoc.querySelector('.controls');
            if(clonedControls) clonedControls.style.display = 'none';
            const themeBtn = clonedDoc.getElementById('theme-toggle');
            const langBtn = clonedDoc.getElementById('lang-toggle');
            if(themeBtn) themeBtn.style.display = 'none';
            if(langBtn) langBtn.style.display = 'none';
            const placeholders = clonedDoc.querySelectorAll('.image-placeholder');
            placeholders.forEach(ph => {
                if (!ph.style.backgroundImage || ph.style.backgroundImage === 'none' || ph.style.backgroundImage === '') {
                    ph.style.opacity = '0';
                }
            });
            const activeSlots = clonedDoc.querySelectorAll('.active-slot');
            activeSlots.forEach(slot => slot.classList.remove('active-slot'));
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = customName ? `${customName}.jpg` : 'favorite_game_meme.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    });
}


document.getElementById('clear').addEventListener('click', () => {
    if (confirm(translations[currentLang].clearConfirm)) {
        if (!db) return;

        const imgTransaction = db.transaction(['images'], 'readwrite');
        imgTransaction.objectStore('images').clear();

        const txtTransaction = db.transaction(['customTexts'], 'readwrite');
        txtTransaction.objectStore('customTexts').clear();

        const cmtTransaction = db.transaction(['comments'], 'readwrite');
        const cmtRequest = cmtTransaction.objectStore('comments').clear();

        cmtRequest.onsuccess = () => {
            location.reload();
        };
    }
});

document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = (currentLang === 'ru') ? 'en' : 'ru';
    localStorage.setItem('preferredLang', currentLang);
    updateUI(currentLang);
    loadTexts();
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.image-placeholder')) {
        document.querySelectorAll('.image-placeholder.active-slot').forEach(el => {
            el.classList.remove('active-slot');
        });
        currentPlaceholder = null;
    }
});

function getInitialLang() {
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'ru') ? 'ru' : 'en';
}

window.addEventListener('load', () => {
    currentLang = getInitialLang();
    initTheme();
    updateUI(currentLang);
    initDB(() => {
        loadImages();
        loadTexts();
    });
});