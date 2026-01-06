import { state } from './state.js';
import { denseKey } from './courseData.js';
import { isSaved, isSelected } from './filters.js';
import { saveToStorage } from './storage.js';
import { parseTimeToSchedule } from './timeParser.js';

export function addToSaved(course){
  const key = denseKey(course);
  if (isSaved(key)) return;
  state.savedCourses.push(course);
  saveToStorage();
}

export function removeSaved(key){
  state.savedCourses = state.savedCourses.filter(c=>denseKey(c) !== key);
  state.selectedCourses = state.selectedCourses.filter(c=>denseKey(c) !== key);
  saveToStorage();
}

function checkNewCourseConflict(newCourse){
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

export function toggleSelected(key, onConflict){
  const course = state.savedCourses.find(c=>denseKey(c)===key);
  if (!course) return;

  if (isSelected(key)){
    state.selectedCourses = state.selectedCourses.filter(c=>denseKey(c)!==key);
    saveToStorage();
    return { success: true };
  }

  const conflicts = checkNewCourseConflict(course);
  if (conflicts.length){
    return { success: false, conflicts };
  }

  state.selectedCourses.push(course);
  saveToStorage();
  return { success: true };
}
