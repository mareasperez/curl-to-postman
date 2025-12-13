# 🚀 Improvement Roadmap - cURL to Postman Converter

> **Status**: Planning  
> **Last updated**: 2025-12-12

This document tracks the planned architectural improvements and features for the project.

---

## 📋 Improvement Index

- [1. Complete Tailwind CSS Migration](#1-complete-tailwind-css-migration)
- [2. Reusable Component System](#2-reusable-component-system)
- [3. Multi-Format Input](#3-multi-format-input)
- [4. Provider Pattern for State Management](#4-provider-pattern-for-state-management)
- [5. Snapshot System (Undo/Redo)](#5-snapshot-system-undoredo)
- [6. LocalStorage Persistence](#6-localstorage-persistence)
- [7. Architecture Reorganization](#7-architecture-reorganization)

---

## 1. Complete Tailwind CSS Migration

**Priority**: 🔥 High  
**Status**: ⏳ Pending  
**Estimated effort**: 2-3 days

### Objective
Remove unnecessary custom CSS and migrate completely to Tailwind CSS v4.

### Tasks
- [ ] Audit `styles.css` (866 lines) and identify styles to migrate
- [ ] Convert `.btn`, `.btn-primary`, `.btn-secondary` classes to Tailwind
- [ ] Convert `.card`, `.modal`, `.tabs` classes to Tailwind
- [ ] Keep only complex animations in custom CSS
- [ ] Update all components to use Tailwind classes
- [ ] Remove duplicate CSS

### Expected Benefits
- 📉 **-60% CSS bundle size**
- ⚡ **Automatic tree-shaking**
- 🎨 **Total design consistency**
- 🚀 **Faster development**

### References
- See: `docs/architecture_analysis.md` - Section 1

---

## 2. Reusable Component System

**Priority**: 🔥 High  
**Status**: ⏳ Pending  
**Estimated effort**: 4-5 days

### Objective
Create a UI component library to eliminate code duplication.

### Components to Create

#### Phase 1: Base Components (2 days)
- [ ] `ButtonComponent` - Buttons with variants (primary, secondary, info, danger, ghost)
- [ ] `InputComponent` - Inputs with validation and states
- [ ] `TextareaComponent` - Textarea with monospace and auto-resize
- [ ] `BadgeComponent` - Badges for HTTP methods and states
- [ ] `CardComponent` - Cards with variants and hover effects

#### Phase 2: Composite Components (2 days)
- [ ] `ModalComponent` + subcomponents (header, body, footer)
- [ ] `TabsComponent` + `TabComponent`
- [ ] `KeyValueEditorComponent` - Headers/params editor
- [ ] `FileInputComponent` - Drag & drop file upload

#### Phase 3: Migration (1 day)
- [ ] Migrate `input-section` to use new components
- [ ] Migrate `output-section` to use new components
- [ ] Migrate `request-details-modal` to use new components
- [ ] Remove duplicate code

### Expected Benefits
- 📉 **-70% code** in templates
- 🎯 **Total UI/UX consistency**
- 🧪 **Easier testing**
- 🔧 **5x easier maintenance**

### References
- See: `docs/component_reusability_guide.md` - Sections 1-7

---

## 3. Multi-Format Input

**Priority**: 🟡 Medium  
**Status**: ⏳ Pending  
**Estimated effort**: 3-4 days

### Objective
Support multiple input formats beyond cURL.

### Formats to Support
- [x] cURL commands (current)
- [ ] Postman Collection v2.1
- [ ] Postman Collection v1.0
- [ ] Insomnia exports
- [ ] OpenAPI 3.0
- [ ] Swagger 2.0
- [ ] HAR files (HTTP Archive)
- [ ] Thunder Client
- [ ] VS Code REST Client

### Tasks

#### Phase 1: Infrastructure (1 day)
- [ ] Create `FormatDetectorService` - Automatic format detection
- [ ] Create `ImportService` - File import handling
- [ ] Create `InputFormat` and `InputSource` models

#### Phase 2: Components (1 day)
- [ ] Create `FileInputComponent` with drag & drop
- [ ] Add tabs to input section (Text, File, URL)
- [ ] Implement imported file preview

#### Phase 3: Converters (2 days)
- [ ] Implement `PostmanV2Converter`
- [ ] Implement `InsomniaConverter`
- [ ] Implement `OpenAPIConverter`
- [ ] Implement `HARConverter`

### Expected Benefits
- 🎯 **Bidirectional conversion** (Postman ↔ Insomnia ↔ OpenAPI)
- 📁 **Import from local files**
- 🌐 **Import from remote URLs**
- 🔄 **Intuitive drag & drop**

### References
- See: `docs/component_reusability_guide.md` - "Flexible Input" section

---

## 4. Provider Pattern for State Management

**Priority**: 🟢 Low  
**Status**: ⏳ Pending  
**Estimated effort**: 2-3 days

### Objective
Split `AppStateService` into specific providers with better separation of concerns.

### Tasks
- [ ] Create `StateProvider<T>` base class
- [ ] Create `ConversionStateProvider`
- [ ] Create `UIStateProvider`
- [ ] Create `EditableStateProvider`
- [ ] Migrate components to use specific providers
- [ ] Add unit tests

### Expected Benefits
- ✅ **Separation of concerns**
- ✅ **Easier testing**
- ✅ **Scoped state** when needed
- ✅ **More maintainable code**

### References
- See: `docs/architecture_analysis.md` - Section 2

---

## 5. Snapshot System (Undo/Redo)

**Priority**: 🟡 Medium  
**Status**: ⏳ Pending  
**Estimated effort**: 2 days

### Objective
Implement snapshot system to enable undo/redo functionality.

### Tasks
- [ ] Create `SnapshotManager<T>` class
- [ ] Integrate with state providers
- [ ] Add Undo/Redo buttons in UI
- [ ] Implement keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- [ ] Add visual indicators for changes

### Expected Benefits
- ↩️ **Functional Undo/Redo**
- 🐛 **Improved debugging** with history
- ⚡ **Performance** (structuredClone vs JSON.parse)
- 🎯 **Better UX**

### References
- See: `docs/architecture_analysis.md` - Section 3

---

## 6. LocalStorage Persistence

**Priority**: 🟡 Medium  
**Status**: ⏳ Pending  
**Estimated effort**: 1-2 days

### Objective
Automatically save state to localStorage for session recovery.

### Tasks
- [ ] Create `StorageService`
- [ ] Create `PersistenceService` with auto-save
- [ ] Implement debounce to avoid saturating localStorage
- [ ] Add data versioning for migrations
- [ ] Implement session recovery on load
- [ ] Add "Auto-saved" indicator

### Expected Benefits
- 💾 **Automatic persistence**
- 🔄 **Session recovery**
- 📦 **Versioning** for migrations
- ✅ **No lost work**

### References
- See: `docs/architecture_analysis.md` - Section 4

---

## 7. Architecture Reorganization

**Priority**: 🟢 Low  
**Status**: ⏳ Pending  
**Estimated effort**: 2-3 days

### Objective
Reorganize folder structure into feature modules.

### Proposed New Structure
```
src/app/
├── core/                    # Singleton services
│   ├── services/
│   └── providers/
├── features/                # Organized features
│   ├── conversion/
│   ├── export/
│   └── import/
├── shared/                  # Reusable components
│   ├── ui/
│   └── utils/
└── models/                  # Shared types
```

### Tasks
- [ ] Create new folder structure
- [ ] Move services to `core/`
- [ ] Organize components by feature
- [ ] Move UI components to `shared/ui/`
- [ ] Update imports throughout the app
- [ ] Update path aliases in `tsconfig.json`

### Expected Benefits
- 📁 **Clear organization**
- 🎯 **Feature separation**
- 🔍 **Easier to find code**
- 📈 **Scalability**

### References
- See: `docs/architecture_analysis.md` - Section 5

---

## 📊 Priority Summary

### 🔥 High Priority (Start first)
1. Tailwind CSS Migration
2. Reusable Component System

### 🟡 Medium Priority (After high)
3. Multi-Format Input
4. Snapshot System
5. LocalStorage Persistence

### 🟢 Low Priority (Nice to have)
6. Provider Pattern
7. Architecture Reorganization

---

## 📈 Overall Progress

```
Total tasks: 0/50+ completed
Progress: ░░░░░░░░░░ 0%
```

---

## 🔗 References

- [Architecture Analysis](./docs/architecture_analysis.md)
- [Component Reusability Guide](./docs/component_reusability_guide.md)
- [Coding Guidelines](./CODING_GUIDELINES.md)

---

## 📝 Notes

- This roadmap is flexible and can be adjusted as needed
- Estimates are approximate
- Multiple improvements can be worked on in parallel
- Prioritize based on impact vs effort

---

**Last updated**: 2025-12-12  
**Maintainer**: @MauryCL
