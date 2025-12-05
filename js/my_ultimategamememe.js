const translations = {
    ru: {
        title: 'Мой Ультимативный "Любимая игра meme"',
        h1: 'УЛЬТИМАТИВНЫЙ "ЛЮБИМАЯ ИГРА MEME"',
        langButton: 'EN',
        closeHint: 'Нажмите вне окна или Esc, чтобы закрыть',
        phrases: [],
        explanations: []
    },
    en: {
        title: 'My Ultimate "Favorite Game Meme"',
        h1: 'THE ULTIMATE "FAVORITE GAME MEME"',
        langButton: 'RU',
        closeHint: 'Click outside or press Esc to close',
        phrases: [],
        explanations: []
    }
};

const originalPhrasesRu = [
    "Игра, которую должен пройти каждый", "Лучшая история", "Любимый визуальный стиль", "Заставляет задуматься", "\"Я тебя закончу, когда-нибудь..\"", "Любимая серия игр", "Лучшая боёвка", "Хорошая игра с плохим комьюнити", "Фанатская игра для фанатов от фанатов", "Игра с наибольшим наигранным временем",
    "200iq стратегия", "Ты любишь, но все ненавидят", "Ты ненавидишь, но всем нравится", "Недооценено", "Переоценено", "Годная инди", "Годная ААА", "Мясо, матюки, убийства...", "Лучшая детская игра", "Когда сиквел лучше оригинала",
    "Годнота отечественных разрабов", "ОМГ эта атмосфера", "Любимый антагонист", "Любимый протагонист", "Любимый второстепенный персонаж", "Упущенный потенциал", "Наибольшее разочарование", "Ремейк/ремастер, который смог", "Вот раньше были игры...", "Друг познаётся в коопе",
    "Ночной кошмар казуальщика", "Игра не для всех", "Любимый симулятор", "Депрессивная игра", "Лучший саундтрек", "\"Почему мне это нравится?\"", "Всегда возвращаешься", "Любимая бесплатная игра", "Нелюбимая игра от любимого разрабочика", "Любимая игра от нелюбимого издателя",
    "Лучший шутер", "Лучший юмор", "Лучший мультиплеер", "Лучший хоррор", "Лучший рогалик", "Лучший выживач/песочница", "Самая первая игра, в которую ты играл", "Самая ожидаемая игра", "Любимая игра для мобилки", "Лучшая концовка"
];

const originalPhrasesEn = [
    "A game everyone should play", "Best story", "Favorite visual style", "Makes you think", "\"I'll finish you... someday\"", "Favorite game series", "Best combat", "Good game, bad community", "A fan game for fans by fans", "Most played game",
    "200iq strategy", "You love it, everyone hates it", "You hate it, everyone loves it", "Underrated", "Overrated", "Great indie", "Great AAA", "Gore, swearing, violence...", "Best kids' game", "When the sequel is better",
    "Great local dev game", "OMG this atmosphere", "Favorite antagonist", "Favorite protagonist", "Favorite side character", "Wasted potential", "Biggest disappointment", "A remake/remaster that delivered", "They don't make 'em like they used to", "A friend is tested in co-op",
    "A casual's nightmare", "Not for everyone", "Favorite simulator", "Depressing game", "Best soundtrack", "\"Why do I like this?\"", "You always come back", "Favorite free-to-play", "Disliked game from a fav developer", "Favorite game from a disliked publisher",
    "Best shooter", "Best humor", "Best multiplayer", "Best horror", "Best roglike", "Best survival/sandbox", "The very first game you played", "Most anticipated game", "Favorite mobile game", "Best ending"
];

translations.ru.phrases = originalPhrasesRu.slice();
translations.en.phrases = originalPhrasesEn.slice();

translations.ru.explanations = translations.ru.phrases.map((p, i) => `Пояснение для позиции ${i + 1} — замените этот текст вашим комментарием.`);
translations.en.explanations = translations.en.phrases.map((p, i) => `Explanation for slot ${i + 1} — replace this text with your comment.`);

let currentLang = 'ru';

function updateUI(lang) {
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    document.querySelector('h1').innerText = t.h1;
    document.getElementById('lang-toggle').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000ff"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/></svg><span>${t.langButton}</span>`;
    generateGrid(lang);
}

function generateGrid(lang) {
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';
    const t = translations[lang];
    t.phrases.forEach((phrase, index) => {
        const card = document.createElement('div'); card.className = 'card';
        const img = document.createElement('div'); img.className = 'image';
        const imgPath = `images/game_meme/game_cover_${index}.png`;
        img.style.backgroundImage = `url(${imgPath})`;
        const p = document.createElement('p'); p.className = 'phrase'; p.innerText = phrase;
        const btn = document.createElement('button'); btn.className = 'explain-btn';
        btn.setAttribute('data-index', index);
        btn.setAttribute('aria-label', lang === 'ru' ? 'Пояснение' : 'Comment');
        btn.innerHTML = `<span style="font-size:16px"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/></svg></span><span style="font-size:16px">${lang === 'ru' ? 'Пояснение' : 'Comment'}</span>`;
        btn.addEventListener('click', (e) => { showPanel(index, e.currentTarget); });
        card.appendChild(img);
        card.appendChild(p);
        card.appendChild(btn);
        grid.appendChild(card);
    });
}

function fetchAndParseExplanations(path) {
    return fetch(path).then(r => {
        if (!r.ok) return [];
        return r.text();
    }).then(text => {
        if (!text) return [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const slots = doc.querySelectorAll('.slot');
        const arr = [];
        slots.forEach(node => arr.push(node.innerHTML.trim()));
        return arr;
    }).catch(() => []);
}

function loadExplanations() {
    if (window.explanationsPromise) return window.explanationsPromise;
    window.explanationsPromise = Promise.all([
        fetchAndParseExplanations('explanations/ru.html'),
        fetchAndParseExplanations('explanations/en.html')
    ]).then(([ruArr, enArr]) => {
        if (Array.isArray(ruArr) && ruArr.length) translations.ru.explanations = ruArr;
        if (Array.isArray(enArr) && enArr.length) translations.en.explanations = enArr;
    }).catch(() => { });
    return window.explanationsPromise;
}

async function showPanel(index, anchorBtn) {
    const lang = currentLang;
    const t = translations[lang];
    const title = t.phrases[index] || '';
    const panel = document.querySelector('.panel');
    document.getElementById('panel-title').innerText = title;
    document.querySelector('.close-hint').innerText = t.closeHint;

    await loadExplanations();

    let bodyHtml = '';
    if (t.explanations && t.explanations[index]) {
        bodyHtml = t.explanations[index];
    } else {
        bodyHtml = (lang === 'ru') ? `Ошибка загрузки пояснения` : `Explanation fetching error`;
        bodyHtml = `<p>${bodyHtml}</p>`;
    }
    const panelBody = document.getElementById('panel-body');
    panelBody.innerHTML = bodyHtml;

    const card = anchorBtn.closest('.card');
    const rect = card.getBoundingClientRect();

    const desiredWidth = rect.width * 2;
    const maxAllowed = Math.min(window.innerWidth - 16, 640);
    const panelWidth = Math.max(160, Math.min(desiredWidth, maxAllowed));
    panel.style.width = panelWidth + 'px';

    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'block';

    panel.style.display = 'block';
    panel.style.visibility = 'hidden';
    const panelHeight = panel.offsetHeight;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const margin = 12;
    let top, isAbove;
    if (spaceBelow >= panelHeight + margin) {
        top = rect.bottom + margin;
        isAbove = false;
    } else if (spaceAbove >= panelHeight + margin) {
        top = rect.top - panelHeight - margin;
        isAbove = true;
    } else {
        top = Math.min(rect.bottom + margin, window.innerHeight - panelHeight - margin);
        if (top < margin) top = margin;
        isAbove = (rect.top - top) > (top + panelHeight - rect.bottom);
    }

    const cardCenter = rect.left + rect.width / 2;
    let left = cardCenter - panelWidth / 2;
    const minLeft = 8;
    const maxLeft = window.innerWidth - panelWidth - 50;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.visibility = 'visible';
    panel.classList.add('open');
}

function closePanel() {
    const panel = document.querySelector('.panel');
    const overlay = document.querySelector('.overlay');
    panel.classList.remove('open');
    panel.style.display = 'none';
    overlay.style.display = 'none';
}

window.addEventListener('resize', () => { closePanel(); });
window.addEventListener('scroll', () => { closePanel(); }, true);

window.addEventListener('load', () => {
    const saved = localStorage.getItem('preferredLang');
    if (saved && translations[saved]) currentLang = saved;
    else { const bl = navigator.language.split('-')[0]; currentLang = (bl === 'ru') ? 'ru' : 'en'; }
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = (currentLang === 'ru') ? 'en' : 'ru';
        localStorage.setItem('preferredLang', currentLang);
        updateUI(currentLang);
        closePanel();
    });

    document.querySelector('.overlay').addEventListener('click', (e) => { closePanel(); });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

    loadExplanations();

    updateUI(currentLang);
});