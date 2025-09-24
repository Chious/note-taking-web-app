# TODO / Bug Tracking

## 🐛 Known Bugs

### Double Editor Issue

**Status**: Open  
**Priority**: Medium  
**Component**: `src/components/editor.tsx`, `src/components/note-editor.tsx`  
**Description**: When creating a new note or switching between notes, two Editor.js instances are rendered simultaneously, causing visual duplication and potential functionality issues.

**Symptoms**:

- Two editor instances visible in the DOM
- Both editors have the same `codex-editor` class structure
- Issue occurs when switching from existing note to new note creation
- Issue persists even after page refresh (F5)

**Root Cause Analysis**:

- React Strict Mode causing double mounting in development
- Editor component not properly cleaning up previous instances
- Race conditions in editor initialization
- Missing proper key prop or instance management

**Attempted Fixes**:

1. ✅ Added key prop to force re-mounting: `key={note?.id || 'new-note'}`
2. ✅ Enhanced editor instance detection
3. ✅ Improved cleanup with proper destroy calls
4. ✅ Added debug logging for troubleshooting
5. ❌ All fixes reverted by user - issue persists

**Next Steps**:

- [ ] Investigate Editor.js lifecycle management more deeply
- [ ] Consider using a different approach for editor instance management
- [ ] Test with React Strict Mode disabled to isolate the issue
- [ ] Consider using a ref-based approach instead of useEffect
- [ ] Look into Editor.js specific initialization patterns

**Related Files**:

- `src/components/editor.tsx` - Main editor component
- `src/components/note-editor.tsx` - Parent component using editor
- `src/hooks/use-notes.ts` - Data management hooks

**Environment**:

- React 18 with Strict Mode enabled
- Editor.js latest version
- Next.js 14
- Development environment

---

## 📋 Future Improvements

### Performance

- [ ] Optimize editor loading times
- [ ] Implement lazy loading for editor tools

### UX/UI

- [ ] Add better loading states for editor
- [ ] Improve error handling for editor failures

### Code Quality

- [ ] Reduce useEffect complexity in editor components
- [ ] Implement better TypeScript types for Editor.js integration
