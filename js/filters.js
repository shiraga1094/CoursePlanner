// Course filtering logic
// Handles search, department, time slot, and other filters

import { state } from './state.js';
import { $, deptMatchesCategory } from './utils.js';
import { denseKey } from './courseData.js';
import { parseTimeToSchedule, placeKey } from './timeParser.js';

// Check if course is in saved list
export function isSaved(key){
  return state.savedCourses.some(c=>denseKey(c) === key);
}

// Check if course is in selected (schedule) list
export function isSelected(key){
  return state.selectedCourses.some(c=>denseKey(c) === key);
}

// Get filtered courses based on all active filters
// Applies keyword search, department, core, day, location, mode, and time slot filters
export function getFilteredCourses(strictOverride){
  const kw = $("searchInput").value.trim().toLowerCase();
  const dept = $("filterDept").value || state.activeDept || "";
  const core = $("filterCore").value;
  const day = $("filterDay").value;
  const loc = $("filterLocation") ? $("filterLocation").value || "" : "";
  const mode = $("filterMode").value;

  return state.courses.filter(c=>{
    if (dept){
      if (dept.startsWith("__")){
        if (dept === "__COMMON__" && !deptMatchesCategory(c.dept, 'COMMON')) return false;
        if (dept === "__SPORTS__" && !deptMatchesCategory(c.dept, 'SPORTS')) return false;
        if (dept === "__DEFENSE__" && !deptMatchesCategory(c.dept, 'DEFENSE')) return false;
        if (dept === "__EXCHANGE__" && !deptMatchesCategory(c.dept, 'EXCHANGE')) return false;
        if (dept.startsWith("__PROGRAM__")) {
          const programName = dept.replace("__PROGRAM__", "");
          if (!c.programs || !c.programs.includes(programName)) return false;
        }
      } else {
        if (c.dept !== dept) return false;
      }
    }
    if (loc){
      const coursePlace = placeKey(c.location);
      if (coursePlace !== loc) return false;
    }
    if (core && c.core !== core) return false;
    if (day){
      const times = parseTimeToSchedule(c.time);
      if (!times || times.length === 0) return false;
      const hasDay = times.some(t => t.day === day);
      if (!hasDay) return false;
    }

    if (kw){
      const hay = `${c.name} ${c.code} ${c.teacher} ${c.dept}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }

    const k = denseKey(c);
    if (mode === "saved" && !isSaved(k)) return false;
    if (mode === "selected" && !isSelected(k)) return false;

    // Time slot filter: check if course matches selected time slots
    if (state.selectedSlotKeys.size > 0){
      const times = parseTimeToSchedule(c.time);
      if (!times || times.length === 0) return false;
      
      let hasMatch = false;
      const effectiveStrict = (typeof strictOverride !== 'undefined') ? strictOverride : state.strictSlotSearch;
      
      // Check each time segment for slot matches
      for (const info of times) {
        const courseKeys = (info.slots || []).map(s => `${info.day}-${s}`);
        if (courseKeys.length === 0) continue;
        
        if (effectiveStrict){
          if (courseKeys.every(k2 => state.selectedSlotKeys.has(k2))) {
            hasMatch = true;
            break;
          }
        } else {
          if (courseKeys.some(k2 => state.selectedSlotKeys.has(k2))) {
            hasMatch = true;
            break;
          }
        }
      }
      
      if (!hasMatch) return false;
    }

    return true;
  });
}
