const translations = {
    ru: {
        title: "Шкала градиента",
        theme: "Переключить тему",
        help: "Помощь",
        lang: "Переключить язык (Switch Language)",
        undo: "Отменить",
        redo: "Вернуть",
        viewBottom: "Вид: Снизу",
        viewCenter: "Вид: По центру",
        add: "Добавить",
        reset: "Сбросить",
        zoomReset: "Сбросить приближение",
        screenshot: "Скриншот",
        titlePlaceholder: "Введите заголовок...",
        modalTitle: "Как пользоваться сайтом",
        modalItems: [
            "<b>Заголовок:</b> Кликните на текст \"Введите заголовок...\", чтобы его изменить.",
            "<b>Добавить:</b> Кнопка \"+\" на левой панели добавляет новый элемент.",
            "<b>Удалить:</b> Наведите курсор на элемент, появится красный крестик. Нажмите, чтобы удалить элемент.",
            "<b>Перемещение:</b> Нажмите и удерживайте текстовое поле, чтобы перетащить его на новую позицию.",
            "<b>Картинки:</b> Наведите курсор на текстовое поле, и над ним появится синяя кнопка \"+\". Скопируйте картинку и нажмите на \"+\", чтобы вставить ее. Чтобы её убрать, нажмите на серую кнопку с минусом.",
            "<b>Отменить/Вернуть:</b> Кнопки со стрелками отменяют или возвращают последнее действие (кроме масштаба/вида).",
            "<b>Вид:</b> Кнопки по центру левой панели меняют компоновку шкалы.",
            "<b>Масштаб:</b> Используйте ползунок на левой панели, чтобы растянуть шкалу.",
            "<b>Скриншот:</b> Кнопка \"Камера\" делает снимок всей вашей шкалы включая заголовок и скачивает его.",
            "<b>Сохранение:</b> Все изменения (порядок, текст, изображения, вид, заголовок) сохраняются автоматически."
        ],
        resetConfirm: "Вы уверены, что хотите сбросить всю шкалу? Это действие необратимо.",
        clipboardDenied: "Доступ к буферу обмена запрещен.",
        imgNotFound: "Картинка не найдена в буфере обмена.",
        pasteError: "Не удалось вставить картинку. ",
        screenshotError: "Не удалось сделать скриншот.",
        defaultText: "Введите текст",
        pasteImgTitle: "Вставить картинку из буфера обмена",
        removeImgTitle: "Удалить картинку",
        removeDivTitle: "Удалить элемент"
    },
    en: {
        title: "Gradient Scale",
        theme: "Toggle Theme",
        help: "Help",
        lang: "Переключить язык (Switch Language)",
        undo: "Undo",
        redo: "Redo",
        viewBottom: "View: Bottom",
        viewCenter: "View: Center",
        add: "Add",
        reset: "Reset",
        zoomReset: "Reset Zoom",
        screenshot: "Screenshot",
        titlePlaceholder: "Enter a title...",
        modalTitle: "How to use this site",
        modalItems: [
            "<b>Title:</b> Click the text \"Enter a title...\" to change it.",
            "<b>Add:</b> The \"+\" button on the left panel adds a new item.",
            "<b>Delete:</b> Hover over an item, a red cross will appear. Click to delete the item.",
            "<b>Move:</b> Click and hold the text field to drag it to a new position.",
            "<b>Images:</b> Hover over a text field, and a blue \"+\" button will appear above it. Copy an image and click \"+\" to paste it. To remove it, click the gray minus button.",
            "<b>Undo/Redo:</b> The arrow buttons undo or redo the last action (except zoom/view).",
            "<b>View:</b> The buttons in the center of the left panel change the scale layout.",
            "<b>Zoom:</b> Use the slider on the left panel to stretch the scale.",
            "<b>Screenshot:</b> The \"Camera\" button takes a picture of your entire scale including the title and downloads it.",
            "<b>Saving:</b> All changes (order, text, images, view, title) are saved automatically."
        ],
        resetConfirm: "Are you sure you want to reset the entire scale? This action cannot be undone.",
        clipboardDenied: "Clipboard access denied.",
        imgNotFound: "No image found in clipboard.",
        pasteError: "Failed to paste image. ",
        screenshotError: "Failed to take screenshot.",
        defaultText: "Enter text",
        pasteImgTitle: "Paste image from clipboard",
        removeImgTitle: "Remove image",
        removeDivTitle: "Remove item"
    }
};

document.addEventListener('DOMContentLoaded', () => {

    const contentArea = document.getElementById('contentArea');
    const scaleBar = document.getElementById('scaleBar');
    const scaleStartLabel = document.getElementById('scale-start-label');
    const scaleEndLabel = document.getElementById('scale-end-label');
    const addButton = document.getElementById('addButton');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const modalClose = document.getElementById('modalClose');
    const zoomSlider = document.getElementById('zoom-slider');
    const scalePanningContainer = document.getElementById('scalePanningContainer');
    const viewModeBottomBtn = document.getElementById('viewModeBottomBtn');
    const viewModeCenterBtn = document.getElementById('viewModeCenterBtn');
    const scaleTitle = document.getElementById('scale-title');
    const resetButton = document.getElementById('resetButton');
    const screenshotButton = document.getElementById('screenshotButton');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const langToggleButton = document.getElementById('lang-toggle-btn');

    let divisionsData = [];
    let draggedElement = null;
    let draggedId = null;
    let db = null;
    let currentViewMode = 'bottom';
    const MAX_TITLE_FONT_SIZE = 2.5;
    const MIN_TITLE_FONT_SIZE = 0.8;
    const DB_NAME = 'ScaleDB';
    const STORE_NAME = 'divisions';

    let historyStack = [];
    let historyIndex = -1;
    let isRestoringState = false;
    let currentLang;

    function getInitialLang() {
        const savedLang = localStorage.getItem('appLang');
        if (savedLang && translations[savedLang]) {
            return savedLang;
        }
        const browserLang = navigator.language.split('-')[0];
        return (browserLang === 'ru') ? 'ru' : 'en';
    }

    function updateUI(lang) {
        if (!translations[lang]) lang = 'en';
        currentLang = lang;
        const t = translations[lang];

        document.documentElement.lang = lang;
        document.title = t.title;

        themeToggleButton.title = t.theme;
        helpBtn.title = t.help;
        undoBtn.title = t.undo;
        redoBtn.title = t.redo;
        viewModeBottomBtn.title = t.viewBottom;
        viewModeCenterBtn.title = t.viewCenter;
        addButton.title = t.add;
        resetButton.title = t.reset;
        zoomResetBtn.title = t.zoomReset;
        screenshotButton.title = t.screenshot;
        langToggleButton.title = t.lang;

        scaleTitle.dataset.placeholder = t.titlePlaceholder;

        const modal = document.getElementById('help-modal');
        modal.querySelector('h2').innerText = t.modalTitle;
        const modalList = modal.querySelector('ul');
        modalList.innerHTML = '';
        t.modalItems.forEach(itemText => {
            const li = document.createElement('li');
            li.innerHTML = itemText;
            modalList.appendChild(li);
        });

        renderDivisions();
    }

    langToggleButton.addEventListener('click', () => {
        const newLang = (currentLang === 'ru') ? 'en' : 'ru';
        localStorage.setItem('appLang', newLang);
        updateUI(newLang);
    });

    async function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
            request.onerror = (event) => reject(event.target.errorCode);
        });
    }

    async function loadData() {
        return new Promise((resolve, reject) => {
            if (!db) return reject("DB not initialized");
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const data = request.result.sort((a, b) => a.order - b.order);
                resolve(data);
            };
            request.onerror = (event) => reject(event.target.errorCode);
        });
    }

    async function saveData() {
        if (!db || isRestoringState) return;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.clear().onsuccess = () => {
                if (divisionsData.length === 0) {
                    resolve();
                    return;
                }
                let count = 0;
                divisionsData.forEach((item, index) => {
                    item.order = index;
                    const request = store.put(item);
                    request.onsuccess = () => {
                        count++;
                        if (count === divisionsData.length) {
                            resolve();
                        }
                    };
                    request.onerror = (e) => reject(e.target.errorCode);
                });
            };
        });
    }

    function getDefaultData() {
        return [
            { id: 1, text: translations[currentLang].defaultText, image: null, order: 0 },
            { id: 2, text: translations[currentLang].defaultText, image: null, order: 1 },
            { id: 3, text: translations[currentLang].defaultText, image: null, order: 2 },
            { id: 4, text: translations[currentLang].defaultText, image: null, order: 3 }
        ];
    }

    async function resetDataToDefault() {
        if (confirm(translations[currentLang].resetConfirm)) {
            divisionsData = getDefaultData();
            scaleStartLabel.innerText = '0';
            scaleEndLabel.innerText = '10';
            localStorage.removeItem('scaleStartText');
            localStorage.removeItem('scaleEndText');
            captureState();
            await saveData();
            scaleTitle.innerText = '';
            localStorage.removeItem('scaleTitle');
            adjustTitleFontSize();
            renderDivisions();
        }
    }

    function updateUndoRedoButtons() {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= historyStack.length - 1;
    }

    function captureState() {
        if (isRestoringState) return;

        try {
            const newState = divisionsData.map(item => ({ ...item }));
            historyStack = historyStack.slice(0, historyIndex + 1);
            historyStack.push(newState);
            historyIndex++;
            updateUndoRedoButtons();
        } catch (e) {
            console.error("Ошибка клонирования состояния для истории:", e);
        }
    }

    function undo() {
        if (historyIndex <= 0) return;

        isRestoringState = true;
        historyIndex--;
        try {
            divisionsData = historyStack[historyIndex].map(item => ({ ...item }));
            renderDivisions();
            saveData();
        } catch (e) {
            console.error("Ошибка восстановления состояния:", e);
            historyIndex++;
        } finally {
            isRestoringState = false;
            updateUndoRedoButtons();
        }
    }

    function redo() {
        if (historyIndex >= historyStack.length - 1) return;

        isRestoringState = true;
        historyIndex++;
        try {
            divisionsData = historyStack[historyIndex].map(item => ({ ...item }));
            renderDivisions();
            saveData();
        } catch (e) {
            console.error("Ошибка восстановления состояния:", e);
            historyIndex--;
        } finally {
            isRestoringState = false;
            updateUndoRedoButtons();
        }
    }

    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);


    const applyTheme = (theme) => document.body.classList.toggle('dark-mode', theme === 'dark');
    themeToggleButton.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    helpBtn.addEventListener('click', () => { helpModal.style.display = 'flex'; });
    modalClose.addEventListener('click', () => { helpModal.style.display = 'none'; });
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    function adjustTitleFontSize() {
        const el = scaleTitle;
        let currentFontSize = MAX_TITLE_FONT_SIZE;
        el.style.fontSize = currentFontSize + 'em';

        if (el.clientWidth === 0) return;

        while (el.scrollWidth > el.clientWidth && currentFontSize > MIN_TITLE_FONT_SIZE) {
            currentFontSize -= 0.1;
            el.style.fontSize = currentFontSize + 'em';
        }
    }

    scaleTitle.addEventListener('input', () => {
        adjustTitleFontSize();
        localStorage.setItem('scaleTitle', scaleTitle.innerText);
    });
    scaleTitle.addEventListener('change', () => {
        captureState();
    });

    scaleStartLabel.addEventListener('input', () => {
    localStorage.setItem('scaleStartText', scaleStartLabel.innerText);
    renderDivisions();
});

scaleEndLabel.addEventListener('input', () => {
    localStorage.setItem('scaleEndText', scaleEndLabel.innerText);
    renderDivisions();
});

[scaleStartLabel, scaleEndLabel].forEach(label => {
    label.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            label.blur();
        }
    });
});

    zoomSlider.addEventListener('input', (e) => {
        const zoomLevel = e.target.value;
        scalePanningContainer.style.width = `${zoomLevel * 100}%`;
        renderDivisions();
    });

    zoomResetBtn.addEventListener('click', () => {
        zoomSlider.value = "1";
        scalePanningContainer.style.width = `100%`;
        setTimeout(renderDivisions, 0);
    });


    function applyViewMode(mode) {
        currentViewMode = mode;
        contentArea.classList.toggle('view-mode-center', mode === 'center');
        viewModeBottomBtn.disabled = (mode === 'bottom');
        viewModeCenterBtn.disabled = (mode === 'center');
    }

    function setAndSaveViewMode(mode) {
        applyViewMode(mode);
        localStorage.setItem('viewMode', mode);
        renderDivisions();
    }

    viewModeBottomBtn.addEventListener('click', () => setAndSaveViewMode('bottom'));
    viewModeCenterBtn.addEventListener('click', () => setAndSaveViewMode('center'));

    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async function takeScreenshot() {
        const titleEl = document.getElementById('scale-title');
        const scaleContainerEl = document.getElementById('scalePanningContainer');
        const titleValue = titleEl.innerText.trim();

        const captureDiv = document.createElement('div');
        captureDiv.style.position = 'absolute';
        captureDiv.style.left = '-9999px';
        captureDiv.style.width = Math.max(scaleContainerEl.scrollWidth, titleEl.scrollWidth) + 40 + 'px';
        captureDiv.style.padding = '20px';
        captureDiv.style.display = 'flex';
        captureDiv.style.flexDirection = 'column';
        captureDiv.style.alignItems = 'center';

        const bgColor = getComputedStyle(document.body).backgroundColor;
        captureDiv.style.background = bgColor;

        if (titleValue !== '') {
            const titleClone = titleEl.cloneNode(true);
            titleClone.style.fontSize = scaleTitle.style.fontSize;
            titleClone.style.width = '100%';
            titleClone.style.color = getComputedStyle(titleEl).color;
            titleClone.style.marginBottom = '0px';
            titleClone.style.padding = '20px 0 10px 0';
            captureDiv.appendChild(titleClone);

        }

        const scaleClone = scaleContainerEl.cloneNode(true);
        scaleClone.style.width = '100%';
        if (currentViewMode === 'center') {
            scaleClone.style.paddingTop = '0px';
        }
        scaleClone.style.paddingBottom = getComputedStyle(scaleContainerEl).paddingBottom || '0px';

        const allInputs = scaleClone.querySelectorAll('input[type="text"]');
        allInputs.forEach(input => {
            const style = getComputedStyle(input);
            const text = input.value;
            const parent = input.parentNode;

            const div = document.createElement('div');
            div.innerText = text;
            div.className = 'screenshot-text-div-replacement';
            div.style.width = style.width;
            div.style.height = style.height;
            div.style.padding = style.padding;
            div.style.margin = style.margin;
            div.style.boxSizing = style.boxSizing;
            div.style.order = style.order;

            const computedBodyStyle = getComputedStyle(document.body);
            const inputBgColor = computedBodyStyle.getPropertyValue('--input-bg-color').trim() || '#2a2a2a';
            const inputBorderColor = computedBodyStyle.getPropertyValue('--input-border-color').trim() || '#555';
            const textColor = computedBodyStyle.getPropertyValue('--text-color').trim() || '#e0e0e0';

            div.style.backgroundColor = inputBgColor;
            div.style.border = `1px solid ${inputBorderColor}`;
            div.style.borderRadius = style.borderRadius;

            div.style.color = textColor;
            div.style.fontSize = style.fontSize;
            div.style.textAlign = style.textAlign;

            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';

            div.style.pointerEvents = 'none';
            div.style.cursor = 'default';

            parent.insertBefore(div, input);
            parent.removeChild(input);
        });


        const allImgTags = scaleClone.querySelectorAll('.image-container img');
        const conversionPromises = [];

        allImgTags.forEach(imgTag => {
            const container = imgTag.closest('.division-container');
            if (container) {
                const id = Number(container.dataset.id);
                const item = divisionsData.find(d => d.id === id);
                if (item && item.image) {
                    conversionPromises.push(
                        blobToDataURL(item.image).then(dataUrl => {
                            imgTag.src = dataUrl;
                        })
                    );
                }
            }
        });

        await Promise.all(conversionPromises);

        captureDiv.appendChild(scaleClone);
        document.body.appendChild(captureDiv);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            const canvas = await html2canvas(captureDiv, {
                useCORS: true,
                width: captureDiv.scrollWidth,
                height: captureDiv.scrollHeight,
                windowWidth: captureDiv.scrollWidth,
                windowHeight: captureDiv.scrollHeight,
                backgroundColor: bgColor
            });

            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = (titleValue || 'scale') + '.png';
            a.click();

        } catch (err) {
            console.error('Ошибка скриншота:', err);
            alert(translations[currentLang].screenshotError);
        } finally {
            document.body.removeChild(captureDiv);
        }
    }

    screenshotButton.addEventListener('click', takeScreenshot);
    resetButton.addEventListener('click', resetDataToDefault);

    function getDivisionStyles(index, layoutParams) {
        const { isOverlapping, maxLevels } = layoutParams;
        let level = 0;
        let positionClass = '';

        if (currentViewMode === 'center') {
            const isUp = (index + 1) % 2 !== 0;
            positionClass = isUp ? 'position-up' : 'position-down';
            const typeIndex = Math.floor(index / 2);
            level = typeIndex % maxLevels;
        } else {
            positionClass = 'position-up';
            level = index % maxLevels;
        }

        const baseStemHeight = 40;
        const rowHeight = 60;
        const stemHeight = baseStemHeight + (level * rowHeight);
        return { stemHeight, positionClass, level };
    }

    function getLayoutParams() {
        const segments = (divisionsData.length || 0) + 1;
        const scaleWidth = scaleBar.offsetWidth;
        const segmentWidth = scaleWidth / segments;
        const divisionNominalWidth = 120;
        const isOverlapping = segmentWidth < divisionNominalWidth && divisionsData.length > 1;
        const maxLevels = isOverlapping ? Math.max(1, Math.ceil(divisionNominalWidth / segmentWidth)) : 1;
        return { isOverlapping, maxLevels };
    }


    function renderDivisions() {
        scaleBar.innerHTML = '';

        const layoutParams = getLayoutParams();
        let maxLevelUp = -1;
        let maxLevelDown = -1;
        const textElementHeight = 40;
        const imageElementHeight = 110;
        const rowHeight = 60;
        let dynamicLevelsUp = new Array(layoutParams.maxLevels).fill(0);
        let dynamicLevelsDown = new Array(layoutParams.maxLevels).fill(0);

        divisionsData.forEach((item, index) => {
            const container = document.createElement('div');
            container.className = 'division-container';
            container.dataset.id = item.id;
            if (item.image) {
                container.classList.add('has-image');
            }

            const { stemHeight, positionClass, level } = getDivisionStyles(index, layoutParams);
            container.classList.add(positionClass);

            const isImagePresent = !!item.image;
            const elementContentHeight = isImagePresent ? imageElementHeight : textElementHeight;

            if (positionClass === 'position-up') {
                if (level < dynamicLevelsUp.length) {
                    dynamicLevelsUp[level] = Math.max(dynamicLevelsUp[level], elementContentHeight);
                }
                maxLevelUp = Math.max(maxLevelUp, level);
            } else if (positionClass === 'position-down') {
                if (level < dynamicLevelsDown.length) {
                    dynamicLevelsDown[level] = Math.max(dynamicLevelsDown[level], elementContentHeight);
                }
                maxLevelDown = Math.max(maxLevelDown, level);
            }


            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            if (item.image) {
                const img = document.createElement('img');
                if (item.image instanceof Blob) {
                    img.src = URL.createObjectURL(item.image);
                    img.onload = () => URL.revokeObjectURL(img.src);
                } else {
                    console.warn("Попытка создать URL не из Blob для ID:", item.id);
                }
                imageContainer.appendChild(img);
            }
            container.appendChild(imageContainer);

            const input = document.createElement('input');
            input.type = 'text';
            input.value = item.text;
            input.draggable = true;
            input.addEventListener('change', () => {
                item.text = input.value;
                captureState();
                saveData();
            });
            container.appendChild(input);

            const btnControls = document.createElement('div');
            btnControls.className = 'division-btn-controls';
            const addImgBtn = document.createElement('button');
            addImgBtn.id = 'add-image-btn';
            addImgBtn.innerHTML = '+';
            addImgBtn.title = translations[currentLang].pasteImgTitle;
            addImgBtn.dataset.itemId = item.id;
            btnControls.appendChild(addImgBtn);

            const removeImgFromDivBtn = document.createElement('button');
            removeImgFromDivBtn.id = 'remove-image-from-div-btn';
            removeImgFromDivBtn.innerHTML = '&#8722;';
            removeImgFromDivBtn.title = translations[currentLang].removeImgTitle;
            btnControls.appendChild(removeImgFromDivBtn);

            const removeDivBtn = document.createElement('button');
            removeDivBtn.id = 'remove-division-btn';
            removeDivBtn.innerHTML = '&times;';
            removeDivBtn.title = translations[currentLang].removeDivTitle;
            btnControls.appendChild(removeDivBtn);

            container.appendChild(btnControls);

            const stem = document.createElement('div');
            stem.className = 'division-stem';
            stem.style.height = `${stemHeight}px`;
            stem.style.order = "4";
            container.appendChild(stem);

            const segments = divisionsData.length + 1;
            const position = ((index + 1) / segments) * 100;
            container.style.left = `${position}%`;
            scaleBar.appendChild(container);
        });


        const baseStemHeight = 40;
        const basePaddingPx = 150;

        let totalHeightUp = 0;
        let totalHeightDown = 0;

        if (maxLevelUp > -1 && maxLevelUp < dynamicLevelsUp.length) {
            totalHeightUp = baseStemHeight + (maxLevelUp * rowHeight) + dynamicLevelsUp[maxLevelUp];
        }

        if (currentViewMode === 'center' && maxLevelDown > -1 && maxLevelDown < dynamicLevelsDown.length) {
            totalHeightDown = baseStemHeight + (maxLevelDown * rowHeight) + dynamicLevelsDown[maxLevelDown];
        }

        let paddingTopPx = basePaddingPx + totalHeightUp;
        let paddingBottomPx = currentViewMode === 'center' ? basePaddingPx + totalHeightDown : 0;

        if (divisionsData.length === 0) {
            paddingTopPx = basePaddingPx;
            paddingBottomPx = currentViewMode === 'center' ? basePaddingPx : 0;
        }

        scalePanningContainer.style.paddingTop = `${paddingTopPx}px`;
        scalePanningContainer.style.paddingBottom = `${paddingBottomPx}px`;

        addDragAndDropHandlers();
        updateUndoRedoButtons();
    }

    async function handleImagePaste(id) {
        try {
            const permission = await navigator.permissions.query({ name: 'clipboard-read' });
            if (permission.state === 'denied') {
                throw new Error(translations[currentLang].clipboardDenied);
            }

            const clipboardItems = await navigator.clipboard.read();
            const imageItem = clipboardItems.find(item => item.types.some(type => type.startsWith("image/")));

            if (!imageItem) {
                alert(translations[currentLang].imgNotFound);
                return;
            }

            const blob = await imageItem.getType(imageItem.types.find(t => t.startsWith("image/")));

            const item = divisionsData.find(d => d.id === id);
            if (item) {
                item.image = blob;
                captureState();
                await saveData();
                renderDivisions();
            }
        } catch (err) {
            console.error('Ошибка вставки:', err);
            alert(translations[currentLang].pasteError + err.message);
        }
    }

    async function handleRemoveDivision(id) {
        divisionsData = divisionsData.filter(item => item.id !== id);
        captureState();
        await saveData();
        renderDivisions();
    }

    function addDragAndDropHandlers() {
        document.querySelectorAll('.division-container input[type="text"]').forEach(input => {
            input.addEventListener('dragstart', (e) => {
                draggedElement = e.currentTarget.closest('.division-container');
                draggedId = Number(draggedElement.dataset.id);
                setTimeout(() => draggedElement.classList.add('dragging'), 0);
            });

            input.addEventListener('dragend', () => {
                if (!draggedElement) return;
                draggedElement.classList.remove('dragging');
                draggedElement = null;
                draggedId = null
                captureState();
                saveData().then(renderDivisions);
            });
        });
    }

    scaleBar.addEventListener('click', (event) => {
        const target = event.target;
        const container = target.closest('.division-container');
        if (!container) return;

        const itemId = Number(container.dataset.id);
        if (isNaN(itemId)) return;

        const addBtn = target.closest('#add-image-btn');
        if (addBtn) {
            handleImagePaste(itemId);
            return;
        }

        const removeDivBtn = target.closest('#remove-division-btn');
        if (removeDivBtn) {
            handleRemoveDivision(itemId);
            return;
        }

        const removeImgBtn = target.closest('#remove-image-from-div-btn');
        if (removeImgBtn) {
            const item = divisionsData.find(d => d.id === itemId);
            if (item) {
                item.image = null;
                captureState();
                saveData().then(renderDivisions);
            }
            return;
        }
    });


    scaleBar.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedElement) return;

        const scaleRect = scaleBar.getBoundingClientRect();
        const mouseX = e.clientX - scaleRect.left;
        const segmentWidth = scaleRect.width / (divisionsData.length + 1);

        let targetIndex = Math.floor(mouseX / segmentWidth);
        targetIndex = Math.max(0, Math.min(divisionsData.length - 1, targetIndex));

        const currentIndex = divisionsData.findIndex(item => item.id === draggedId);

        if (targetIndex !== currentIndex) {
            const item = divisionsData.splice(currentIndex, 1)[0];
            divisionsData.splice(targetIndex, 0, item);
        }

        const layoutParams = getLayoutParams();

        divisionsData.forEach((item, index) => {
            const el = scaleBar.querySelector(`.division-container[data-id="${item.id}"]`);
            if (el) {
                const newPosition = ((index + 1) / (divisionsData.length + 1)) * 100;
                if (item.id !== draggedId) {
                    el.style.left = `${newPosition}%`;
                }

                const { stemHeight, positionClass } = getDivisionStyles(index, layoutParams);

                el.className = 'division-container';
                el.classList.add(positionClass);
                if (item.id === draggedId) {
                    el.classList.add('dragging');
                }
                if (item.image) {
                    el.classList.add('has-image');
                }
                el.querySelector('.division-stem').style.height = `${stemHeight}px`;
            }
        });

        draggedElement.style.left = `${mouseX}px`;
    });

    addButton.addEventListener('click', async () => {
        const newItem = {
            id: Date.now(),
            text: translations[currentLang].defaultText,
            image: null,
            order: divisionsData.length
        };
        divisionsData.push(newItem);
        captureState();
        await saveData();
        renderDivisions();
    });

    async function main() {
        currentLang = getInitialLang();

        applyTheme(localStorage.getItem('theme') || 'light');

        const savedTitle = localStorage.getItem('scaleTitle') || '';
        scaleTitle.innerText = savedTitle;
        scaleStartLabel.innerText = localStorage.getItem('scaleStartText') || '0';
        scaleEndLabel.innerText = localStorage.getItem('scaleEndText') || '10';
        adjustTitleFontSize();

        const savedMode = localStorage.getItem('viewMode') || 'bottom';
        applyViewMode(savedMode);

        try {
            await initDB();
            const data = await loadData();
            if (data.length > 0) {
                divisionsData = data;
            } else {
                divisionsData = getDefaultData();
                await saveData();
            }
        } catch (err) {
            console.error("Не удалось загрузить данные:", err);
            divisionsData = getDefaultData();
        }

        captureState();
        updateUI(currentLang);
    }

    main();

    window.addEventListener('resize', () => {
        adjustTitleFontSize();
        setTimeout(renderDivisions, 0);
    });
});