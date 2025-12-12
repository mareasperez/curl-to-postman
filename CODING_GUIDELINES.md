# Curl to Postman - Coding Guidelines

## 📋 Table of Contents
- [File Organization](#file-organization)
- [Component Structure](#component-structure)
- [Testing](#testing)
- [State Management](#state-management)
- [Styling](#styling)
- [General Rules](#general-rules)

---

## 📁 File Organization

### Models/Interfaces
**RULE**: All models and interfaces MUST be in separate files in `src/app/models/`

✅ **CORRECT**:
```
src/app/models/
  ├── conversion-state.model.ts
  ├── ui-state.model.ts
  ├── editable-state.model.ts
  └── index.ts (re-exports)
```

❌ **INCORRECT**:
```typescript
// DON'T define interfaces in services or components
export class MyService {
  // ❌ NO
  interface MyModel { }
}
```

### Component Files
**RULE**: Each component MUST have separate files for template and styles

✅ **CORRECT Structure**:
```
src/app/components/my-component/
  ├── my-component.component.ts
  ├── my-component.component.html
  ├── my-component.component.css
  └── my-component.component.spec.ts
```

❌ **INCORRECT**:
```typescript
@Component({
  template: `<div>...</div>`,  // ❌ NO inline templates
  styles: [`...`]              // ❌ NO inline styles
})
```

---

## 🧩 Component Structure

### Template Files (.html)
- Use separate `.html` files for ALL components
- Keep templates clean and readable
- Use Angular control flow (`@if`, `@for`, `@switch`)
- Avoid complex logic in templates

### Style Files (.css)
- Use separate `.css` files for ALL components
- Use CSS custom properties (variables) for theming
- Follow BEM naming convention when applicable
- Keep styles scoped to component

### TypeScript Files (.ts)
```typescript
@Component({
  selector: 'app-my-component',
  imports: [CommonModule, ...],
  templateUrl: './my-component.component.html',  // ✅ External template
  styleUrl: './my-component.component.css'       // ✅ External styles
})
export class MyComponent {
  // Inject services
  private myService = inject(MyService);
  
  // Signals for reactive state
  mySignal = signal('value');
  
  // Computed values
  myComputed = computed(() => this.mySignal() + '!');
  
  // Methods
  onAction() { }
}
```

---

## 🧪 Testing

### Framework
- Use **Vitest** (NOT Jasmine)
- All test files: `*.spec.ts`

### Test Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MyService', () => {
  let service: MyService;
  
  beforeEach(() => {
    // Setup
  });
  
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Mocking
```typescript
// Use vi.fn() for mocks (NOT jasmine.createSpyObj)
const mockService = {
  method: vi.fn()
};

mockService.method.mockReturnValue('value');
```

---

## 🔄 State Management

### Centralized State
- Use `AppStateService` for global state
- Use Angular signals for reactivity
- Keep state immutable

### Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class AppStateService {
  // Private writable signal
  private _state = signal<MyState>(initialState);
  
  // Public readonly signal
  readonly state = this._state.asReadonly();
  
  // Computed values
  readonly derivedValue = computed(() => this.state().someProperty);
  
  // Actions (methods that update state)
  updateState(newValue: Partial<MyState>) {
    this._state.update(current => ({ ...current, ...newValue }));
  }
}
```

### Component Usage
```typescript
export class MyComponent {
  private appState = inject(AppStateService);
  
  // Read from state
  myValue = computed(() => this.appState.state().value);
  
  // Update state
  onChange() {
    this.appState.updateState({ value: 'new' });
  }
}
```

---

## 🎨 Styling

### CSS Variables
Use CSS custom properties for theming:
```css
:root {
  --primary-color: #007bff;
  --border-color: #dee2e6;
  --border-radius: 8px;
}

.my-component {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}
```

### Naming Convention
```css
/* Component-level styles */
.component-name { }
.component-name__element { }
.component-name--modifier { }

/* Utility classes */
.u-margin-top { }
.u-text-center { }
```

---

## 📏 General Rules

### TypeScript
1. **Use strict typing** - Avoid `any` when possible
2. **NO `any` types** - Always use specific types or `unknown` if type is truly unknown
3. **Use interfaces from models** - Import from `models/` folder
4. **Use signals** - For reactive state
5. **Use inject()** - For dependency injection (not constructor injection)

### Examples

✅ **CORRECT**:
```typescript
// Use specific types
interface User {
  id: number;
  name: string;
}

// Use unknown for truly unknown types
function parseJson(json: string): unknown {
  return JSON.parse(json);
}

// Type guard for unknown
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 
         'id' in value && 'name' in value;
}
```

❌ **INCORRECT**:
```typescript
// ❌ NO - Don't use any
function getData(): any { }
const data: any = { };

// ❌ NO - Untyped parameters
function process(data) { }
```


### Code Organization
1. **One responsibility per file**
2. **Models in separate files** - Always in `models/` folder
3. **Services are stateless** - State goes in `AppStateService`
4. **Components are dumb** - Logic in services, not components

### Imports
```typescript
// ✅ CORRECT - Import from index
import { MyModel, OtherModel } from '@/models';

// ❌ INCORRECT - Direct file imports
import { MyModel } from '@/models/my-model.model';
```

### Imports
```typescript
// ✅ CORRECT - Use aliases for cleaner imports
import { MyModel } from '@models/my-model.model';
import { MyService } from '@services/my.service';
import { MyComponent } from '@components/my/my.component';

// ❌ INCORRECT - Relative paths
import { MyModel } from '../../../models/my-model.model';
import { MyService } from '../../services/my.service';
```

**Available Aliases:**
- `@models/*` → `src/app/models/*`
- `@services/*` → `src/app/services/*`
- `@components/*` → `src/app/components/*`

### File Naming
- Components: `my-component.component.ts`
- Services: `my-service.service.ts`
- Models: `my-model.model.ts`
- Tests: `*.spec.ts`

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T
```typescript
// DON'T define models in services
export class MyService {
  interface MyModel { }  // ❌
}

// DON'T use inline templates/styles
@Component({
  template: `...`,  // ❌
  styles: [`...`]   // ❌
})

// DON'T use Jasmine syntax
jasmine.createSpyObj()  // ❌

// DON'T put logic in components
export class MyComponent {
  complexBusinessLogic() { }  // ❌ Move to service
}
```

### ✅ DO
```typescript
// DO import models from models folder
import { MyModel } from '@/models';

// DO use external files
@Component({
  templateUrl: './my.component.html',  // ✅
  styleUrl: './my.component.css'       // ✅
})

// DO use Vitest
import { vi } from 'vitest';  // ✅

// DO keep components simple
export class MyComponent {
  private service = inject(MyService);
  
  onClick() {
    this.service.doWork();  // ✅ Delegate to service
  }
}
```

---

## 📦 Project Structure

```
src/app/
├── components/          # UI Components
│   ├── header/
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   ├── header.component.css
│   │   └── header.component.spec.ts
│   └── ...
├── models/             # ALL interfaces/types
│   ├── conversion-state.model.ts
│   ├── ui-state.model.ts
│   └── index.ts
├── services/           # Business logic
│   ├── app-state.service.ts
│   ├── conversion.service.ts
│   └── ...
└── app.ts             # Root component (minimal)
```

---

## 🔍 Code Review Checklist

Before submitting code, verify:

- [ ] All models are in separate files in `models/`
- [ ] Components use external `.html` and `.css` files
- [ ] Tests use Vitest (not Jasmine)
- [ ] State management uses signals
- [ ] No business logic in components
- [ ] Proper TypeScript typing (no `any`)
- [ ] Imports from `models/index.ts`
- [ ] File naming follows conventions

---

## 📚 References

- [Angular Signals](https://angular.dev/guide/signals)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
