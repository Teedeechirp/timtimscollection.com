window.addEventListener("load", async () => {
  const memoryGrid = document.getElementById("memory-grid");
  const memoryGridWrapper = document.getElementById("memory-grid-wrapper");
  const loader = document.getElementById("grid-loading");

  const previewText = document.getElementById("preview-text");
  const previewWindow = document.getElementById("preview-window");
  const previewClose = document.getElementById("preview-close");
  const taskManager = document.getElementById("task-manager");
  const taskAddButton = document.getElementById("task-add-button");
  const taskClearButton = document.getElementById("task-clear-button");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const workTimer = document.getElementById("work-timer");
  const timerModes = document.querySelectorAll(".timer-mode");
  const timerDisplay = document.getElementById("timer-display");
  const timerPhase = document.getElementById("timer-phase");
  const timerStatus = document.getElementById("timer-status");
  const timerStart = document.getElementById("timer-start");
  const timerPause = document.getElementById("timer-pause");
  const timerReset = document.getElementById("timer-reset");
  const productivityGraph = document.getElementById("productivity-graph");
  const productivityChart = document.getElementById("productivity-chart");
  const productivityTotal = document.getElementById("productivity-total");
  const productivityPointList = document.getElementById("productivity-point-list");
  const crtOverlay = document.getElementById("arcade-crt-overlay");
  const crtMaskZones = {
    top: document.querySelector('[data-crt-zone="top"]'),
    right: document.querySelector('[data-crt-zone="right"]'),
    bottom: document.querySelector('[data-crt-zone="bottom"]'),
    left: document.querySelector('[data-crt-zone="left"]')
  };

  const browserItem = document.querySelector('.menu-item[data-target="browser"]');
  const systemItem = document.querySelector('.menu-item[data-target="system"]');
  const menuItems = document.querySelector(".menu-items");
  const menuTitle = document.querySelector(".menu-title");
  const collectionLetters = document.querySelectorAll(".collection-letter");
  const titleTicker = document.querySelector(".title-ticker");
  const titleTickerTrack = titleTicker?.querySelector(".ticker-track");
  const tickerTape = document.getElementById("ticker-tape");
  const tickerTrack = tickerTape?.querySelector(".ticker-track");
  const devLogButton = document.getElementById("dev-log-button");
  const devLogPanel = document.getElementById("dev-log-panel");
  const devLogClose = document.getElementById("dev-log-close");
  const devLogContent = document.getElementById("dev-log-content");
  const dotElements = document.querySelectorAll("[data-dots]");

  const bootStatus = document.getElementById("boot-status");
  const detailScreen = document.getElementById("detail-screen");
  const detailContent = document.getElementById("detail-content");

  let isExpanded = false;
  let hoverEnabled = false;
  let selectedIndex = 0;
  let gridData = [];
  let changelogData = [];
  let skillTickerData = [];
  let gridDataPromise;
  let changelogDataPromise;
  let skillTickerDataPromise;
  let dotState = 0;
  let previewInterval;
  let previewClearTimeout;
  let detailPreviewReturnTimeout;
  let detailPreviewSwapTimeout;
  let detailAutoScrollTimeout;
  let detailCenterHighlightFrame;
  let detailPreviewCurrentPath = "";
  let devLogPeekTimeout;
  let titleTickerPlaceholder;
  let menuItemsPlaceholder;
  let loaderInterval;
  let detailLoaderInterval;
  let browserGridAutoScrollTimeout;
  let browserGridCenterHighlightFrame;
  let browserGridLoading = false;
  let browserGridSensorEnabled = true;
  let activeCollectionTool = null;
  let timerAudioContext;
  let timerInterval;
  let timerMode = { workSeconds: 25 * 60, breakSeconds: 5 * 60 };
  let timerPhaseName = "WORK";
  let timerRemainingSeconds = timerMode.workSeconds;
  let timerRunning = false;
  let activeCollectionPlaceholderText = "";
  const defaultPreviewText = "";
  const taskStorageKey = "timtim-scheduled-checklist-v1";
  const completedDefaultTaskTexts = new Set([
    "Plan tool system and COLLECTION. letter interaction.",
    "Build Work Timer MVP.",
    "Test Work Timer on desktop and mobile.",
    "Connect task bar and tool visibility behavior.",
    "Build Productivity Dashboard structure.",
    "Add productivity graph connected to update/dev log data.",
    "Cut top ticker read time down by 50%.",
    "Update development log and publish changes."
  ]);
  const defaultTasks = [
    { text: "Plan tool system and COLLECTION. letter interaction.", done: true },
    { text: "Build Work Timer MVP.", done: true },
    { text: "Test Work Timer on desktop and mobile.", done: true },
    { text: "Build Note Writer MVP.", done: false },
    { text: "Update task bar design.", done: false },
    { text: "Connect task bar and tool visibility behavior.", done: true },
    { text: "Build Productivity Dashboard structure.", done: true },
    { text: "Add productivity graph connected to update/dev log data.", done: true },
    { text: "Cut top ticker read time down by 50%.", done: true },
    { text: "Test boot-logo-style filter on top ticker icons.", done: false },
    { text: "Add TIMTIM'S SELECTION work to Album Covers.", done: false },
    { text: "Check hosted website cache behavior.", done: false },
    { text: "Research and fix startup safety warning issue.", done: false },
    { text: "Audit remaining large image and video file sizes.", done: false },
    { text: "Decide which files to compress, replace, or leave as-is.", done: false },
    { text: "Build downloadable PDF version of the website/archive content.", done: false },
    { text: "Polish phone responsive layout.", done: false },
    { text: "Run final desktop, phone, and hosted test pass.", done: false },
    { text: "Update development log and publish changes.", done: true }
  ];
  const tasks = loadTasks();

  memoryGridWrapper.style.display = "none";
  memoryGrid.style.display = "none";
  previewWindow.appendChild(detailScreen);
  previewText.textContent = defaultPreviewText;
  hideCollectionTools();
  setupDevelopmentLogLayer();
  setupTitleTickerLayer();
  setupMenuItemsLayer();
  updateTitleTickerWidth();
  updateFloatingMenuLayout();
  document.fonts?.ready.then(updateFloatingMenuLayout);
  window.addEventListener("resize", updateFloatingMenuLayout);
  updateCrtMask();
  window.addEventListener("resize", updateCrtMask);

  // =========================
  // BOOT TEXT ANIMATION
  // =========================
  const bootMessages = [
    "Allocating big titty goths",
    "Initializing memory sectors",
    "Loading portfolio interface",
    "Synchronizing system state"
  ];

  let bootIndex = 0;
  let bootDots = 0;

  const bootInterval = setInterval(() => {
    bootIndex = (bootIndex + 1) % bootMessages.length;
  }, 1200);

  const bootDotInterval = setInterval(() => {
    bootDots = (bootDots + 1) % 4;
    bootStatus.textContent = bootMessages[bootIndex] + ".".repeat(bootDots);
  }, 500);

  // =========================
  // STATE
  // =========================
  StateManager.init();
  StateManager.setState("BOOT");

  setTimeout(() => {
    clearInterval(bootInterval);
    clearInterval(bootDotInterval);
    StateManager.setState("MENU");
    titleTicker?.classList.add("active");
    menuItems?.classList.add("active");
    updateFloatingMenuLayout();
    scheduleCrtMaskUpdate();
  }, 5000);

  // =========================
  // LOAD DATA
  // =========================
  async function loadGridData() {
    const res = await fetch(`data/memoryGrid.json?t=${Date.now()}`);

    if (!res.ok) {
      throw new Error(`Grid data request failed: ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Grid data must be a JSON array.");
    }

    gridData = data;
  }

  gridDataPromise = reloadGridData();

  async function loadChangelogData() {
    const res = await fetch(`data/changelog.json?t=${Date.now()}`);

    if (!res.ok) {
      throw new Error(`Changelog data request failed: ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Changelog data must be a JSON array.");
    }

    changelogData = data;
    renderChangelogTicker();
    renderDevelopmentLog();
    renderProductivityGraph();
  }

  changelogDataPromise = loadChangelogData().catch(err => {
    console.error("Could not load changelog data:", err);
  });

  async function loadSkillTickerData() {
    const res = await fetch(`data/skillTicker.json?t=${Date.now()}`);

    if (!res.ok) {
      throw new Error(`Skill ticker data request failed: ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Skill ticker data must be a JSON array.");
    }

    skillTickerData = data;
    renderSkillTicker();
  }

  skillTickerDataPromise = loadSkillTickerData().catch(err => {
    console.error("Could not load skill ticker data:", err);
  });

  function renderSkillTicker() {
    if (!titleTickerTrack) {
      return;
    }

    titleTickerTrack.innerHTML = "";

    skillTickerData.forEach(entry => {
      const span = document.createElement("span");
      span.className = "skill-ticker-entry";

      entry.parts.forEach((part, index) => {
        if (index > 0) {
          const separator = document.createElement("span");
          separator.className = "skill-ticker-separator";
          separator.textContent = ", ";
          span.appendChild(separator);
        }

        const label = document.createElement("span");
        label.className = "skill-ticker-label";
        label.textContent = part.text;
        span.appendChild(label);

        if (part.icon) {
          const icon = document.createElement("img");
          icon.className = "skill-ticker-icon";
          icon.src = part.icon;
          icon.alt = part.alt || "";
          span.appendChild(icon);
        }
      });

      titleTickerTrack.appendChild(span);
    });
  }

  function renderChangelogTicker() {
    if (!tickerTrack) {
      return;
    }

    tickerTrack.innerHTML = "";

    changelogData.forEach(log => {
      const span = document.createElement("span");
      span.textContent = `${log.version} - ${log.date} - ${log.items.join(" / ")}`;
      tickerTrack.appendChild(span);
    });
  }

  function renderDevelopmentLog() {
    if (!devLogContent) {
      return;
    }

    devLogContent.innerHTML = "";

    changelogData
      .slice()
      .reverse()
      .forEach(log => {
        const entry = document.createElement("article");
        entry.className = "dev-log-entry";

        const header = document.createElement("div");
        header.className = "dev-log-entry-header";
        header.textContent = `${log.version} - ${log.date}`;

        const list = document.createElement("ul");

        log.items.forEach(item => {
          const listItem = document.createElement("li");
          listItem.textContent = item;
          list.appendChild(listItem);
        });

        entry.appendChild(header);
        entry.appendChild(list);
        devLogContent.appendChild(entry);
      });
  }

  function openDevelopmentLog() {
    clearTimeout(devLogPeekTimeout);
    document.body.classList.add("dev-log-peek");
    devLogPanel?.classList.remove("hidden");
    devLogPanel?.classList.add("active");
  }

  function closeDevelopmentLog() {
    devLogPanel?.classList.add("hidden");
    devLogPanel?.classList.remove("active");
    document.body.classList.remove("dev-log-peek");
  }

  function setupDevelopmentLogLayer() {
    if (devLogButton) {
      document.body.appendChild(devLogButton);
    }

    if (devLogPanel) {
      document.body.appendChild(devLogPanel);
    }
  }

  devLogButton?.addEventListener("click", openDevelopmentLog);
  devLogClose?.addEventListener("click", closeDevelopmentLog);

  function showDevelopmentLogButton() {
    clearTimeout(devLogPeekTimeout);
    document.body.classList.add("dev-log-peek");
  }

  function hideDevelopmentLogButton() {
    clearTimeout(devLogPeekTimeout);

    devLogPeekTimeout = setTimeout(() => {
      if (!devLogPanel?.classList.contains("active")) {
        document.body.classList.remove("dev-log-peek");
      }
    }, 15000);
  }

  tickerTape?.addEventListener("mouseenter", showDevelopmentLogButton);
  tickerTape?.addEventListener("mouseleave", hideDevelopmentLogButton);
  devLogButton?.addEventListener("mouseenter", showDevelopmentLogButton);
  devLogButton?.addEventListener("mouseleave", hideDevelopmentLogButton);

  // =========================
  // DOT ANIMATION
  // =========================
  setInterval(() => {
    dotState = (dotState + 1) % 4;
    dotElements.forEach(el => {
      el.textContent = ".".repeat(dotState);
    });
  }, 500);

  // =========================
  // PREVIEW
  // =========================
  function setPreview(text) {
    clearTimeout(previewClearTimeout);
    clearInterval(previewInterval);
    let dots = 0;
    hideCollectionTools();
    previewText.style.display = "flex";
    previewText.textContent = text;

    previewInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      previewText.textContent = text + ".".repeat(dots);
    }, 500);
  }

  function updateTitleTickerWidth() {
    if (!menuTitle || !titleTicker) {
      return;
    }

    const titleWidth = menuTitle.getBoundingClientRect().width;

    if (titleWidth > 0) {
      const tickerWidth = `${titleWidth * 1.55}px`;
      titleTicker.style.width = tickerWidth;

      if (titleTickerPlaceholder) {
        titleTickerPlaceholder.style.width = tickerWidth;
      }
    }

    positionTitleTickerLayer();
  }

  function updateFloatingMenuLayout() {
    updateTitleTickerWidth();
    positionMenuItemsLayer();
  }

  function setupTitleTickerLayer() {
    if (!titleTicker || !titleTicker.parentElement) {
      return;
    }

    titleTickerPlaceholder = document.createElement("div");
    titleTickerPlaceholder.className = "title-ticker title-ticker-placeholder";
    titleTicker.parentElement.insertBefore(titleTickerPlaceholder, titleTicker);

    titleTicker.classList.add("title-ticker-floating");
    document.body.appendChild(titleTicker);
    positionTitleTickerLayer();
  }

  function positionTitleTickerLayer() {
    if (!titleTicker || !titleTickerPlaceholder) {
      return;
    }

    const rect = titleTickerPlaceholder.getBoundingClientRect();

    titleTicker.style.left = `${rect.left}px`;
    titleTicker.style.top = `${rect.top}px`;
    titleTicker.style.width = `${rect.width}px`;
  }

  function setupMenuItemsLayer() {
    if (!menuItems || !menuItems.parentElement) {
      return;
    }

    menuItemsPlaceholder = menuItems.cloneNode(true);
    menuItemsPlaceholder.classList.add("menu-items-placeholder");
    menuItemsPlaceholder.setAttribute("aria-hidden", "true");
    menuItems.parentElement.insertBefore(menuItemsPlaceholder, menuItems);

    menuItems.classList.add("menu-items-floating");
    document.body.appendChild(menuItems);
    positionMenuItemsLayer();
  }

  function positionMenuItemsLayer() {
    if (!menuItems || !menuItemsPlaceholder) {
      return;
    }

    const rect = menuItemsPlaceholder.getBoundingClientRect();

    menuItems.style.left = `${rect.left}px`;
    menuItems.style.top = `${rect.top}px`;
    menuItems.style.width = `${rect.width}px`;
  }

  function clearPreview() {
    clearTimeout(previewClearTimeout);

    previewClearTimeout = setTimeout(() => {
      clearInterval(previewInterval);

      if (!isExpanded) {
        previewText.textContent = defaultPreviewText;
        previewText.style.display = "none";
        if (activeCollectionTool === "tasks") {
          taskManager.classList.remove("hidden");
        } else if (activeCollectionTool === "timer") {
          workTimer.classList.remove("hidden");
        } else if (activeCollectionTool === "productivity") {
          productivityGraph.classList.remove("hidden");
        } else if (activeCollectionTool === "placeholder") {
          previewText.style.display = "flex";
          previewText.textContent = activeCollectionPlaceholderText;
        }
      }
    }, 500);
  }

  // =========================
  // WINDOW CONTROL
  // =========================
  function expandWindow(text) {
    isExpanded = true;
    closeDevelopmentLog();
    clearTimeout(previewClearTimeout);
    clearInterval(previewInterval);
    document.body.classList.add("preview-open");
    updateCrtMaskFullScreen();
    previewWindow.classList.add("expanded");
    previewText.style.display = "flex";
    previewText.textContent = text;
  }

  function collapseWindow() {
    isExpanded = false;
    hoverEnabled = false;
    clearTimeout(previewClearTimeout);
    clearInterval(previewInterval);
    clearTimeout(browserGridAutoScrollTimeout);
    cancelAnimationFrame(browserGridCenterHighlightFrame);
    browserGridLoading = false;
    browserGridSensorEnabled = true;

    previewWindow.classList.remove("expanded");
    document.body.classList.remove("preview-open");
    document.getElementById("menu-screen").classList.remove("browser-grid-active");
    scheduleCrtMaskUpdate();
    previewText.textContent = defaultPreviewText;
    previewText.style.display = "none";
    activeCollectionTool = null;
    activeCollectionPlaceholderText = "";
    hideCollectionTools();

    memoryGrid.innerHTML = "";
    memoryGrid.style.display = "none";
    memoryGridWrapper.style.display = "none";
    memoryGridWrapper.classList.remove("loading");
    clearContactTerminal();
    loader.classList.add("hidden");
    stopLoaderDots();
    stopDetailLoaderDots();

    detailScreen.classList.add("hidden");
    detailScreen.classList.remove("active");

    document.querySelector(".menu-left").classList.remove("menu-disabled");
    document.querySelectorAll(".menu-item").forEach(item => {
      item.classList.remove("selected");
    });
  }

  previewClose.addEventListener("click", collapseWindow);

  function scheduleCrtMaskUpdate() {
    requestAnimationFrame(updateCrtMask);
    setTimeout(updateCrtMask, 550);
  }

  function updateCrtMask() {
    const rect = previewWindow.getBoundingClientRect();
    const hasPreviewRect = rect.width > 0 && rect.height > 0;

    if (crtOverlay) {
      crtOverlay.classList.add("ready");
    }

    if (!hasPreviewRect) {
      updateCrtMaskFullScreen();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const left = Math.max(0, rect.left);
    const top = Math.max(0, rect.top);
    const right = Math.min(viewportWidth, rect.right);
    const bottom = Math.min(viewportHeight, rect.bottom);

    setCrtZone(crtMaskZones.top, 0, 0, viewportWidth, top);
    setCrtZone(crtMaskZones.right, right, top, viewportWidth - right, bottom - top);
    setCrtZone(crtMaskZones.bottom, 0, bottom, viewportWidth, viewportHeight - bottom);
    setCrtZone(crtMaskZones.left, 0, top, left, bottom - top);
  }

  function updateCrtMaskFullScreen() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    setCrtZone(crtMaskZones.top, 0, 0, viewportWidth, viewportHeight);
    setCrtZone(crtMaskZones.right, 0, 0, 0, 0);
    setCrtZone(crtMaskZones.bottom, 0, 0, 0, 0);
    setCrtZone(crtMaskZones.left, 0, 0, 0, 0);
  }

  function setCrtZone(zone, left, top, width, height) {
    if (!zone) {
      return;
    }

    zone.style.left = `${left}px`;
    zone.style.top = `${top}px`;
    zone.style.width = `${Math.max(0, width)}px`;
    zone.style.height = `${Math.max(0, height)}px`;
  }

  // =========================
  // MENU
  // =========================
  browserItem.addEventListener("click", () => {
    activateMenuItem(browserItem, "Enter the system browser", openBrowserMenu);
  });

  systemItem.addEventListener("click", () => {
    activateMenuItem(systemItem, "Open artist information and contact channels", openContactMenu);
  });

  function activateMenuItem(item, preview, action) {
    if (!isMobileLayout() || isExpanded) {
      action();
      return;
    }

    item.classList.add("mobile-press-preview");
    setPreview(preview);

    setTimeout(() => {
      item.classList.remove("mobile-press-preview");
      action();
    }, 500);
  }

  function isMobileLayout() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function getGridLoadDelay() {
    return isMobileLayout() ? 720 : 500;
  }

  async function openBrowserMenu() {
    expandWindow("STATE 1");
    clearContactTerminal();
    document.getElementById("menu-screen").classList.add("browser-grid-active");

    browserItem.classList.add("selected");
    systemItem.classList.remove("selected");
    document.querySelector(".menu-left").classList.add("menu-disabled");

    memoryGridWrapper.style.display = "flex";
    memoryGrid.style.display = "grid";
    previewText.style.display = "none";
    hideCollectionTools();

    await gridDataPromise;

    if (gridData.length === 0) {
      await reloadGridData();
    }

    buildGrid();
  }

  function openContactMenu() {
    expandWindow("");
    document.getElementById("menu-screen").classList.remove("browser-grid-active");

    systemItem.classList.add("selected");
    browserItem.classList.remove("selected");
    document.querySelector(".menu-left").classList.add("menu-disabled");

    memoryGrid.style.display = "none";
    memoryGridWrapper.style.display = "none";
    previewText.style.display = "none";
    hideCollectionTools();
    openContactTerminal();
  }

  browserItem.addEventListener("mouseenter", () => {
    if (!isExpanded) {
      setPreview("Enter the system browser");
    }
  });

  browserItem.addEventListener("mouseleave", clearPreview);

  systemItem.addEventListener("mouseenter", () => {
    if (!isExpanded) {
      setPreview("Open artist information and contact channels");
    }
  });

  systemItem.addEventListener("mouseleave", clearPreview);

  collectionLetters.forEach(letter => {
    letter.addEventListener("click", () => {
      if (isExpanded) {
        return;
      }

      clearTimeout(previewClearTimeout);
      clearInterval(previewInterval);
      collectionLetters.forEach(item => item.classList.remove("active"));
      letter.classList.add("active");

      if (letter.dataset.tool === "tasks") {
        openCollectionTool("tasks");
        return;
      }

      if (letter.dataset.tool === "timer") {
        openCollectionTool("timer");
        return;
      }

      if (letter.dataset.tool === "productivity") {
        openCollectionTool("productivity");
        return;
      }

      activeCollectionTool = "placeholder";
      activeCollectionPlaceholderText = letter.dataset.toolPlaceholder || "";
      hideCollectionTools();
      previewText.style.display = "flex";
      previewText.textContent = activeCollectionPlaceholderText;
    });
  });

  function hideCollectionTools() {
    taskManager.classList.add("hidden");
    workTimer.classList.add("hidden");
    productivityGraph.classList.add("hidden");
  }

  function openCollectionTool(toolName) {
    activeCollectionTool = toolName;
    activeCollectionPlaceholderText = "";
    previewText.style.display = "none";
    hideCollectionTools();

    if (toolName === "tasks") {
      taskManager.classList.remove("hidden");
    }

    if (toolName === "timer") {
      workTimer.classList.remove("hidden");
      updateTimerDisplay();
    }

    if (toolName === "productivity") {
      productivityGraph.classList.remove("hidden");
      renderProductivityGraph();
    }
  }

  function renderProductivityGraph() {
    if (!productivityChart || !productivityTotal || !productivityPointList) {
      return;
    }

    productivityChart.innerHTML = "";
    productivityPointList.innerHTML = "";

    if (!Array.isArray(changelogData) || changelogData.length === 0) {
      productivityTotal.textContent = "NO SIGNAL";
      return;
    }

    const points = changelogData.map(log => ({
      version: log.version,
      date: log.date,
      count: Array.isArray(log.items) ? log.items.length : 0,
      durationMinutes: Number.isFinite(Number(log.durationMinutes)) ? Number(log.durationMinutes) : 0,
      obstruction: typeof log.obstruction === "string" ? log.obstruction : "",
      solutionChoice: typeof log.solutionChoice === "string" ? log.solutionChoice : ""
    }));
    const totalTasks = points.reduce((sum, point) => sum + point.count, 0);
    const totalMinutes = points.reduce((sum, point) => sum + point.durationMinutes, 0);
    const maxTasks = Math.max(1, ...points.map(point => point.count));
    const maxDuration = Math.max(1, ...points.map(point => point.durationMinutes));
    const width = 1000;
    const height = 420;
    const padding = { left: 72, right: 34, top: 42, bottom: 86 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const xStep = points.length > 1 ? chartWidth / (points.length - 1) : 0;
    const coordinates = points.map((point, index) => {
      const x = padding.left + xStep * index;
      const y = padding.top + chartHeight - (point.count / maxTasks) * chartHeight;
      const timeY = padding.top + chartHeight - (point.durationMinutes / maxDuration) * chartHeight;
      return { ...point, x, y, timeY };
    });
    const linePoints = coordinates.map(point => `${point.x},${point.y}`).join(" ");
    const timeLinePoints = coordinates.map(point => `${point.x},${point.timeY}`).join(" ");
    const areaPoints = `${padding.left},${padding.top + chartHeight} ${linePoints} ${padding.left + chartWidth},${padding.top + chartHeight}`;

    productivityTotal.textContent = `${totalTasks} TASKS / ${totalMinutes} MIN`;

    for (let index = 0; index <= maxTasks; index += 1) {
      const y = padding.top + chartHeight - (index / maxTasks) * chartHeight;
      productivityChart.appendChild(createSvgElement("line", {
        class: "productivity-grid-line",
        x1: padding.left,
        y1: y,
        x2: padding.left + chartWidth,
        y2: y
      }));
      productivityChart.appendChild(createSvgElement("text", {
        class: "productivity-axis-label",
        x: padding.left - 20,
        y: y + 5,
        "text-anchor": "end"
      }, String(index)));
    }

    productivityChart.appendChild(createSvgElement("polygon", {
      class: "productivity-area",
      points: areaPoints
    }));
    productivityChart.appendChild(createSvgElement("polyline", {
      class: "productivity-line",
      points: linePoints
    }));
    productivityChart.appendChild(createSvgElement("polyline", {
      class: "productivity-time-line",
      points: timeLinePoints
    }));

    const labelEvery = Math.max(1, Math.ceil(points.length / 7));

    coordinates.forEach((point, index) => {
      const group = createSvgElement("g", {
        class: "productivity-point",
        "data-productivity-index": index,
        role: "button",
        tabindex: "0"
      });
      group.appendChild(createSvgElement("line", {
        class: "productivity-point-stem",
        x1: point.x,
        y1: padding.top + chartHeight,
        x2: point.x,
        y2: point.y
      }));
      group.appendChild(createSvgElement("circle", {
        class: "productivity-hit-target",
        cx: point.x,
        cy: point.y,
        r: 40
      }));
      group.appendChild(createSvgElement("circle", {
        class: "productivity-visible-dot",
        cx: point.x,
        cy: point.y,
        r: 8
      }));
      group.appendChild(createSvgElement("title", {}, `${point.version} / ${point.date} / ${point.count} tasks`));
      productivityChart.appendChild(group);

      const timeGroup = createSvgElement("g", {
        class: "productivity-time-point",
        "data-productivity-index": index,
        role: "button",
        tabindex: "0"
      });
      timeGroup.appendChild(createSvgElement("circle", {
        class: "productivity-hit-target",
        cx: point.x,
        cy: point.timeY,
        r: 30
      }));
      timeGroup.appendChild(createSvgElement("circle", {
        class: "productivity-visible-dot",
        cx: point.x,
        cy: point.timeY,
        r: point.durationMinutes > 0 ? 6 : 3
      }));
      timeGroup.appendChild(createSvgElement("title", {}, `${point.version} / ${point.durationMinutes} minutes`));
      productivityChart.appendChild(timeGroup);

      if (index % labelEvery === 0 || index === coordinates.length - 1) {
        productivityChart.appendChild(createSvgElement("text", {
          class: "productivity-version-label",
          x: point.x,
          y: height - 42,
          "text-anchor": "middle"
        }, point.version));
      }

      const row = document.createElement("div");
      row.className = "productivity-point-row";
      row.dataset.productivityIndex = String(index);
      row.innerHTML = `
        <span class="productivity-row-version">${escapeHtml(point.version)}</span>
        <span>${escapeHtml(point.date)}</span>
        <span>${point.count} TASKS / ${point.durationMinutes} MIN</span>
        <span class="productivity-row-detail">${escapeHtml(point.obstruction || "No obstruction note logged yet.")}</span>
        <span class="productivity-row-detail">${escapeHtml(point.solutionChoice || "No solution choice logged yet.")}</span>
      `;
      productivityPointList.appendChild(row);

      bindProductivityPoint(group, index);
      bindProductivityPoint(timeGroup, index);
    });
  }

  function bindProductivityPoint(pointElement, index) {
    pointElement.addEventListener("mouseenter", () => {
      pointElement.classList.add("hovered");
      productivityChart.classList.add("point-hovering");
    });

    pointElement.addEventListener("mouseleave", () => {
      pointElement.classList.remove("hovered");
      if (!productivityChart.querySelector(".productivity-point.hovered, .productivity-time-point.hovered")) {
        productivityChart.classList.remove("point-hovering");
      }
    });

    pointElement.addEventListener("click", () => {
      selectProductivityPoint(index);
    });

    pointElement.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      selectProductivityPoint(index);
    });
  }

  function selectProductivityPoint(index) {
    const graphPoints = productivityChart.querySelectorAll("[data-productivity-index]");
    const rows = productivityPointList.querySelectorAll("[data-productivity-index]");
    const selectedRow = productivityPointList.querySelector(`[data-productivity-index="${index}"]`);

    graphPoints.forEach(point => {
      point.classList.toggle("selected", Number(point.dataset.productivityIndex) === index);
    });

    rows.forEach(row => {
      row.classList.toggle("selected", Number(row.dataset.productivityIndex) === index);
      row.classList.remove("selecting");
    });

    if (!selectedRow) {
      return;
    }

    selectedRow.classList.add("selecting");
    selectedRow.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    setTimeout(() => {
      selectedRow.classList.remove("selecting");
    }, 1200);
  }

  function createSvgElement(tagName, attributes = {}, text = "") {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    if (text) {
      element.textContent = text;
    }

    return element;
  }

  timerModes.forEach(modeButton => {
    modeButton.addEventListener("click", () => {
      const workMinutes = Number(modeButton.dataset.work);
      const breakMinutes = Number(modeButton.dataset.break);
      const workSeconds = Number(modeButton.dataset.workSeconds);
      const breakSeconds = Number(modeButton.dataset.breakSeconds);
      const nextWorkSeconds = Number.isFinite(workSeconds) ? workSeconds : workMinutes * 60;
      const nextBreakSeconds = Number.isFinite(breakSeconds) ? breakSeconds : breakMinutes * 60;

      if (!Number.isFinite(nextWorkSeconds) || !Number.isFinite(nextBreakSeconds)) {
        return;
      }

      timerMode = { workSeconds: nextWorkSeconds, breakSeconds: nextBreakSeconds };
      timerPhaseName = "WORK";
      timerRemainingSeconds = timerMode.workSeconds;
      timerRunning = false;
      clearInterval(timerInterval);
      timerModes.forEach(button => button.classList.remove("active"));
      modeButton.classList.add("active");
      workTimer.classList.remove("running", "break-mode");
      timerStatus.textContent = "ANCIENT CLOCK IDLE";
      updateTimerDisplay();
    });
  });

  timerStart.addEventListener("click", () => {
    ensureTimerAudio();

    if (timerRunning) {
      return;
    }

    timerRunning = true;
    timerStatus.textContent = timerPhaseName === "WORK" ? "LOW CURRENT ACTIVE" : "HIGH CURRENT REST";
    workTimer.classList.add("running");
    playPhaseBuzz(timerPhaseName);
    timerInterval = setInterval(runTimerTick, 1000);
  });

  timerPause.addEventListener("click", () => {
    timerRunning = false;
    clearInterval(timerInterval);
    timerStatus.textContent = "SIGNAL HELD";
    workTimer.classList.remove("running");
  });

  timerReset.addEventListener("click", () => {
    timerRunning = false;
    clearInterval(timerInterval);
    timerPhaseName = "WORK";
    timerRemainingSeconds = timerMode.workSeconds;
    timerStatus.textContent = "ANCIENT CLOCK IDLE";
    workTimer.classList.remove("running", "break-mode");
    updateTimerDisplay();
  });

  function runTimerTick() {
    playTimerTick();

    if (timerRemainingSeconds <= 0) {
      switchTimerPhase();
      return;
    }

    timerRemainingSeconds -= 1;
    updateTimerDisplay();

    if (timerRemainingSeconds <= 0) {
      switchTimerPhase();
    }
  }

  function switchTimerPhase() {
    timerPhaseName = timerPhaseName === "WORK" ? "BREAK" : "WORK";
    timerRemainingSeconds = timerPhaseName === "WORK" ? timerMode.workSeconds : timerMode.breakSeconds;
    timerStatus.textContent = timerPhaseName === "WORK" ? "LOW CURRENT ACTIVE" : "HIGH CURRENT REST";
    workTimer.classList.toggle("break-mode", timerPhaseName === "BREAK");
    playPhaseBuzz(timerPhaseName);
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timerRemainingSeconds / 60);
    const seconds = timerRemainingSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    timerPhase.textContent = timerPhaseName;
  }

  function ensureTimerAudio() {
    if (!timerAudioContext) {
      timerAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (timerAudioContext.state === "suspended") {
      timerAudioContext.resume();
    }
  }

  function playTimerTick() {
    if (!timerAudioContext) {
      return;
    }

    const now = timerAudioContext.currentTime;
    const oscillator = timerAudioContext.createOscillator();
    const gain = timerAudioContext.createGain();
    const filter = timerAudioContext.createBiquadFilter();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(740, now);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(timerAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  function playPhaseBuzz(phaseName) {
    if (!timerAudioContext) {
      return;
    }

    const now = timerAudioContext.currentTime;
    const baseFrequency = phaseName === "WORK" ? 112 : 260;

    for (let index = 0; index < 3; index += 1) {
      const start = now + index * 0.12;
      const oscillator = timerAudioContext.createOscillator();
      const gain = timerAudioContext.createGain();

      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(baseFrequency + index * 18, start);
      oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 0.85, start + 0.16);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      oscillator.connect(gain);
      gain.connect(timerAudioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.24);
    }
  }

  taskAddButton.addEventListener("click", () => {
    taskInput.classList.remove("hidden");
    taskInput.focus();
  });

  taskClearButton.addEventListener("click", () => {
    tasks.length = 0;
    saveTasks();
    renderTasks();
  });

  taskInput.addEventListener("keydown", event => {
    if (event.key !== "Enter") {
      return;
    }

    const text = taskInput.value.trim();

    if (text.length === 0) {
      return;
    }

    tasks.push({ text, done: false });
    saveTasks();
    taskInput.value = "";
    taskInput.classList.add("hidden");
    renderTasks();
  });

  function renderTasks() {
    taskList.innerHTML = tasks.map((task, index) => `
      <label class="task-item ${task.done ? "done" : ""}">
        <input type="checkbox" data-task-index="${index}" ${task.done ? "checked" : ""} />
        <span>${escapeHtml(task.text)}</span>
      </label>
    `).join("");

    taskList.querySelectorAll("[data-task-index]").forEach(input => {
      input.addEventListener("change", () => {
        tasks[Number(input.dataset.taskIndex)].done = input.checked;
        input.closest(".task-item").classList.toggle("done", input.checked);
        saveTasks();
      });
    });
  }

  function loadTasks() {
    const fallbackTasks = defaultTasks.map(task => ({ ...task }));
    const savedTasks = localStorage.getItem(taskStorageKey);

    if (!savedTasks) {
      return fallbackTasks;
    }

    try {
      const parsedTasks = JSON.parse(savedTasks);

      if (!Array.isArray(parsedTasks)) {
        return fallbackTasks;
      }

      const storedTasks = parsedTasks
        .filter(task => task && typeof task.text === "string")
        .map(task => ({
          text: task.text,
          done: Boolean(task.done) || completedDefaultTaskTexts.has(task.text)
        }));

      return storedTasks;
    } catch (error) {
      return fallbackTasks;
    }
  }

  function saveTasks() {
    localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  }

  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  renderTasks();
  saveTasks();

  // =========================
  // GRID SIZE (MAX 3 COLS)
  // =========================
  function updateGridSize() {
    const count = gridData.length;
    const cols = isMobileLayout() ? 1 : Math.min(3, Math.max(1, count));
    const rows = Math.ceil(count / cols);

    memoryGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    memoryGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  }

  function renderGridMedia(item) {
    if (isVideoThumbnail(item.thumbnail)) {
      return `
        <video
          src="${item.thumbnail}"
          autoplay
          muted
          loop
          playsinline
        ></video>
      `;
    }

    return `<img src="${item.thumbnail}" alt="${item.title}" />`;
  }

  function isVideoThumbnail(path) {
    return /\.(mp4|webm|ogg|mov)$/i.test(path);
  }

  // =========================
  // BUILD GRID
  // =========================
  function buildGrid() {
    memoryGrid.innerHTML = "";
    hoverEnabled = false;
    selectedIndex = 0;

    memoryGrid.classList.add("loading");
    memoryGridWrapper.classList.add("loading");
    loader.classList.remove("hidden");
    browserGridLoading = isMobileLayout();
    browserGridSensorEnabled = !isMobileLayout();

    if (gridData.length === 0) {
      loader.textContent = "NO DATA";
      memoryGrid.classList.remove("loading");
      memoryGridWrapper.classList.remove("loading");
      browserGridLoading = false;
      browserGridSensorEnabled = true;
      return;
    }

    startLoaderDots();

    updateGridSize();

    gridData.forEach((item, index) => {
      const delay = index === 0 ? 0 : index * getGridLoadDelay();

      setTimeout(() => {
        const slot = document.createElement("div");
        slot.className = "memory-slot slot-hidden";

        slot.innerHTML = `
          ${renderGridMedia(item)}
          <span>${item.title}</span>
        `;

        memoryGrid.appendChild(slot);

        requestAnimationFrame(() => {
          slot.classList.remove("slot-hidden");

          if (isMobileLayout()) {
            selectSlot(index);
            scrollMobileBrowserGridToSlot(slot);
          }
        });

        slot.addEventListener("click", () => {
          if (hoverEnabled) {
            openDetail(item);
          }
        });

        if (index === gridData.length - 1) {
          setTimeout(() => {
            hoverEnabled = true;
            memoryGrid.classList.remove("loading");
            memoryGridWrapper.classList.remove("loading");
            loader.classList.add("hidden");
            stopLoaderDots();
            browserGridLoading = false;

            enableHover();

            if (isMobileLayout()) {
              scrollMobileBrowserGridToSlot(slot, true);

              browserGridAutoScrollTimeout = setTimeout(() => {
                memoryGridWrapper.scrollTo({ top: 0, behavior: "smooth" });

                browserGridAutoScrollTimeout = setTimeout(() => {
                  browserGridSensorEnabled = true;
                  updateMobileBrowserGridCenterHighlight();
                }, getGridLoadDelay() * 1.4);
              }, getGridLoadDelay() * 1.5);
            } else {
              selectSlot(0);
            }
          }, 800);
        }
      }, delay);
    });
  }

  async function reloadGridData() {
    try {
      await loadGridData();
    } catch (error) {
      console.error("Could not reload memory grid data:", error);
      gridData = [];
    }
  }

  function openContactTerminal() {
    clearContactTerminal();

    const terminal = document.createElement("div");
    terminal.id = "contact-terminal";
    terminal.innerHTML = `
      <div class="contact-terminal-inner">
        <div class="contact-main">
          <div class="contact-header-row">
            <div class="contact-header">CONTACT TERMINAL</div>
            <button id="copy-contact-button" type="button">COPY</button>
          </div>

          <div class="contact-intro">
            For commissions, collaborations, job offers, exhibitions, or project inquiries, send a message through one of the channels below.
          </div>

          <div class="contact-grid">
            <div class="contact-field contact-field-wide">
              <div class="contact-label">PHONE</div>
              <div class="contact-value">0638381963</div>
            </div>

            <div class="contact-field">
              <div class="contact-label">EMAIL</div>
              <div class="contact-value">mail@timtimscollection.com</div>
            </div>

            <div class="contact-field">
              <div class="contact-label">SOCIAL</div>
              <div class="contact-value">Instagram: Stoned_Parmazan</div>
            </div>

            <div class="contact-field">
              <div class="contact-label">PORTFOLIO / ARCHIVE</div>
              <div class="contact-value">timtimscollection.com</div>
            </div>

            <div class="contact-field">
              <div class="contact-label">BASED IN</div>
              <div class="contact-value">Groningen</div>
            </div>

            <div class="contact-field contact-field-wide">
              <div class="contact-label">AVAILABLE FOR</div>
              <div class="contact-value">
                [Freelance work] / [Collaborations] / [Job offers] / [Exhibitions] / [Design commissions]
              </div>
            </div>

          </div>

          <div class="contact-download">
            <div class="contact-download-text">
              Download a compact PDF containing artist information, contact details, and an archive overview of the work shown in this portfolio.
            </div>
            <button id="download-archive-button" type="button">DOWNLOAD PDF</button>
          </div>
        </div>

        <div class="artist-profile">
          <div class="artist-profile-image">
            <video
              src="assets/Album_Cover/ProfilePicture.mp4"
              autoplay
              muted
              loop
              playsinline
              aria-label="Artist profile video"
            ></video>
          </div>

          <div class="artist-profile-info">
            <div class="contact-label">ARTIST PROFILE</div>
            <div class="artist-name">TimTim</div>

            <div class="artist-copy">
              I'm a graphic designer and technical artist with a Bachelor's degree in Graphic & Interaction Design. I combine my technical expertise with an intuitive, practice-driven approach to transform ideas into engaging visual experiences. I work across Adobe Creative Cloud, 3D, animation, video editing, and print & UI design.
            </div>

            <div class="artist-meta">
              [Graphic design] / [Motion graphics] / [Poster design] / [Digital collage]
            </div>
          </div>
        </div>
      </div>
    `;

    previewWindow.appendChild(terminal);

    document
      .getElementById("copy-contact-button")
      .addEventListener("click", copyContactInfo);

    document
      .getElementById("download-archive-button")
      .addEventListener("click", downloadArtistArchivePdf);
  }

  function clearContactTerminal() {
    document.getElementById("contact-terminal")?.remove();
  }

  async function copyContactInfo() {
    const contactText = [
      "CONTACT TERMINAL",
      "",
      "Name / Alias: TimTim",
      "Email: mail@timtimscollection.com",
      "Phone: 0638381963",
      "Instagram: Stoned_Parmazan",
      "Portfolio / Archive: timtimscollection.com",
      "Based in: Groningen",
      "Available for: Freelance work / Collaborations / Job offers / Exhibitions / Design commissions",
      "",
      "Artist bio:",
      "I'm a graphic designer and technical artist with a Bachelor's degree in Graphic & Interaction Design. I combine my technical expertise with an intuitive, practice-driven approach to transform ideas into engaging visual experiences. I work across Adobe Creative Cloud, 3D, animation, video editing, and print & UI design."
    ].join("\n");

    const button = document.getElementById("copy-contact-button");

    try {
      await navigator.clipboard.writeText(contactText);
      button.textContent = "COPIED";
    } catch (error) {
      console.error("Could not copy contact info:", error);
      button.textContent = "FAILED";
    }

    setTimeout(() => {
      button.textContent = "COPY";
    }, 1400);
  }

  function downloadArtistArchivePdf() {
    const lines = [
      "TIMTIM - ARTIST INFORMATION / ARCHIVE",
      "",
      "Name / Alias: TimTim",
      "Email: mail@timtimscollection.com",
      "Phone: 0638381963",
      "Instagram: Stoned_Parmazan",
      "Portfolio / Archive: timtimscollection.com",
      "Based in: Groningen",
      "Available for: Freelance work / Collaborations / Job offers / Exhibitions / Design commissions",
      "",
      "Artist bio:",
      "I'm a graphic designer and technical artist with a Bachelor's degree in Graphic & Interaction Design. I combine my technical expertise with an intuitive, practice-driven approach to transform ideas into engaging visual experiences. I work across Adobe Creative Cloud, 3D, animation, video editing, and print & UI design.",
      "",
      "Archived work:"
    ];

    gridData.forEach(item => {
      lines.push("");
      lines.push(`${item.title}`);
      lines.push(`${item.description}`);

      if (item.miniGrid?.length) {
        lines.push(`Archive items: ${item.miniGrid.map(miniItem => miniItem.title).join(", ")}`);
      }
    });

    const pdfBlob = createTextPdf(lines);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "TimTim-Artist-Archive.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  function createTextPdf(sourceLines) {
    const wrappedLines = sourceLines.flatMap(line => wrapPdfLine(line, 92));
    const linesPerPage = 48;
    const pages = [];

    for (let index = 0; index < wrappedLines.length; index += linesPerPage) {
      pages.push(wrappedLines.slice(index, index + linesPerPage));
    }

    const objects = [];
    const pageObjectIds = [];

    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

    pages.forEach(pageLines => {
      const contentId = objects.length + 2;
      const pageId = objects.length + 1;
      pageObjectIds.push(pageId);

      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);

      const textCommands = pageLines
        .map((line, lineIndex) => `72 ${780 - lineIndex * 14} Td (${escapePdfText(line)}) Tj`)
        .join("\n");

      const stream = `BT\n/F1 10 Tf\n${textCommands}\nET`;
      objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    });

    objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
  }

  function wrapPdfLine(line, maxLength) {
    if (line.length <= maxLength) {
      return [line];
    }

    const words = line.split(" ");
    const wrapped = [];
    let currentLine = "";

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length > maxLength) {
        wrapped.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      wrapped.push(currentLine);
    }

    return wrapped;
  }

  function escapePdfText(text) {
    return String(text)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function startLoaderDots() {
    clearInterval(loaderInterval);
    let dots = 0;

    loader.textContent = "NOW LOADING";

    loaderInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      loader.textContent = "NOW LOADING" + ".".repeat(dots);
    }, 500);
  }

  function stopLoaderDots() {
    clearInterval(loaderInterval);
    loader.textContent = "NOW LOADING...";
  }

  // =========================
  // HOVER
  // =========================
  function enableHover() {
    const slots = document.querySelectorAll(".memory-slot");

    slots.forEach((slot, index) => {
      let hoverTimeout;

      slot.addEventListener("mouseenter", () => {
        if (!hoverEnabled) {
          return;
        }

        clearTimeout(hoverTimeout);

        hoverTimeout = setTimeout(() => {
          selectSlot(index);
        }, 120);
      });
    });
  }

  function selectSlot(index) {
    selectedIndex = index;

    document.querySelectorAll(".memory-slot").forEach((slot, slotIndex) => {
      slot.classList.toggle("selected", slotIndex === selectedIndex);
    });
  }

  memoryGridWrapper.addEventListener("scroll", updateMobileBrowserGridCenterHighlight);

  function scrollMobileBrowserGridToSlot(slot, correctAfterSettle = false) {
    if (!slot || !isMobileLayout()) {
      return;
    }

    const targetTop = slot.offsetTop - (memoryGridWrapper.clientHeight - slot.offsetHeight) / 2;

    memoryGridWrapper.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });

    if (!correctAfterSettle) {
      return;
    }

    setTimeout(() => {
      const correctedTop = slot.offsetTop - (memoryGridWrapper.clientHeight - slot.offsetHeight) / 2;

      memoryGridWrapper.scrollTo({
        top: Math.max(0, correctedTop),
        behavior: "smooth"
      });
    }, 320);
  }

  function updateMobileBrowserGridCenterHighlight() {
    if (!isMobileLayout() || browserGridLoading || !browserGridSensorEnabled || memoryGrid.style.display === "none") {
      return;
    }

    cancelAnimationFrame(browserGridCenterHighlightFrame);

    browserGridCenterHighlightFrame = requestAnimationFrame(() => {
      const slots = Array.from(memoryGrid.querySelectorAll(".memory-slot:not(.slot-hidden)"));

      if (slots.length === 0) {
        return;
      }

      const wrapperRect = memoryGridWrapper.getBoundingClientRect();
      const sensorY = wrapperRect.top + wrapperRect.height * 0.5;
      let centeredIndex = selectedIndex;

      slots.forEach((slot, index) => {
        const slotRect = slot.getBoundingClientRect();

        if (slotRect.top <= sensorY && slotRect.bottom >= sensorY) {
          centeredIndex = index;
        }
      });

      selectSlot(centeredIndex);
    });
  }

  // =========================
  // DETAIL VIEW
  // =========================
  function openDetail(item) {
    const miniGridItems = item.miniGrid || Array.from({ length: 12 }, () => {
      return {
        title: item.title,
        type: item.type,
        thumbnail: item.thumbnail
      };
    });

    memoryGrid.style.display = "none";
    detailPreviewCurrentPath = "";
    clearTimeout(detailPreviewReturnTimeout);
    clearTimeout(detailPreviewSwapTimeout);

    detailScreen.classList.remove("hidden");
    detailScreen.classList.add("active");

    detailContent.innerHTML = `
      <div class="detail-page">
        <div class="detail-image detail-image-empty"></div>

        <div class="detail-info">
          <div class="detail-header">
            ${item.title}
          </div>

          <div class="detail-description">
            ${item.description}
          </div>

          <div class="detail-mini-grid-wrapper">
            <div class="detail-mini-loading">
              NOW LOADING...
            </div>

            <div class="detail-mini-grid loading" aria-label="Project image preview">
              ${miniGridItems.map((miniItem, index) => `
                <div class="detail-mini-slot slot-hidden">
                  ${renderMiniGridMedia(miniItem, index)}
                </div>
              `).join("")}
            </div>
          </div>

          <button id="back-button">
            RETURN
          </button>
        </div>
      </div>
    `;

    document
      .getElementById("back-button")
      .addEventListener("click", handleDetailReturn);

    detailContent.querySelectorAll(".detail-mini-slot").forEach((slot, index) => {
      slot.addEventListener("mouseenter", () => {
        const miniItem = miniGridItems[index];
        clearTimeout(detailPreviewReturnTimeout);
        updateDetailPreview(miniItem);
      });

      slot.addEventListener("mouseleave", () => {
        holdDetailPreview();
      });
    });

    const detailMiniGrid = detailContent.querySelector(".detail-mini-grid");
    const detailMiniLoading = detailContent.querySelector(".detail-mini-loading");
    const detailMiniSlots = detailContent.querySelectorAll(".detail-mini-slot");
    const detailInfo = detailContent.querySelector(".detail-info");
    const useMobileArchiveLayout = isMobileLayout();

    detailInfo.classList.add("loading");
    detailInfo.scrollTop = 0;

    if (useMobileArchiveLayout) {
      detailMiniLoading.classList.remove("hidden");
      startDetailLoaderDots(detailMiniLoading);
      detailInfo.classList.add("mobile-center-highlight");
      detailInfo.addEventListener("scroll", updateMobileArchiveCenterHighlight);
    } else {
      startDetailLoaderDots(detailMiniLoading);
      detailInfo.addEventListener("scroll", lockDetailScrollWhileLoading);
    }

    detailMiniSlots.forEach((slot, index) => {
      const delay = index === 0 ? 0 : index * getGridLoadDelay();

      setTimeout(() => {
        slot.classList.remove("slot-hidden");

        if (useMobileArchiveLayout) {
          setMobileArchiveHighlight(slot);
          scrollMobileArchiveToSlot(slot);
        }
      }, delay);
    });

    setTimeout(() => {
      detailMiniGrid.classList.remove("loading");
      detailInfo.classList.remove("loading");
      detailInfo.removeEventListener("scroll", lockDetailScrollWhileLoading);
      detailMiniLoading.classList.add("hidden");
      stopDetailLoaderDots();

      if (useMobileArchiveLayout) {
        updateMobileArchiveCenterHighlight();
        detailAutoScrollTimeout = setTimeout(() => {
          detailInfo.scrollTo({ top: 0, behavior: "smooth" });
        }, 650);
      }
    }, detailMiniSlots.length * getGridLoadDelay() + 800);
  }

  function closeDetail() {
    stopDetailLoaderDots();
    clearTimeout(detailPreviewReturnTimeout);
    clearTimeout(detailPreviewSwapTimeout);
    clearTimeout(detailAutoScrollTimeout);
    cancelAnimationFrame(detailCenterHighlightFrame);
    detailContent.querySelector(".detail-info")?.classList.remove("loading");
    detailContent
      .querySelector(".detail-info")
      ?.removeEventListener("scroll", lockDetailScrollWhileLoading);
    detailContent
      .querySelector(".detail-info")
      ?.removeEventListener("scroll", updateMobileArchiveCenterHighlight);
    detailScreen.classList.add("hidden");
    detailScreen.classList.remove("active");
    memoryGrid.style.display = "grid";
  }

  function handleDetailReturn() {
    const imageViewer = detailContent.querySelector(".detail-image-viewer");

    if (imageViewer) {
      imageViewer.remove();
      return;
    }

    closeDetail();
  }

  function openImageViewer(item) {
    const existingViewer = detailContent.querySelector(".detail-image-viewer");

    if (existingViewer) {
      existingViewer.remove();
    }

    const viewer = document.createElement("div");
    viewer.className = "detail-image-viewer";
    viewer.innerHTML = `
      <button class="image-viewer-back">
        RETURN
      </button>

      <div class="image-viewer-scroll">
        ${renderViewerMedia(item)}
      </div>
    `;

    detailContent.appendChild(viewer);

    viewer
      .querySelector(".image-viewer-back")
      .addEventListener("click", () => {
        viewer.remove();
      });
  }

  function renderMiniGridMedia(item, index) {
    if (item.type === "video") {
      return `
        <video
          src="${item.thumbnail}"
          data-mini-index="${index}"
          autoplay
          muted
          loop
          playsinline
        ></video>
      `;
    }

    return `<img src="${item.thumbnail}" alt="${item.title}" data-mini-index="${index}" />`;
  }

  function updateDetailPreview(item) {
    const detailImage = detailContent.querySelector(".detail-image");

    if (!detailImage) {
      return;
    }

    if (detailPreviewCurrentPath === item.thumbnail) {
      return;
    }

    clearTimeout(detailPreviewSwapTimeout);

    const currentMedia = detailImage.querySelector(".detail-preview-media");

    if (!currentMedia) {
      detailImage.classList.remove("detail-image-empty");
      detailImage.innerHTML = renderDetailPreviewMedia(item);
      detailPreviewCurrentPath = item.thumbnail;
      return;
    }

    currentMedia.style.opacity = getComputedStyle(currentMedia).opacity;
    currentMedia.style.animation = "none";
    currentMedia.getBoundingClientRect();
    currentMedia.classList.add("detail-preview-fade-out");
    currentMedia.style.opacity = "0";

    detailPreviewSwapTimeout = setTimeout(() => {
      detailImage.classList.remove("detail-image-empty");
      detailImage.innerHTML = renderDetailPreviewMedia(item);
      detailPreviewCurrentPath = item.thumbnail;
    }, 450);
  }

  function holdDetailPreview() {
    clearTimeout(detailPreviewReturnTimeout);
  }

  function renderDetailPreviewMedia(item) {
    if (item.type === "video" || isVideoThumbnail(item.thumbnail)) {
      return `
        <video
          class="detail-preview-media"
          src="${item.thumbnail}"
          autoplay
          muted
          loop
          playsinline
        ></video>
      `;
    }

    return `<img class="detail-preview-media" src="${item.thumbnail}" alt="${item.title}" />`;
  }

  function renderViewerMedia(item) {
    if (item.type === "video") {
      return `
        <video
          src="${item.thumbnail}"
          autoplay
          muted
          loop
          playsinline
          controls
        ></video>
      `;
    }

    return `<img src="${item.thumbnail}" alt="${item.title}" />`;
  }

  function lockDetailScrollWhileLoading(event) {
    if (event.currentTarget.classList.contains("loading")) {
      event.currentTarget.scrollTop = 0;
    }
  }

  function scrollMobileArchiveToSlot(slot) {
    const detailInfo = detailContent.querySelector(".detail-info");

    if (!detailInfo || !slot) {
      return;
    }

    const targetTop = slot.offsetTop - (detailInfo.clientHeight - slot.offsetHeight) / 2;

    detailInfo.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });

    setTimeout(() => {
      const correctedTop = slot.offsetTop - (detailInfo.clientHeight - slot.offsetHeight) / 2;

      detailInfo.scrollTo({
        top: Math.max(0, correctedTop),
        behavior: "smooth"
      });
    }, 280);
  }

  function updateMobileArchiveCenterHighlight() {
    cancelAnimationFrame(detailCenterHighlightFrame);

    detailCenterHighlightFrame = requestAnimationFrame(() => {
      const detailInfo = detailContent.querySelector(".detail-info");
      const slots = Array.from(detailContent.querySelectorAll(".detail-mini-slot:not(.slot-hidden)"));

      if (!detailInfo || slots.length === 0 || !isMobileLayout()) {
        return;
      }

      const infoRect = detailInfo.getBoundingClientRect();
      const centerY = infoRect.top + infoRect.height * 0.62;
      let centeredSlot = null;

      slots.forEach(slot => {
        const slotRect = slot.getBoundingClientRect();

        if (slotRect.top <= centerY && slotRect.bottom >= centerY) {
          centeredSlot = slot;
        }
      });

      setMobileArchiveHighlight(centeredSlot);
    });
  }

  function setMobileArchiveHighlight(activeSlot) {
    detailContent.querySelectorAll(".detail-mini-slot").forEach(slot => {
      slot.classList.toggle("center-highlight", slot === activeSlot);
    });
  }

  function startDetailLoaderDots(element) {
    clearInterval(detailLoaderInterval);
    let dots = 0;

    element.textContent = "NOW LOADING";

    detailLoaderInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      element.textContent = "NOW LOADING" + ".".repeat(dots);
    }, 500);
  }

  function stopDetailLoaderDots() {
    clearInterval(detailLoaderInterval);
  }
});
