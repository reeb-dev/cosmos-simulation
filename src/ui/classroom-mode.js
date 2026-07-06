/**
 * Modo aula: el docente bloquea modo/teoría/cosmología vía URL;
 * los estudiantes ven una GUI simplificada y controles bloqueados.
 *
 * URL ejemplo:
 * ?classroom=1&lockMode=black_hole&lockTheory=firewall&lockPreset=planck2018
 */

const CLASSROOM_PARAMS = ['classroom', 'lockMode', 'lockTheory', 'lockPreset', 'classRole'];

export function parseClassroomConfig(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    enabled: params.get('classroom') === '1',
    lockMode: params.get('lockMode') || null,
    lockTheory: params.get('lockTheory') || null,
    lockPreset: params.get('lockPreset') || null,
    role: params.get('classRole') === 'teacher' ? 'teacher' : 'student',
  };
}

export function buildClassroomUrl(locks, { role = 'student' } = {}) {
  const params = new URLSearchParams();
  params.set('classroom', '1');
  if (role === 'teacher') params.set('classRole', 'teacher');
  if (locks.mode) params.set('lockMode', locks.mode);
  if (locks.theory) params.set('lockTheory', locks.theory);
  if (locks.preset) params.set('lockPreset', locks.preset);
  const qs = params.toString();
  return `${window.location.origin}${window.location.pathname}?${qs}`;
}

export function createClassroomMode(ctx) {
  const config = parseClassroomConfig();
  const state = {
    enabled: config.enabled,
    role: config.role,
    locks: {
      mode: config.lockMode,
      theory: config.lockTheory,
      preset: config.lockPreset,
    },
  };

  const disabledControllers = [];

  function isActive() {
    return state.enabled;
  }

  function isStudentView() {
    return state.enabled && state.role === 'student';
  }

  function getLocks() {
    return { ...state.locks };
  }

  function lockController(ctrl) {
    if (!ctrl) return;
    ctrl.disable?.();
    disabledControllers.push(ctrl);
  }

  function applyLocksFromUrl() {
    if (!state.enabled) return;

    if (state.locks.mode && ctx.modeManager) {
      ctx.modeManager.setMode(state.locks.mode);
    }
    if (state.locks.theory && ctx.horizonSim) {
      ctx.horizonSim.setTheory(state.locks.theory);
      ctx.onTheoryChange?.(state.locks.theory);
    }
    if (state.locks.preset && ctx.theoryLab) {
      ctx.theoryLab.applyCosmologyPreset(state.locks.preset);
      ctx.onRsChange?.();
    }
    ctx.guiSync?.();
  }

  function applyGuiRestrictions(controllers, folders) {
    if (!state.enabled) return;

    if (isStudentView()) {
      setFolderVisible(folders.lab, false);
      setFolderVisible(folders.rupture, false);
      if (folders.research) setFolderVisible(folders.research, false);
    }

    if (state.locks.mode) lockController(controllers.simMode);
    if (state.locks.theory) lockController(controllers.theory);
    if (state.locks.preset) lockController(controllers.preset);
  }

  function setFolderVisible(folder, visible) {
    if (!folder) return;
    if (visible) folder.show();
    else {
      folder.close?.();
      folder.hide();
    }
  }

  function captureCurrentLocks() {
    return {
      mode: ctx.modeManager?.currentMode ?? null,
      theory: ctx.horizonSim?.theoryId ?? null,
      preset: ctx.theoryLab?.activePreset ?? null,
    };
  }

  function setEnabled(value) {
    state.enabled = value;
    if (value) {
      state.locks = captureCurrentLocks();
    }
    syncUrlClassroomState();
  }

  function syncUrlClassroomState() {
    const base = new URLSearchParams(window.location.search);
    for (const key of CLASSROOM_PARAMS) base.delete(key);

    if (state.enabled) {
      base.set('classroom', '1');
      if (state.role === 'teacher') base.set('classRole', 'teacher');
      if (state.locks.mode) base.set('lockMode', state.locks.mode);
      if (state.locks.theory) base.set('lockTheory', state.locks.theory);
      if (state.locks.preset) base.set('lockPreset', state.locks.preset);
    }

    const qs = base.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }

  function copyClassroomLink() {
    const url = buildClassroomUrl(state.locks, { role: 'student' });
    navigator.clipboard?.writeText(url);
    return url;
  }

  function addGuiControls(parentGui, controllers, folders) {
    const folder = parentGui.addFolder('Modo aula');
    const guiState = {
      classroom: state.enabled,
      role: state.role === 'teacher' ? 'Docente' : 'Estudiante',
      copyLink: () => {
        if (!state.enabled) {
          state.enabled = true;
          state.locks = captureCurrentLocks();
          guiState.classroom = true;
          syncUrlClassroomState();
          applyGuiRestrictions(controllers, folders);
        }
        const url = copyClassroomLink();
        console.info('Enlace de aula copiado:', url);
      },
    };

    folder.add(guiState, 'classroom').name('Modo aula').onChange((v) => {
      setEnabled(v);
      if (v) {
        state.locks = captureCurrentLocks();
        applyGuiRestrictions(controllers, folders);
      } else {
        for (const c of disabledControllers) c.enable?.();
        disabledControllers.length = 0;
        if (folders.lab) folders.lab.show();
        if (folders.research) folders.research?.show();
      }
      controllers.classroomRole?.updateDisplay?.();
    });

    folder.add(guiState, 'role', ['Docente', 'Estudiante']).name('Rol').onChange((label) => {
      state.role = label === 'Docente' ? 'teacher' : 'student';
      syncUrlClassroomState();
      applyGuiRestrictions(controllers, folders);
    });
    controllers.classroomRole = folder.controllers[folder.controllers.length - 1];

    folder.add(guiState, 'copyLink').name('🔗 Copiar enlace alumnos');
    folder.open();

    return { folder, applyGuiRestrictions, applyLocksFromUrl, isActive, isStudentView, getLocks };
  }

  return {
    isActive,
    isStudentView,
    getLocks,
    applyLocksFromUrl,
    applyGuiRestrictions,
    addGuiControls,
    copyClassroomLink,
    buildClassroomUrl: (locks) => buildClassroomUrl(locks ?? state.locks),
  };
}
