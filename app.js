/**
 * Desafio dos R$ 125.250 (1 a 500)
 * Lógica Completa de Aplicação
 */

const STORAGE_KEY = 'desafio_125250_data_v1';
const SOUND_SETTING_KEY = 'desafio_125250_sound_enabled';
const START_DATE_KEY = 'desafio_125250_start_date';
const FREQ_KEY = 'desafio_125250_frequency';
const TOTAL_ITEMS = 500;
const TARGET_TOTAL = (TOTAL_ITEMS * (TOTAL_ITEMS + 1)) / 2; // R$ 125.250,00

// Estado da Aplicação
let appState = {
  savedNumbers: {}, // Formato: { "1": "2026-08-16T12:00:00.000Z", "2": ... }
  startDate: '',
  depositFrequency: '1d',
  soundEnabled: localStorage.getItem(SOUND_SETTING_KEY) !== 'false',
  currentStatusFilter: 'all', // 'all' | 'pending' | 'done'
  currentRangeFilter: 'all',  // 'all' | '1-100' | '101-200' ...
  searchTerm: '',
  lastCelebratedMilestone: 0
};

// Sintetizador de Áudio (Web Audio API - sem dependências externas)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playCoinSound() {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn('Áudio não suportado ou bloqueado', e);
  }
}

function playUncheckSound() {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn(e);
  }
}

function playCelebrationSound() {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.09);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.09);
      osc.stop(ctx.currentTime + index * 0.09 + 0.35);
    });
  } catch (e) {
    console.warn(e);
  }
}

// ==========================================================
// Efeito de Confetes (Canvas Nativo 2D)
// ==========================================================
const confettiCanvas = document.getElementById('confetti-canvas');
const ctxConfetti = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchConfetti(count = 90) {
  const colors = ['#10B981', '#34D399', '#F59E0B', '#FBBF24', '#60A5FA', '#F472B6'];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
      w: Math.random() * 8 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1) * 12 - 4,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  if (!confettiAnimationId) {
    renderConfetti();
  }
}

function renderConfetti() {
  ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.28; // Gravidade
    p.rotation += p.vRot;
    p.opacity -= 0.008;

    ctxConfetti.save();
    ctxConfetti.translate(p.x, p.y);
    ctxConfetti.rotate((p.rotation * Math.PI) / 180);
    ctxConfetti.globalAlpha = Math.max(0, p.opacity);
    ctxConfetti.fillStyle = p.color;
    ctxConfetti.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctxConfetti.restore();

    if (p.opacity <= 0 || p.y > confettiCanvas.height) {
      confettiParticles.splice(index, 1);
    }
  });

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(renderConfetti);
  } else {
    confettiAnimationId = null;
    ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// ==========================================================
// Persistência de Dados
// ==========================================================
function loadSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Suporte a formato novo { savedNumbers, startDate, depositFrequency } ou antigo { "1": "..." }
      if (parsed && typeof parsed === 'object') {
        if (parsed.savedNumbers) {
          appState.savedNumbers = parsed.savedNumbers;
          if (parsed.startDate) appState.startDate = parsed.startDate;
          if (parsed.depositFrequency) appState.depositFrequency = parsed.depositFrequency;
        } else {
          appState.savedNumbers = parsed;
        }
      }
    }

    const savedStartDate = localStorage.getItem(START_DATE_KEY);
    if (savedStartDate) appState.startDate = savedStartDate;

    const savedFreq = localStorage.getItem(FREQ_KEY);
    if (savedFreq) appState.depositFrequency = savedFreq;
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
    appState.savedNumbers = {};
  }
}

function persistData() {
  try {
    const payload = {
      version: 1,
      startDate: appState.startDate,
      depositFrequency: appState.depositFrequency,
      savedNumbers: appState.savedNumbers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (appState.startDate) localStorage.setItem(START_DATE_KEY, appState.startDate);
    if (appState.depositFrequency) localStorage.setItem(FREQ_KEY, appState.depositFrequency);
  } catch (e) {
    console.error('Erro ao salvar dados:', e);
    showToast('Erro ao salvar no armazenamento local');
  }
}

// ==========================================================
// Utilitários de Formatação
// ==========================================================
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// ==========================================================
// Atualização de Estatísticas e Dashboard
// ==========================================================
function updateDashboard() {
  const savedKeys = Object.keys(appState.savedNumbers);
  const countSaved = savedKeys.length;
  
  // Soma dos números guardados
  let totalSaved = 0;
  for (let i = 0; i < countSaved; i++) {
    totalSaved += Number(savedKeys[i]);
  }

  const remaining = TARGET_TOTAL - totalSaved;
  const percentage = (totalSaved / TARGET_TOTAL) * 100;
  const avgSaved = countSaved > 0 ? (totalSaved / countSaved) : 0;

  // Atualiza Valores do Card Hero
  document.getElementById('total-saved').textContent = formatCurrency(totalSaved);
  document.getElementById('total-remaining').textContent = `R$ ${formatCurrency(remaining)}`;
  document.getElementById('count-saved').textContent = `${countSaved} / ${TOTAL_ITEMS}`;
  document.getElementById('avg-saved').textContent = `R$ ${formatCurrency(avgSaved)}`;
  document.getElementById('percent-badge').textContent = `${percentage.toFixed(1)}%`;
  document.getElementById('main-progress-bar').style.width = `${percentage}%`;

  // Atualiza Valores da Folha de Impressão
  const printSaved = document.getElementById('print-saved');
  const printPercent = document.getElementById('print-percent');
  const printRemaining = document.getElementById('print-remaining');
  const printCount = document.getElementById('print-count');
  if (printSaved) printSaved.textContent = `R$ ${formatCurrency(totalSaved)}`;
  if (printPercent) printPercent.textContent = `${percentage.toFixed(1)}%`;
  if (printRemaining) printRemaining.textContent = `R$ ${formatCurrency(remaining)}`;
  if (printCount) printCount.textContent = `${countSaved} / ${TOTAL_ITEMS}`;

  // Atualiza Badges de Filtros
  document.getElementById('tab-all-count').textContent = TOTAL_ITEMS;
  document.getElementById('tab-pending-count').textContent = TOTAL_ITEMS - countSaved;
  document.getElementById('tab-done-count').textContent = countSaved;

  // Atualiza Marcos (Milestones)
  updateMilestones(percentage);

  // Atualiza Previsão de Data
  calculateEndDate();
}

function updateMilestones(percentage) {
  const milestones = [
    { id: 'ms-10', val: 10 },
    { id: 'ms-25', val: 25 },
    { id: 'ms-50', val: 50 },
    { id: 'ms-75', val: 75 },
    { id: 'ms-100', val: 100 }
  ];

  milestones.forEach(m => {
    const el = document.getElementById(m.id);
    if (percentage >= m.val) {
      if (!el.classList.contains('reached')) {
        el.classList.add('reached');
        if (m.val > appState.lastCelebratedMilestone) {
          appState.lastCelebratedMilestone = m.val;
          launchConfetti(120);
          playCelebrationSound();
          showToast(`🎉 Parabéns! Você atingiu ${m.val}% da sua meta de R$ 125.250!`);
        }
      }
    } else {
      el.classList.remove('reached');
    }
  });
}

const START_DATE_KEY = 'desafio_125250_start_date';

function calculateEndDate() {
  const startDateInput = document.getElementById('start-date-input');
  const freqSelect = document.getElementById('freq-select');
  const dateDisplay = document.getElementById('finish-date-display');
  const durationDisplay = document.getElementById('finish-duration-display');
  const currentDayBadge = document.getElementById('current-day-badge');
  const journeyStatusText = document.getElementById('journey-status-text');

  // Inicializa com valor salvo ou hoje se estiver vazio
  if (!startDateInput.value) {
    if (appState.startDate) {
      startDateInput.value = appState.startDate;
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      startDateInput.value = `${year}-${month}-${day}`;
    }
  }

  if (appState.depositFrequency && freqSelect) {
    freqSelect.value = appState.depositFrequency;
  }

  // Atualiza estado e salva
  appState.startDate = startDateInput.value;
  if (freqSelect) appState.depositFrequency = freqSelect.value;
  persistData();

  const [startYear, startMonth, startDay] = startDateInput.value.split('-').map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Diferença em dias entre hoje e a data de início
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.round(diffTime / msPerDay);

  const countSaved = Object.keys(appState.savedNumbers).length;
  const remaining = TOTAL_ITEMS - countSaved;

  // Atualização do Contador do Dia Atual
  if (diffDays < 0) {
    const daysUntilStart = Math.abs(diffDays);
    currentDayBadge.textContent = `Inicia em ${daysUntilStart} ${daysUntilStart === 1 ? 'dia' : 'dias'}`;
    journeyStatusText.textContent = `Seu desafio começará em ${startDate.toLocaleDateString('pt-BR')}.`;
  } else {
    const currentDay = diffDays + 1; // Dia 1 no primeiro dia, Dia 16 se começou há 15 dias
    currentDayBadge.textContent = `Dia ${currentDay} da jornada`;

    if (diffDays === 0) {
      journeyStatusText.textContent = `🎉 Hoje é o seu 1º dia de desafio! Você já guardou ${countSaved} de 500.`;
    } else {
      if (countSaved >= currentDay) {
        journeyStatusText.textContent = `🚀 Excelente! Você está no Dia ${currentDay} e já guardou ${countSaved} depósitos (${countSaved - currentDay} acima da meta diária).`;
      } else {
        const behind = currentDay - countSaved;
        journeyStatusText.textContent = `📅 Você está no Dia ${currentDay} da jornada e guardou ${countSaved} depósitos (${behind} para igualar aos dias corridos).`;
      }
    }
  }

  if (remaining === 0) {
    dateDisplay.textContent = '🎉 Meta Atingida!';
    durationDisplay.textContent = 'Você já completou todos os 500 depósitos!';
    currentDayBadge.textContent = '🏆 Desafio Concluído!';
    return;
  }

  const freq = freqSelect ? freqSelect.value : '1d';
  let totalDaysNeeded = 0;

  if (freq === '1d') {
    // 1 depósito por dia
    totalDaysNeeded = remaining;
  } else if (freq === '5w') {
    // 5 depósitos por semana (Seg a Sex)
    totalDaysNeeded = Math.ceil((remaining / 5) * 7);
  } else if (freq === '3w') {
    // 3 depósitos por semana
    totalDaysNeeded = Math.ceil((remaining / 3) * 7);
  } else if (freq === '2w') {
    // 2 depósitos por semana
    totalDaysNeeded = Math.ceil((remaining / 2) * 7);
  } else if (freq === '1w') {
    // 1 depósito por semana
    totalDaysNeeded = remaining * 7;
  }

  // Previsão baseada no momento atual para completar o restante
  const baseDate = diffDays < 0 ? startDate : today;
  const targetDate = new Date(baseDate.getTime());
  targetDate.setDate(targetDate.getDate() + totalDaysNeeded);

  const formattedDate = targetDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  dateDisplay.textContent = formattedDate;

  // Cálculo amigável de duração restante
  const years = Math.floor(totalDaysNeeded / 365);
  const remainingDaysAfterYears = totalDaysNeeded % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);

  durationDisplay.textContent = `Faltam ${remaining} depósitos (~${totalDaysNeeded} dias corridos / ${parts.join(', ')})`;
}

// ==========================================================
// Renderização da Grade de 500 Itens
// ==========================================================
const gridContainer = document.getElementById('numbers-grid');
const noResultsEl = document.getElementById('no-results');

function renderGrid() {
  const fragment = document.createDocumentFragment();
  let visibleCount = 0;

  for (let num = 1; num <= TOTAL_ITEMS; num++) {
    const isSaved = !!appState.savedNumbers[num];

    // Checagem de Filtros
    // 1. Status Filter
    if (appState.currentStatusFilter === 'pending' && isSaved) continue;
    if (appState.currentStatusFilter === 'done' && !isSaved) continue;

    // 2. Range Filter
    if (appState.currentRangeFilter !== 'all') {
      const [minStr, maxStr] = appState.currentRangeFilter.split('-');
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      if (num < min || num > max) continue;
    }

    // 3. Search Filter
    if (appState.searchTerm) {
      if (!String(num).includes(appState.searchTerm)) continue;
    }

    visibleCount++;

    const cell = document.createElement('div');
    cell.className = `num-cell ${isSaved ? 'saved' : ''}`;
    cell.dataset.num = num;
    cell.id = `num-cell-${num}`;

    cell.innerHTML = `
      <span class="num-unit">R$</span>
      <span class="num-val">${num}</span>
    `;

    cell.addEventListener('click', () => toggleNumber(num));
    fragment.appendChild(cell);
  }

  gridContainer.innerHTML = '';
  gridContainer.appendChild(fragment);

  if (visibleCount === 0) {
    noResultsEl.classList.remove('hidden');
  } else {
    noResultsEl.classList.add('hidden');
  }
}

function toggleNumber(num) {
  const isSaved = !!appState.savedNumbers[num];

  if (isSaved) {
    delete appState.savedNumbers[num];
    playUncheckSound();
    showToast(`R$ ${num},00 desmarcado.`);
  } else {
    appState.savedNumbers[num] = new Date().toISOString();
    playCoinSound();
    showToast(`✓ R$ ${num},00 guardado com sucesso!`);
  }

  persistData();
  updateDashboard();

  // Atualiza apenas a célula clicada se não estiver em modo de filtro que a esconda
  const cell = document.getElementById(`num-cell-${num}`);
  if (cell) {
    if (appState.currentStatusFilter !== 'all') {
      renderGrid();
    } else {
      if (appState.savedNumbers[num]) {
        cell.classList.add('saved');
      } else {
        cell.classList.remove('saved');
      }
    }
  }
}

// ==========================================================
// Sorteador do Dia
// ==========================================================
let currentDrawnNumber = null;
let isSpinning = false;

function getPendingNumbersInTier(tier) {
  const pending = [];
  let min = 1, max = 500;

  if (tier === 'low') { min = 1; max = 100; }
  else if (tier === 'mid') { min = 101; max = 300; }
  else if (tier === 'high') { min = 301; max = 500; }

  for (let i = min; i <= max; i++) {
    if (!appState.savedNumbers[i]) {
      pending.push(i);
    }
  }
  return pending;
}

function handleSpinRoulette() {
  if (isSpinning) return;

  const tier = document.getElementById('roulette-tier').value;
  const candidates = getPendingNumbersInTier(tier);

  if (candidates.length === 0) {
    showToast('Todos os valores desta categoria já foram guardados!');
    return;
  }

  isSpinning = true;
  const displayNum = document.getElementById('roulette-number');
  const btnMark = document.getElementById('btn-mark-roulette');
  const message = document.getElementById('roulette-message');
  btnMark.classList.add('hidden');
  message.textContent = 'Sorteando...';

  let counter = 0;
  const maxIterations = 20;
  const interval = setInterval(() => {
    const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
    displayNum.textContent = randomPick;
    counter++;

    if (counter >= maxIterations) {
      clearInterval(interval);
      const finalPick = candidates[Math.floor(Math.random() * candidates.length)];
      displayNum.textContent = finalPick;
      currentDrawnNumber = finalPick;
      isSpinning = false;
      message.textContent = `Que tal guardar R$ ${finalPick},00 hoje?`;
      btnMark.classList.remove('hidden');
      playCelebrationSound();

      // Destacar visualmente na grade
      highlightCell(finalPick);
    }
  }, 60);
}

function highlightCell(num) {
  // Rola até o número se ele estiver no grid
  const cell = document.getElementById(`num-cell-${num}`);
  if (cell) {
    cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    cell.classList.add('highlight-spin');
    setTimeout(() => {
      cell.classList.remove('highlight-spin');
    }, 4000);
  }
}

function handleMarkFromRoulette() {
  if (!currentDrawnNumber) return;
  toggleNumber(currentDrawnNumber);
  document.getElementById('btn-mark-roulette').classList.add('hidden');
  document.getElementById('roulette-message').textContent = `✓ R$ ${currentDrawnNumber},00 marcado como guardado!`;
  currentDrawnNumber = null;
}

// ==========================================================
// Filtros e Busca
// ==========================================================
function setupFilters() {
  // Status Tabs
  const statusTabs = document.querySelectorAll('.tab-btn');
  statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      statusTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      appState.currentStatusFilter = tab.dataset.status;
      renderGrid();
    });
  });

  // Range Chips
  const rangeChips = document.querySelectorAll('.chip-btn');
  rangeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      rangeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      appState.currentRangeFilter = chip.dataset.range;
      renderGrid();
    });
  });

  // Input de Busca
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('btn-clear-search');

  searchInput.addEventListener('input', (e) => {
    appState.searchTerm = e.target.value.trim();
    if (appState.searchTerm) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
    renderGrid();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    appState.searchTerm = '';
    clearBtn.classList.add('hidden');
    renderGrid();
  });
}

// ==========================================================
// Backup & Exportação / Importação
// ==========================================================
function setupBackupAndModals() {
  const modal = document.getElementById('backup-modal');
  const btnBackup = document.getElementById('btn-backup-menu');
  const btnClose = document.getElementById('modal-close');
  const btnExport = document.getElementById('btn-export-json');
  const inputImport = document.getElementById('input-import-json');
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');
  const btnSound = document.getElementById('btn-sound-toggle');
  const iconSoundOn = document.getElementById('sound-icon-on');
  const iconSoundOff = document.getElementById('sound-icon-off');

  // Atualizar estado visual do som
  function syncSoundUI() {
    if (appState.soundEnabled) {
      iconSoundOn.classList.remove('hidden');
      iconSoundOff.classList.add('hidden');
    } else {
      iconSoundOn.classList.add('hidden');
      iconSoundOff.classList.remove('hidden');
    }
  }
  syncSoundUI();

  btnSound.addEventListener('click', () => {
    appState.soundEnabled = !appState.soundEnabled;
    localStorage.setItem(SOUND_SETTING_KEY, appState.soundEnabled);
    syncSoundUI();
    showToast(appState.soundEnabled ? 'Sons ativados 🔊' : 'Sons desativados 🔇');
  });

  btnBackup.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  btnClose.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Exportar JSON
  btnExport.addEventListener('click', () => {
    const backupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      startDate: appState.startDate,
      depositFrequency: appState.depositFrequency,
      savedNumbers: appState.savedNumbers
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_desafio_125250_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup exportado com sucesso!');
  });

  // Importar JSON
  inputImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof parsed === 'object' && parsed !== null) {
          if (parsed.savedNumbers) {
            appState.savedNumbers = parsed.savedNumbers;
            if (parsed.startDate) {
              appState.startDate = parsed.startDate;
              const dateInput = document.getElementById('start-date-input');
              if (dateInput) dateInput.value = parsed.startDate;
            }
            if (parsed.depositFrequency) {
              appState.depositFrequency = parsed.depositFrequency;
              const freqSelect = document.getElementById('freq-select');
              if (freqSelect) freqSelect.value = parsed.depositFrequency;
            }
          } else {
            appState.savedNumbers = parsed;
          }

          persistData();
          updateDashboard();
          renderGrid();
          calculateEndDate();
          modal.classList.add('hidden');
          showToast('Backup restaurado com sucesso! 🎉');
        } else {
          showToast('Arquivo de backup inválido.');
        }
      } catch (err) {
        showToast('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Imprimir Folha Física (Garante os 500 números visíveis na folha)
  btnPrint.addEventListener('click', () => {
    modal.classList.add('hidden');
    const previousStatus = appState.currentStatusFilter;
    const previousRange = appState.currentRangeFilter;
    const previousSearch = appState.searchTerm;

    // Reseta temporariamente para renderizar todos os 500 números na folha
    appState.currentStatusFilter = 'all';
    appState.currentRangeFilter = 'all';
    appState.searchTerm = '';
    renderGrid();

    // Abre janela de impressão
    setTimeout(() => {
      window.print();

      // Restaura filtros anteriores
      appState.currentStatusFilter = previousStatus;
      appState.currentRangeFilter = previousRange;
      appState.searchTerm = previousSearch;
      renderGrid();
    }, 100);
  });

  // Resetar Tudo
  btnReset.addEventListener('click', () => {
    const confirmed = confirm('Tem certeza que deseja zerar todo o seu progresso do desafio? Esta ação não pode ser desfeita sem backup.');
    if (confirmed) {
      appState.savedNumbers = {};
      appState.lastCelebratedMilestone = 0;
      persistData();
      updateDashboard();
      renderGrid();
      showToast('Desafio reiniciado. Boa sorte no recomeço!');
    }
  });
}

// ==========================================================
// Inicialização Geral
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedData();
  setupFilters();
  setupBackupAndModals();
  
  // Sorteador
  document.getElementById('btn-spin').addEventListener('click', handleSpinRoulette);
  document.getElementById('btn-mark-roulette').addEventListener('click', handleMarkFromRoulette);

  // Previsão de Data
  const startDateInput = document.getElementById('start-date-input');
  const freqSelect = document.getElementById('freq-select');
  if (startDateInput && freqSelect) {
    startDateInput.addEventListener('input', calculateEndDate);
    startDateInput.addEventListener('change', calculateEndDate);
    freqSelect.addEventListener('change', calculateEndDate);
  }

  // Render inicial
  updateDashboard();
  renderGrid();
  calculateEndDate();
});
