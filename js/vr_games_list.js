let GAMES_DATA = [];
let gameBackgroundObserver = null;

async function loadIntroduction() {
  try {
    console.log('Loading introduction...');
    const response = await fetch('/vr-stuff/introduction.md');
    if (response.ok) {
      const mdText = await response.text();
      const introEl = document.getElementById('introduction');
      if (introEl && typeof marked !== 'undefined') {
        introEl.innerHTML = marked.parse(mdText);
      }
    } else {
      console.warn('Failed to load introduction.md');
    }
  } catch (error) {
    console.error('Error loading introduction:', error);
  }
}

async function loadGamesData() {
  try {
    console.log('Starting to load games data...');
    const cacheBuster = Date.now();
    const indexUrl = new URL('vr-stuff/games/index.json', document.baseURI);
    indexUrl.searchParams.set('_', cacheBuster);
    const indexResponse = await fetch(indexUrl, { cache: 'no-store' });
    if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status} loading the game index`);
    const indexData = await indexResponse.json();
    console.log('Loaded index.json with', indexData.length, 'games');

    const gamePromises = indexData.map(async (gameEntry) => {
      try {
        console.log('Loading game:', gameEntry.path);
        const gameUrl = new URL(gameEntry.path, document.baseURI);
        gameUrl.searchParams.set('_', cacheBuster);
        const response = await fetch(gameUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status} loading ${gameEntry.path}`);
        const gameData = await response.json();
        console.log('Successfully loaded:', gameEntry.title);
        return gameData;
      } catch (error) {
        console.error(`Error loading ${gameEntry.path}:`, error);
        return null;
      }
    });

    const games = await Promise.all(gamePromises);
    GAMES_DATA = games.filter(game => game !== null);
    console.log('Final GAMES_DATA length:', GAMES_DATA.length);

    initializeTags();
    return GAMES_DATA;
  } catch (error) {
    console.error('Error loading games data:', error);
    return [];
  }
}

function initializeTags() {
  GAMES_DATA.forEach(g => {
    if (!g.tags) g.tags = { platforms: [], genres: [], gameModes: ["Одиночка"], themes: [] };
    if (!g.tags.gameModes) g.tags.gameModes = [];
    if (!g.tags.gameModes.includes("Одиночка")) g.tags.gameModes.unshift("Одиночка");
    for (const cat of Object.keys(g.tags)) {
      if (Array.isArray(g.tags[cat])) {
        g.tags[cat].sort((a, b) => {
          const labelA = getTagLabel(cat, a);
          const labelB = getTagLabel(cat, b);
          return labelA.localeCompare(labelB, 'ru');
        });
      }
    }
  });
}

const TAG_CATEGORY_NAMES = {
  platforms: "Платформы",
  genres: "Жанры",
  gameModes: "Режимы игры",
  themes: "Темы"
};

const TAG_TRANSLATIONS = {
  "platforms": {
    "Quest": "Quest",
    "PCVR": "PCVR"
  },
  "genres": {
    "Ближний бой": "Ближний бой",
    "Платформер / Паркур": "Платформер / Паркур",
    "Ритм-игра": "Ритм-игра",
    "Рогалик": "Рогалик",
    "РПГ": "РПГ",
    "Песочница": "Песочница",
    "Шутер": "Шутер",
    "Симулятор": "Симулятор",
    "Стелс": "Стелс",
    "Стратегия / Тактика": "Стратегия / Тактика",
    "Выживач": "Выживач",
    "На подумать": "На подумать"
  },
  "gameModes": {
    "Кооп": "Кооп",
    "Мультиплеер": "Мультиплеер",
    "Одиночка": "Одиночка"
  },
  "themes": {
    "На зачиллить": "На зачиллить",
    "Комедийная": "Комедийная",
    "Космическая": "Космическая",
    "Ламповая": "Ламповая",
    "Хоррор": "Хоррор",
    "Повествовательная": "Повествовательная",
    "Магия": "Магия",
    "Открытый мир": "Открытый мир",
    "Физичная": "Физичная",
    "Пилотирование": "Пилотирование",
    "Спортивная": "Спортивная",
    "Постапок": "Постапок"
  }
};

const TAG_DESCRIPTIONS = {
  "platforms": {
    "Quest": "В это можно поиграть на Quest 2 или 3(S). Первый не учитываю, т.к. слишком старый. Отдельно помечены игры, запускающиеся только на Quest 3(S)",
    "PCVR": "В это можно поиграть на ПК"
  },
  "genres": {
    "Ближний бой": "Всё, где можно набивать и нашинковывать лица",
    "Платформер / Паркур": "Всё, где нужно много прыгать и скакать. Вполне вероятно, что в играх с этим тегом тебя укачает",
    "Ритм-игра": "Всё, где ты делаешь что-то под музыку!",
    "Рогалик": "Всё, где предполагается сессионный формат, процедурная или рандомная генерация и потеря прогресса в разной форме",
    "РПГ": "Всё, что является РПГ или содержит значительное кол-во элементов данного жанра",
    "Песочница": "Всё, что имеет широкие просторы для воображения",
    "Шутер": "Всё, где надо делать пиу-пиу по врагам и не только",
    "Симулятор": "Жанр, который позволяет тебе побыть кем-то, кем, скорее всего, ты никогда не станешь))",
    "Стелс": "В этих играх нужно быть очень-очень тихим...",
    "Стратегия / Тактика": "Сюда запихал много чего: от RTS-ок с космическими баталиями до градостроителей",
    "Выживач": "Всё, что связано с менеджментом ресурсов или шкал потребностей персонажа",
    "На подумать": "Всё, где нужно пораскинуть мозгами"
  },
  "gameModes": {
    "Кооп": "",
    "Мультиплеер": "",
    "Одиночка": ""
  },
  "themes": {
    "На зачиллить": "Всё то, во что можно играть максимально ненапряжно",
    "Комедийная": "Посмеяться и т.д.",
    "Космическая": "Игры с именно что космическим сеттингом - не путать с научно-фантастическим",
    "Ламповая": "Игры с уютной или простодушной атмосферой",
    "Хоррор": "Попугаться и т.п.",
    "Повествовательная": "Всё, что имеет синглплеерную кампанию, чаще всего с сюжетом",
    "Магия": "Всё, что позволяет игроку кастить спеллы",
    "Открытый мир": "Большой свободный мир, исследование без линейности",
    "Физичная": "Игры, в которых имеется активное физическое взаимодействие с окружением и NPC",
    "Пилотирование": "Управление транспортными средствами: самолёты, корабли, танки",
    "Спортивная": "Игры, способные поддерживать вас в форме",
    "Постапок": "Всё, где осталась лишь разруха и тлен"
  }
};

const TAG_ICONS = {
  "platforms": {
    "Quest": "/images/icons/meta-logo.svg",
    "PCVR": "/images/icons/pc.svg"
  },
  "genres": {
    "Ближний бой": "/images/icons/tags/hand-index-thumb.svg",
    "Платформер / Паркур": "/images/icons/tags/person-walking.svg",
    "Ритм-игра": "/images/icons/tags/music-note-beamed.svg",
    "Рогалик": "/images/icons/tags/dice-5.svg",
    "РПГ": "/images/icons/tags/person-badge.svg",
    "Песочница": "/images/icons/tags/box.svg",
    "Шутер": "/images/icons/tags/crosshair.svg",
    "Симулятор": "/images/icons/tags/gear.svg",
    "Стелс": "/images/icons/tags/eye-slash.svg",
    "Стратегия / Тактика": "/images/icons/tags/diagram-3.svg",
    "Выживач": "/images/icons/tags/heart-pulse.svg",
    "На подумать": "/images/icons/tags/puzzle.svg"
  },
  "gameModes": {
    "Кооп": "/images/icons/tags/people.svg",
    "Мультиплеер": "/images/icons/tags/people-fill.svg",
    "Одиночка": "/images/icons/tags/person.svg"
  },
  "themes": {
    "На зачиллить": "/images/icons/tags/cup-hot.svg",
    "Комедийная": "/images/icons/tags/emoji-laughing.svg",
    "Космическая": "/images/icons/tags/stars.svg",
    "Ламповая": "/images/icons/tags/house-heart.svg",
    "Хоррор": "/images/icons/tags/emoji-dizzy.svg",
    "Повествовательная": "/images/icons/tags/book.svg",
    "Магия": "/images/icons/tags/magic.svg",
    "Открытый мир": "/images/icons/tags/globe-americas.svg",
    "Физичная": "/images/icons/tags/boxes.svg",
    "Пилотирование": "/images/icons/tags/airplane.svg",
    "Спортивная": "/images/icons/tags/trophy.svg",
    "Постапок": "/images/icons/tags/radioactive.svg"
  }
};

const TAG_COLORS = {
  "platforms": {
    "Quest": "#2ecc71",
    "PCVR": "#3498db"
  },
  "genres": {
    "Ближний бой": "#ff6b6b",
    "Платформер / Паркур": "#f1c40f",
    "Ритм-игра": "#e84393",
    "Рогалик": "#9b59b6",
    "РПГ": "#f39c12",
    "Песочница": "#95a5a6",
    "Шутер": "#e74c3c",
    "Симулятор": "#3498db",
    "Стелс": "#7f8c8d",
    "Стратегия / Тактика": "#1abc9c",
    "Выживач": "#27ae60",
    "На подумать": "#00bcd4"
  },
  "gameModes": {
    "Кооп": "#27ae60",
    "Мультиплеер": "#e67e22",
    "Одиночка": "#607d8b"
  },
  "themes": {
    "На зачиллить": "#00b894",
    "Комедийная": "#fdcb6e",
    "Космическая": "#6c5ce7",
    "Ламповая": "#e17055",
    "Хоррор": "#d63031",
    "Повествовательная": "#0984e3",
    "Магия": "#a29bfe",
    "Открытый мир": "#00cec9",
    "Физичная": "#74b9ff",
    "Пилотирование": "#636e72",
    "Спортивная": "#e84393",
    "Постапок": "#a1887f"
  }
};

const TAG_ORDER = ["platforms", "genres", "gameModes", "themes"];

let activeSearch = "";
let activeTags = new Set();
let excludedTags = new Set();
const carouselStates = new Map();

function getTagDescription(category, tag) {
  return TAG_DESCRIPTIONS[category]?.[tag] || "";
}

function extractYoutubeId(youtubeUrl) {
  if (!youtubeUrl) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = youtubeUrl.match(p);
    if (m) return m[1];
  }
  return "";
}

function getYoutubeThumbnail(youtubeUrl) {
  const id = extractYoutubeId(youtubeUrl);
  if (!id) return "";
  return `https://i.ytimg.com/vi/${id}/hq720.jpg`;
}

function stripMdLinks(str) {
  if (!str) return "";
  return str.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function debounce(fn, ms) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

function hltbDisplay(v) {
  if (v === "—") {
    return '<span class="hltb-value no-data">—</span>';
  }
  return '<span class="hltb-value">' + v + '</span>';
}

function getAllUniqueTags() {
  const result = { platforms: new Set(), genres: new Set(), gameModes: new Set(), themes: new Set() };
  for (const game of GAMES_DATA) {
    for (const cat of TAG_ORDER) {
      for (const t of game.tags[cat]) {
        result[cat].add(t);
      }
    }
  }
  return result;
}

function getCombinedTags(game) {
  const all = [];
  for (const cat of TAG_ORDER) {
    for (const t of game.tags[cat]) all.push(t);
  }
  return all;
}

function getTagLabel(category, tag) {
  return TAG_TRANSLATIONS[category]?.[tag] || tag;
}

function getTagColor(category, tag) {
  const color = TAG_COLORS[category]?.[tag];
  return /^#[\da-f]{6}$/i.test(color || "") ? color : "#7f8c8d";
}

function setTagColor(element, category, tag) {
  element.style.setProperty("--tag-color", getTagColor(category, tag));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getTagHTML(category, tag) {
  const label = getTagLabel(category, tag);
  const desc = getTagDescription(category, tag);
  const titleAttr = desc ? ` title="${escapeHTML(desc)}"` : "";
  const iconPath = TAG_ICONS[category]?.[tag];
  let icon = "";
  if (iconPath) {
    try {
      const iconUrl = new URL(iconPath, document.baseURI);
      if (iconUrl.protocol === "http:" || iconUrl.protocol === "https:") {
        icon = `<span class="tag-icon-mask" style="--icon-url: url(&quot;${escapeHTML(iconUrl.href)}&quot;);"></span>`;
      }
    } catch (error) {
      console.warn(`Invalid icon URL for tag "${tag}":`, error);
    }
  }
  return `<span class="tag-content"${titleAttr}>${icon}<span class="tag-text">${escapeHTML(label)}</span></span>`;
}

function filterGames() {
  const q = activeSearch.trim().toLowerCase();
  return GAMES_DATA.filter(game => {
    const matchesSearch = !q ||
      game.title.toLowerCase().includes(q) ||
      (game.shortDescription && game.shortDescription.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    const combined = getCombinedTags(game);
    if (excludedTags.size > 0) {
      for (const tag of excludedTags) {
        if (combined.includes(tag)) return false;
      }
    }
    if (activeTags.size === 0) return true;
    for (const tag of activeTags) {
      if (!combined.includes(tag)) return false;
    }
    return true;
  });
}

function renderTagPanel() {
  const allTags = getAllUniqueTags();
  const container = document.getElementById("tagFilterPanel");
  if (!container) return;

  try {
    const lists = container.querySelectorAll(".tag-list");
    lists.forEach(listEl => {
      const cat = listEl.dataset.category;
      if (!cat) return;
      listEl.innerHTML = "";
      const tags = Array.from(allTags[cat] || []).sort((a, b) => {
        const labelA = getTagLabel(cat, a);
        const labelB = getTagLabel(cat, b);
        return labelA.localeCompare(labelB, 'ru');
      });
      for (const t of tags) {
        const chip = document.createElement("span");
        let cls = "tag-chip";
        if (activeTags.has(t)) cls += " active";
        if (excludedTags.has(t)) cls += " excluded";
        chip.className = cls;
        chip.dataset.category = cat;
        setTagColor(chip, cat, t);
        chip.innerHTML = getTagHTML(cat, t);
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          excludedTags.delete(t);
          if (activeTags.has(t)) activeTags.delete(t);
          else activeTags.add(t);
          renderTagPanel();
          renderGames();
        });
        chip.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          e.stopPropagation();
          activeTags.delete(t);
          if (excludedTags.has(t)) excludedTags.delete(t);
          else excludedTags.add(t);
          renderTagPanel();
          renderGames();
        });
        listEl.appendChild(chip);
      }
    });

    const activeContainer = document.getElementById("activeTagsContainer");
    const excludedContainer = document.getElementById("excludedTagsContainer");
    const clearBtn = document.getElementById("clearTagsBtn");
    const clearExcludedBtn = document.getElementById("clearExcludedBtn");

    if (activeContainer) {
      activeContainer.innerHTML = "";
      if (activeTags.size === 0) {
        const span = document.createElement("span");
        span.className = "no-active-tags";
        span.textContent = "Нет активных фильтров";
        activeContainer.appendChild(span);
      } else {
        for (const t of Array.from(activeTags)) {
          const chip = document.createElement("span");
          chip.className = "active-tag-chip";
          let foundCat = null;
          for (const c of Object.keys(allTags)) {
            if (allTags[c].has(t)) {
              foundCat = c;
              break;
            }
          }
          if (foundCat) {
            chip.dataset.category = foundCat;
            setTagColor(chip, foundCat, t);
          }
          chip.innerHTML = getTagHTML(foundCat, t) + '<span class="remove-tag">×</span>';
          chip.querySelector(".remove-tag").addEventListener("click", (e) => {
            e.stopPropagation();
            activeTags.delete(t);
            renderTagPanel();
            renderGames();
          });
          chip.addEventListener("click", (e) => {
            e.stopPropagation();
            activeTags.delete(t);
            renderTagPanel();
            renderGames();
          });
          activeContainer.appendChild(chip);
        }
      }
    }

    if (excludedContainer) {
      excludedContainer.innerHTML = "";
      if (excludedTags.size === 0) {
        const span = document.createElement("span");
        span.className = "no-active-tags";
        span.textContent = "Нет исключённых тегов";
        excludedContainer.appendChild(span);
      } else {
        for (const t of Array.from(excludedTags)) {
          const chip = document.createElement("span");
          chip.className = "excluded-tag-chip";
          let foundCat = null;
          for (const c of Object.keys(allTags)) {
            if (allTags[c].has(t)) {
              foundCat = c;
              break;
            }
          }
          if (foundCat) {
            chip.dataset.category = foundCat;
            setTagColor(chip, foundCat, t);
          }
          chip.innerHTML = getTagHTML(foundCat, t) + '<span class="remove-tag">×</span>';
          chip.querySelector(".remove-tag").addEventListener("click", (e) => {
            e.stopPropagation();
            excludedTags.delete(t);
            renderTagPanel();
            renderGames();
          });
          chip.addEventListener("click", (e) => {
            e.stopPropagation();
            excludedTags.delete(t);
            renderTagPanel();
            renderGames();
          });
          excludedContainer.appendChild(chip);
        }
      }
    }

    if (clearBtn) {
      clearBtn.style.display = activeTags.size > 0 ? "inline-block" : "none";
      clearBtn.onclick = () => {
        activeTags.clear();
        renderTagPanel();
        renderGames();
      };
    }
    if (clearExcludedBtn) {
      clearExcludedBtn.style.display = excludedTags.size > 0 ? "inline-block" : "none";
      clearExcludedBtn.onclick = () => {
        excludedTags.clear();
        renderTagPanel();
        renderGames();
      };
    }
  } catch (e) {
    console.error("renderTagPanel error:", e);
  }
}

function getMetaStoreItem(game) {
  if (!game.metaLink) {
    return '<div class="store-item empty"><div class="store-logo-wrap"><img class="store-logo" alt="Meta"></div><span class="store-rating no-rating">N/A</span></div>';
  }

  const isNA = game.metaRating === "N/A";
  const ratingClass = isNA ? ' no-rating' : '';
  let styleAttr = '';

  if (!isNA) {
    const val = parseFloat(String(game.metaRating).replace(',', '.'));
    if (!isNaN(val)) {
      const hue = Math.max(0, Math.min(1, val / 5)) * 120;
      styleAttr = ' style="color: hsl(' + Math.round(hue) + ', 80%, 55%);"';
    }
  }

  return '<div class="store-item"><div class="store-logo-wrap">' +
    '<a href="' + game.metaLink + '" target="_blank" rel="noopener">' +
    '<img src="images/icons/meta-logo.svg" class="store-logo meta-logo" alt="Meta Store"></a></div>' +
    '<span class="store-rating' + ratingClass + '"' + styleAttr + '>' + game.metaRating + '</span></div>';
}

function getSteamStoreItem(game) {
  if (!game.steamLink) {
    return '<div class="store-item empty"><div class="store-logo-wrap"><img class="store-logo" alt="Steam"></div><span class="store-rating no-rating">N/A</span></div>';
  }

  const isNA = game.steamRating === "N/A";
  const ratingClass = isNA ? ' no-rating' : '';
  let styleAttr = '';

  if (!isNA) {
    const val = parseFloat(String(game.steamRating).replace('%', '').replace(',', '.'));
    if (!isNaN(val)) {
      const hue = Math.max(0, Math.min(1, val / 100)) * 120;
      styleAttr = ' style="color: hsl(' + Math.round(hue) + ', 80%, 55%);"';
    }
  }

  return '<div class="store-item"><div class="store-logo-wrap">' +
    '<a href="' + game.steamLink + '" target="_blank" rel="noopener">' +
    '<img src="images/icons/steam-logo.svg" class="store-logo steam-logo" alt="Steam"></a></div>' +
    '<span class="store-rating' + ratingClass + '"' + styleAttr + '>' + game.steamRating + '</span></div>';
}

function getPricesRow(game) {
  let left = '';
  let right = '';
  if (game.metaLink) {
    left = '<div class="store-price"><span class="store-price-label">Meta</span>' + formatStorePrice(game.metaPrice, game.metaOriginalPrice) + '</div>';
  } else {
    left = '<div class="store-price empty"></div>';
  }
  if (game.steamLink) {
    right = '<div class="store-price"><span class="store-price-label">Steam</span>' + formatStorePrice(game.steamPrice, game.steamOriginalPrice) + '</div>';
  } else {
    right = '<div class="store-price empty"></div>';
  }
  if (!game.metaLink && !game.steamLink) return '';
  return '<div class="prices-row">' + left + right + '</div>';
}

function formatStorePrice(current, original) {
  const currentPrice = escapeHtml(String(current || '—'));
  const originalPrice = String(original || '').trim();
  const originalMarkup = originalPrice && originalPrice !== current
    ? '<del class="store-price-original">' + escapeHtml(originalPrice) + '</del>'
    : '';
  return '<span class="store-price-values' + (originalMarkup ? ' is-discounted' : '') + '">' +
    '<span class="store-price-value">' + currentPrice + '</span>' + originalMarkup + '</span>';
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function getHltbRow(game) {
  return '<div class="hltb-row">' +
    '<div class="hltb-cell"><span class="hltb-label">Основной сюжет</span>' + hltbDisplay(game.hltb.mainStory) + '</div>' +
    '<div class="hltb-cell"><span class="hltb-label">С доп. контентом</span>' + hltbDisplay(game.hltb.mainExtra) + '</div>' +
    '<div class="hltb-cell"><span class="hltb-label">На 100%</span>' + hltbDisplay(game.hltb.completionist) + '</div>' +
    '</div>';
}

function renderCollapsedHeader(game, prioritizeCover) {
  const tagsHtmlArr = [];
  for (const cat of TAG_ORDER) {
    for (const t of game.tags[cat]) {
      let tagClasses = 'game-tag';
      if (activeTags.has(t)) tagClasses += ' active';
      if (excludedTags.has(t)) tagClasses += ' excluded';
      tagsHtmlArr.push('<span class="' + tagClasses + '" style="--tag-color: ' + getTagColor(cat, t) + '" data-tag="' + escapeHTML(t) + '" data-category="' + cat + '">' + getTagHTML(cat, t) + '</span>');
	}
  }
  const tagsHtml = tagsHtmlArr.join('');

  return '<div class="game-page-title" data-background="' + escapeHTML(game.background) + '">' +
    '<img class="game-cover" src="' + game.cover + '" alt="Cover" loading="' + (prioritizeCover ? 'eager' : 'lazy') + '"' +
    (prioritizeCover ? ' fetchpriority="high"' : '') + ' decoding="async">' +
    '<div class="quick-info">' +
    '<h3>' + game.title + '</h3>' +
    '<p class="game-short-desc">' + (game.shortDescription || '') + '</p>' +
    '<div class="tags-row">' + tagsHtml + '</div>' +
    '</div>' +
    '<svg class="collapse-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">' +
    '<path d="M12 15.172l4.95-4.95 1.414 1.414L12 18l-6.364-6.364 1.414-1.414z" fill="rgba(255,255,255,1)"/>' +
    '</svg>' +
    '</div>';
}

function renderExpandedContent(game, gameIdx) {
  return '<div class="game-page-content">' +
    '<div class="game-page-content-inner">' +
    '<div class="game-page-content-media">' +
    '<div class="main-viewer" data-game-idx="' + gameIdx + '">' +
    renderMainViewerDefault(game) +
    '</div>' +
    '<div class="carousel-wrapper">' +
    '<button class="carousel-btn left" data-dir="left" data-game-idx="' + gameIdx + '">❮</button>' +
    '<div class="image-carousel" data-game-idx="' + gameIdx + '">' +
    renderCarouselItems(game, gameIdx) +
    '</div>' +
    '<button class="carousel-btn right" data-dir="right" data-game-idx="' + gameIdx + '">❯</button>' +
    '</div>' +
    '</div>' +
    '<div class="game-page-content-description">' +
    '<div class="logos-row">' +
    getMetaStoreItem(game) +
    '<div class="game-logo-container"><img class="game-logo" src="' + game.logo + '" alt="Logo" decoding="async"></div>' +
    getSteamStoreItem(game) +
    '</div>' +
    getPricesRow(game) +
    getHltbRow(game) +
    '<div class="game-description-text">' + (game.longDescription || game.shortDescription || '') + '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
}

function renderMainViewerDefault(game) {
  const firstScr = game.screenshots[0] || '';
  return '<img src="' + firstScr + '" alt="Screenshot" decoding="async">';
}

function renderCarouselItems(game, gameIdx) {
  let html = '';
  const trailerUrl = (typeof game.trailer === 'string') ? game.trailer : (game.trailer?.youtubeUrl || game.trailer?.youtubeId || '');
  const thumb = getYoutubeThumbnail(trailerUrl);
  if (thumb) {
    html += '<div class="carousel-item trailer-thumb" data-type="trailer" data-game-idx="' + gameIdx + '" data-index="0">' +
      '<img src="' + thumb + '" alt="Trailer" loading="lazy" decoding="async">' +
      '<div class="trailer-play-overlay">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
      '</div></div>';
  }
  game.screenshots.forEach((scr, i) => {
    const selected = (i === 0 && !thumb) ? ' selected' : (i === 0 && thumb ? '' : (thumb ? '' : (i === 0 ? ' selected' : '')));
    const correctedSelected = (!thumb && i === 0) ? ' selected' : (thumb ? (i === 0 ? '' : '') : '');
    html += '<div class="carousel-item' + ( (!thumb && i === 0) ? ' selected' : '' ) + '" data-type="screenshot" data-game-idx="' + gameIdx + '" data-index="' + (thumb ? i + 1 : i) + '">' +
      '<img src="' + scr + '" alt="Screenshot ' + (i + 1) + '" loading="lazy" decoding="async"></div>';
  });
  return html;
}

function selectMediaItem(gameEl, gameIdx, dataIndex) {
  const game = GAMES_DATA[gameIdx];
  const mainViewer = gameEl.querySelector('.main-viewer');
  if (!mainViewer || !game) return;

  const items = gameEl.querySelectorAll('.carousel-item');
  items.forEach(it => it.classList.remove('selected'));
  const targetItem = gameEl.querySelector('.carousel-item[data-index="' + dataIndex + '"]');
  if (targetItem) targetItem.classList.add('selected');

  const idx = parseInt(dataIndex, 10);
  const trailerUrl = (typeof game.trailer === 'string') ? game.trailer : (game.trailer?.youtubeUrl || game.trailer?.youtubeId || '');
  const hasTrailer = !!trailerUrl;
  const ytId = extractYoutubeId(trailerUrl);

  if (hasTrailer && idx === 0) {
    const thumb = getYoutubeThumbnail(trailerUrl);
    mainViewer.innerHTML = '<img src="' + thumb + '" alt="Trailer">' +
      '<div class="trailer-overlay" data-game-idx="' + gameIdx + '">' +
      '<div class="play-icon-big">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
      '</div></div>';
    const overlay = mainViewer.querySelector('.trailer-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        stopAutoCycle(gameIdx);
        mainViewer.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytId +
          '?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    }
  } else {
    const scrIdx = hasTrailer ? idx - 1 : idx;
    const src = game.screenshots[scrIdx] || '';
    mainViewer.innerHTML = '<img src="' + src + '" alt="Screenshot">';
  }
}

function stopAutoCycle(gameIdx) {
  try {
    const state = carouselStates.get(gameIdx);
    if (state && state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  } catch (e) { /* ignore */ }
}

function startAutoCycle(gameEl, gameIdx) {
  stopAutoCycle(gameIdx);
  const game = GAMES_DATA[gameIdx];
  const trailerUrl = (typeof game?.trailer === 'string') ? game.trailer : (game?.trailer?.youtubeUrl || game?.trailer?.youtubeId || '');
  const hasTrailer = !!trailerUrl;
  const totalItems = (game?.screenshots?.length || 0) + (hasTrailer ? 1 : 0);
  if (totalItems <= 1) return;

  let state = carouselStates.get(gameIdx);
  if (!state) {
    state = { selectedIndex: hasTrailer ? 1 : 0, intervalId: null };
    carouselStates.set(gameIdx, state);
  } else {
    state.selectedIndex = hasTrailer ? 1 : 0;
  }

  state.intervalId = setInterval(() => {
    try {
      const s = carouselStates.get(gameIdx);
      if (!s || !s.intervalId) return;
      const maxIdx = totalItems - 1;
      let next = s.selectedIndex + 1;
      if (next > maxIdx) {
        next = hasTrailer ? 1 : 0;
      }
      s.selectedIndex = next;
      if (gameEl && gameEl.isConnected && gameEl.classList.contains('open')) {
        selectMediaItem(gameEl, gameIdx, String(next));
      } else {
        stopAutoCycle(gameIdx);
      }
    } catch (e) {
      stopAutoCycle(gameIdx);
    }
  }, 4000);
}

function bindCarouselEvents(gameEl, gameIdx) {
  const carouselEl = gameEl.querySelector('.image-carousel');
  if (!carouselEl) return;

  const btnLeft = gameEl.querySelector('.carousel-btn.left');
  const btnRight = gameEl.querySelector('.carousel-btn.right');
  if (btnLeft) {
    btnLeft.addEventListener('click', (e) => {
      e.stopPropagation();
      carouselEl.scrollBy({ left: -260, behavior: 'smooth' });
      stopAutoCycle(gameIdx);
    });
  }
  if (btnRight) {
    btnRight.addEventListener('click', (e) => {
      e.stopPropagation();
      carouselEl.scrollBy({ left: 260, behavior: 'smooth' });
      stopAutoCycle(gameIdx);
    });
  }

  const items = gameEl.querySelectorAll('.carousel-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoCycle(gameIdx);
      const dataIdx = item.dataset.index;
      const state = carouselStates.get(gameIdx);
      if (state) state.selectedIndex = parseInt(dataIdx, 10);
      selectMediaItem(gameEl, gameIdx, dataIdx);
    });
  });
}

function bindGameTagClicks(gameEl) {
  const chips = gameEl.querySelectorAll('.game-tag');
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = chip.dataset.tag;
      if (!t) return;
      excludedTags.delete(t);
      if (activeTags.has(t)) activeTags.delete(t);
      else activeTags.add(t);
      renderTagPanel();
      renderGames();
    });
    chip.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = chip.dataset.tag;
      if (!t) return;
      activeTags.delete(t);
      if (excludedTags.has(t)) excludedTags.delete(t);
      else excludedTags.add(t);
      renderTagPanel();
      renderGames();
    });
  });
}

function observeGameBackground(gameEl) {
  const loadBackground = (title) => {
    const background = title.dataset.background;
    if (!background) return;
    const backgroundUrl = new URL(background, document.baseURI);
    title.style.setProperty('--bg', `url(${JSON.stringify(backgroundUrl.href)})`);
    delete title.dataset.background;
  };

  if (!('IntersectionObserver' in window)) {
    const title = gameEl.querySelector('.game-page-title');
    if (title) loadBackground(title);
    return;
  }

  if (!gameBackgroundObserver) {
    gameBackgroundObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const title = entry.target.querySelector('.game-page-title');
        if (title) loadBackground(title);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });
  }

  gameBackgroundObserver.observe(gameEl);
}

function renderGames() {
  const container = document.getElementById("game-list-container");
  if (!container) return;

  if (gameBackgroundObserver) {
    gameBackgroundObserver.disconnect();
    gameBackgroundObserver = null;
  }

  for (const [idx, state] of carouselStates) {
    if (state && state.intervalId) clearInterval(state.intervalId);
  }
  carouselStates.clear();

  container.innerHTML = "";
  const games = filterGames();

  if (games.length === 0) {
    const p = document.createElement("div");
    p.className = "no-games-found";
    p.textContent = "Совпадений не найдено. Попробуйте изменить фильтры или поисковый запрос.";
    container.appendChild(p);
    return;
  }

  games.forEach((game, index) => {
    const gameIdx = GAMES_DATA.indexOf(game);
    const gameEl = document.createElement("div");
    gameEl.className = "game-page";
    gameEl.dataset.gameSlug = game.slug;

    gameEl.innerHTML = renderCollapsedHeader(game, index === 0);
    container.appendChild(gameEl);
    observeGameBackground(gameEl);

    const titleBtn = gameEl.querySelector('.game-page-title');
    if (titleBtn) {
      titleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = gameEl.classList.contains('open');
        gameEl.classList.toggle('open');
        if (!wasOpen) {
          gameEl.insertAdjacentHTML('beforeend', renderExpandedContent(game, gameIdx));
          bindCarouselEvents(gameEl, gameIdx);
          const state = { selectedIndex: 1, intervalId: null };
          carouselStates.set(gameIdx, state);
          startAutoCycle(gameEl, gameIdx);
        } else {
          stopAutoCycle(gameIdx);
          carouselStates.delete(gameIdx);
          gameEl.querySelector('.game-page-content')?.remove();
        }
      });
    }

    bindGameTagClicks(gameEl);
  });
}

async function initApp() {
  console.log('initApp called');

  await loadIntroduction();

  await loadGamesData();
  console.log('Games data loaded, GAMES_DATA length:', GAMES_DATA.length);

  try {
    const introHidden = localStorage.getItem("vr_intro_hidden");
    const introEl = document.getElementById("introduction");
    const introCheck = document.getElementById("intro-status");
    if (introHidden === "true" && introEl) {
      introEl.classList.add("hidden");
      if (introCheck) introCheck.checked = true;
    }
    if (introCheck) {
      introCheck.addEventListener("change", () => {
        try {
          if (introEl) introEl.classList.toggle("hidden", introCheck.checked);
          localStorage.setItem("vr_intro_hidden", introCheck.checked ? "true" : "false");
        } catch (e) { console.error(e); }
      });
    }
  } catch (e) {
    console.error("Intro init error:", e);
  }

  try {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      const debounced = debounce((e) => {
        activeSearch = e.target.value || "";
        renderGames();
      }, 150);
      searchInput.addEventListener("input", debounced);
    }
  } catch (e) {
    console.error("Search init error:", e);
  }

  try {
    renderTagPanel();
    renderGames();
  } catch (e) {
    console.error("Render init error:", e);
  }
}

document.addEventListener("DOMContentLoaded", initApp);