// Global application state
// Centralized store for courses, filters, and UI state

export const state = {
  courses: [],
  denseMap: {},
  savedCourses: [],
  selectedCourses: [],
  conflictingCourse: null,
  currentTerm: "",
  availableTerms: [],
  activePage: "P1",
  activeDept: "",
  page: 1,
  PAGE_SIZE: 20,
  selectedSlotKeys: new Set(),
  strictSlotSearch: true,
  _slotDragging: false,
  _slotDragAdd: true,
  _slotMouseDownKey: null
};

// Reset course-related state (preserves UI state)
export function resetCourseData() {
  state.courses = [];
  state.denseMap = {};
  state.savedCourses = [];
  state.selectedCourses = [];
  state.conflictingCourse = null;
}
