// Course action handlers
// Manages adding/removing courses and conflict detection

import { state } from './state.js';
import { denseKey } from './courseData.js';
import { isSaved, isSelected } from './filters.js';
import { saveToStorage } from './storage.js';
import { parseTimeToSchedule } from './timeParser.js';

// Add course to saved list
export function addToSaved(course){
  const key = denseKey(course);
  if (isSaved(key)) return;
  state.savedCourses.push(course);
  saveToStorage();
}

// Remove course from both saved and selected lists
export function removeSaved(key){
  state.savedCourses = state.savedCourses.filter(c=>denseKey(c) !== key);
  state.selectedCourses = state.selectedCourses.filter(c=>denseKey(c) !== key);
  saveToStorage();
}

// Check if new course conflicts with already selected courses
// Returns array of conflicting courses (checks all time segments)
export function checkNewCourseConflict(newCourse){
  const newTimes = parseTimeToSchedule(newCourse.time);
  if (!newTimes || newTimes.length === 0) return [];
  const conflicts = [];
  for (const ex of state.selectedCourses){
    const exTimes = parseTimeToSchedule(ex.time);
    if (!exTimes || exTimes.length === 0) continue;
    
    for (const newInfo of newTimes) {
      for (const exInfo of exTimes) {
        if (newInfo.day !== exInfo.day) continue;
        const overlap = newInfo.slots.some(s => exInfo.slots.includes(s));
        if (overlap && !conflicts.includes(ex)) {
          conflicts.push(ex);
          break;
        }
      }
    }
  }
  return conflicts;
}

// Toggle course selection on/off
// Performs conflict check and sets conflictingCourse state on failure
export function toggleSelected(key, onConflict){
  const course = state.savedCourses.find(c=>denseKey(c)===key);
  if (!course) return;

  if (isSelected(key)){
    state.selectedCourses = state.selectedCourses.filter(c=>denseKey(c)!==key);
    state.conflictingCourse = null;
    saveToStorage();
    return { success: true };
  }

  const conflicts = checkNewCourseConflict(course);
  if (conflicts.length){
    state.conflictingCourse = course;
    return { success: false, conflicts };
  }

  state.selectedCourses.push(course);
  state.conflictingCourse = null;
  saveToStorage();
  return { success: true };
}
