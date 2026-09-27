let GAMES_DATA = [];

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
    const indexResponse = await fetch('vr-stuff/games/index.json');
    const indexData = await indexResponse.json();
    console.log('Loaded index.json with', indexData.length, 'games');

    const gamePromises = indexData.map(async (gameEntry) => {
      try {
        console.log('Loading game:', gameEntry.path);
        const response = await fetch(gameEntry.path);
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
    if (!g.tags) g.tags = { platforms: [], genres: [], gameModes: ["Singleplayer"], themes: [] };
    if (!g.tags.gameModes) g.tags.gameModes = [];
    if (!g.tags.gameModes.includes("Singleplayer")) g.tags.gameModes.unshift("Singleplayer");
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
    "Fighting": "Файтинг",
    "Platformer": "Платформер",
    "Puzzle": "Головоломка",
    "Rhythm": "Ритм",
    "Roguelike": "Рогалик",
    "RPG": "РПГ",
    "Sandbox": "Песочница",
    "Shooter": "Шутер",
    "Simulation": "Симулятор",
    "Sports": "Спорт",
    "Stealth": "Стелс",
    "Strategy": "Стратегия"
  },
  "gameModes": {
    "Co-op": "Кооператив",
    "Multiplayer": "Мультиплеер",
    "Singleplayer": "Одиночная игра"
  },
  "themes": {
    "Comedy": "Комедия",
    "Historical": "Исторический",
    "Horror": "Хоррор",
    "Narrative": "Повествовательная",
    "Open World": "Открытый мир",
    "Post-Apocalyptic": "Постапокалипсис",
    "Survival": "Выживание"
  }
};

const TAG_ORDER = ["platforms", "genres", "gameModes", "themes"];

let activeSearch = "";
let activeTags = new Set();
const carouselStates = new Map();

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

function filterGames() {
  const q = activeSearch.trim().toLowerCase();
  return GAMES_DATA.filter(game => {
    const matchesSearch = !q ||
      game.title.toLowerCase().includes(q) ||
      (game.shortDescription && game.shortDescription.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    if (activeTags.size === 0) return true;
    const combined = getCombinedTags(game);
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
      const tags = Array.from(allTags[cat] || []).sort();
      for (const t of tags) {
        const chip = document.createElement("span");
        chip.className = "tag-chip" + (activeTags.has(t) ? " active" : "");
        chip.dataset.category = cat;
        chip.textContent = getTagLabel(cat, t);
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          if (activeTags.has(t)) activeTags.delete(t);
          else activeTags.add(t);
          renderTagPanel();
          renderGames();
        });
        listEl.appendChild(chip);
      }
    });

    const activeContainer = document.getElementById("activeTagsContainer");
    const clearBtn = document.getElementById("clearTagsBtn");
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
          if (foundCat) chip.dataset.category = foundCat;
          chip.innerHTML = getTagLabel(foundCat, t) + '<span class="remove-tag">×</span>';
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
    if (clearBtn) {
      clearBtn.style.display = activeTags.size > 0 ? "inline-block" : "none";
      clearBtn.onclick = () => {
        activeTags.clear();
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
  const ratingClass = game.metaRating === "N/A" ? ' no-rating' : '';
  return '<div class="store-item"><div class="store-logo-wrap">' +
    '<a href="' + game.metaLink + '" target="_blank" rel="noopener">' +
    '<img src="images/icons/meta-logo.png" class="store-logo meta-logo" alt="Meta Store"></a></div>' +
    '<span class="store-rating' + ratingClass + '">' + game.metaRating + '</span></div>';
}

function getSteamStoreItem(game) {
  if (!game.steamLink) {
    return '<div class="store-item empty"><div class="store-logo-wrap"><img class="store-logo" alt="Steam"></div><span class="store-rating no-rating">N/A</span></div>';
  }
  const ratingClass = game.steamRating === "N/A" ? ' no-rating' : '';
  return '<div class="store-item"><div class="store-logo-wrap">' +
    '<a href="' + game.steamLink + '" target="_blank" rel="noopener">' +
    '<img src="images/icons/steam-logo.png" class="store-logo steam-logo" alt="Steam"></a></div>' +
    '<span class="store-rating' + ratingClass + '">' + game.steamRating + '</span></div>';
}

function getPricesRow(game) {
  let left = '';
  let right = '';
  if (game.metaLink) {
    left = '<div class="store-price"><span class="store-price-label">Meta</span><span class="store-price-value">' + game.metaPrice + '</span></div>';
  } else {
    left = '<div class="store-price empty"></div>';
  }
  if (game.steamLink) {
    right = '<div class="store-price"><span class="store-price-label">Steam</span><span class="store-price-value">' + game.steamPrice + '</span></div>';
  } else {
    right = '<div class="store-price empty"></div>';
  }
  if (!game.metaLink && !game.steamLink) return '';
  return '<div class="prices-row">' + left + right + '</div>';
}

function getHltbRow(game) {
  return '<div class="hltb-row">' +
    '<div class="hltb-cell"><span class="hltb-label">Основной сюжет</span>' + hltbDisplay(game.hltb.mainStory) + '</div>' +
    '<div class="hltb-cell"><span class="hltb-label">С доп. контентом</span>' + hltbDisplay(game.hltb.mainExtra) + '</div>' +
    '<div class="hltb-cell"><span class="hltb-label">На 100%</span>' + hltbDisplay(game.hltb.completionist) + '</div>' +
    '</div>';
}

function renderCollapsedHeader(game) {
  const tagsHtmlArr = [];
  for (const cat of TAG_ORDER) {
    for (const t of game.tags[cat]) {
      const isActive = activeTags.has(t) ? ' active' : '';
      tagsHtmlArr.push('<span class="game-tag' + isActive + '" data-tag="' + t.replace(/"/g, '&quot;') + '" data-category="' + cat + '">' + getTagLabel(cat, t) + '</span>');
    }
  }
  const tagsHtml = tagsHtmlArr.join('');

  return '<div class="game-page-title" style="--bg: url(\'' + game.background + '\');">' +
    '<img class="game-cover" src="' + game.cover + '" alt="Cover">' +
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
    '<div class="game-logo-container"><img class="game-logo" src="' + game.logo + '" alt="Logo"></div>' +
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
  return '<img src="' + firstScr + '" alt="Screenshot">';
}

function renderCarouselItems(game, gameIdx) {
  let html = '';
  html += '<div class="carousel-item trailer-thumb" data-type="trailer" data-game-idx="' + gameIdx + '" data-index="0">' +
    '<img src="' + game.trailer.thumbnail + '" alt="Trailer">' +
    '<div class="trailer-play-overlay">' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
    '</div></div>';
  game.screenshots.forEach((scr, i) => {
    const selected = i === 0 ? ' selected' : '';
    html += '<div class="carousel-item' + selected + '" data-type="screenshot" data-game-idx="' + gameIdx + '" data-index="' + (i + 1) + '">' +
      '<img src="' + scr + '" alt="Screenshot ' + (i + 1) + '"></div>';
  });
  return html;
}

function setupCarouselDrag(carouselEl, gameIdx) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onDown = (e) => {
    isDown = true;
    carouselEl.classList.add('active');
    startX = (e.pageX || e.touches?.[0]?.pageX || 0) - carouselEl.offsetLeft;
    scrollLeft = carouselEl.scrollLeft;
    stopAutoCycle(gameIdx);
  };
  const onLeave = () => {
    isDown = false;
    carouselEl.classList.remove('active');
  };
  const onUp = () => {
    isDown = false;
    carouselEl.classList.remove('active');
  };
  const onMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = (e.pageX || e.touches?.[0]?.pageX || 0) - carouselEl.offsetLeft;
    const walk = (x - startX) * 2;
    carouselEl.scrollLeft = scrollLeft - walk;
  };

  carouselEl.addEventListener('mousedown', onDown);
  carouselEl.addEventListener('mouseleave', onLeave);
  carouselEl.addEventListener('mouseup', onUp);
  carouselEl.addEventListener('mousemove', onMove);
  carouselEl.addEventListener('touchstart', onDown, { passive: true });
  carouselEl.addEventListener('touchend', onUp);
  carouselEl.addEventListener('touchmove', onMove, { passive: false });
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
  if (idx === 0) {
    mainViewer.innerHTML = '<img src="' + game.trailer.thumbnail + '" alt="Trailer">' +
      '<div class="trailer-overlay" data-game-idx="' + gameIdx + '">' +
      '<div class="play-icon-big">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
      '</div></div>';
    const overlay = mainViewer.querySelector('.trailer-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        stopAutoCycle(gameIdx);
        mainViewer.innerHTML = '<iframe src="https://www.youtube.com/embed/' + game.trailer.youtubeId +
          '?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    }
  } else {
    const scrIdx = idx - 1;
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
  const totalItems = (GAMES_DATA[gameIdx]?.screenshots?.length || 0) + 1;
  if (totalItems <= 1) return;

  let state = carouselStates.get(gameIdx);
  if (!state) {
    state = { selectedIndex: 1, intervalId: null };
    carouselStates.set(gameIdx, state);
  } else {
    state.selectedIndex = 1;
  }

  state.intervalId = setInterval(() => {
    try {
      const s = carouselStates.get(gameIdx);
      if (!s || !s.intervalId) return;
      const maxIdx = totalItems - 1;
      let next = s.selectedIndex + 1;
      if (next > maxIdx) {
        next = 1;
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

  setupCarouselDrag(carouselEl, gameIdx);

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
      if (activeTags.has(t)) activeTags.delete(t);
      else activeTags.add(t);
      renderTagPanel();
      renderGames();
    });
  });
}

function renderGames() {
  const container = document.getElementById("game-list-container");
  if (!container) return;

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

  games.forEach(game => {
    const gameIdx = GAMES_DATA.indexOf(game);
    const gameEl = document.createElement("div");
    gameEl.className = "game-page";
    gameEl.dataset.gameSlug = game.slug;

    gameEl.innerHTML = renderCollapsedHeader(game) + renderExpandedContent(game, gameIdx);
    container.appendChild(gameEl);

    const titleBtn = gameEl.querySelector('.game-page-title');
    if (titleBtn) {
      titleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = gameEl.classList.contains('open');
        gameEl.classList.toggle('open');
        if (!wasOpen) {
          bindCarouselEvents(gameEl, gameIdx);
          const state = { selectedIndex: 1, intervalId: null };
          carouselStates.set(gameIdx, state);
          startAutoCycle(gameEl, gameIdx);
        } else {
          stopAutoCycle(gameIdx);
          carouselStates.delete(gameIdx);
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