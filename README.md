# @fullstackcraft/codevideo-virtual-terminal

![NPM Version](https://img.shields.io/npm/v/@fullstackcraftllc/codevideo-virtual-terminal)

`codevideo-virtual-terminal` is a TypeScript class that simulates a terminal with features like cursor navigation, text insertion, and line manipulation. It provides a flexible interface for applying various editing actions such as typing, moving the cursor, and executing commands. This lightweight and versatile library is ideal for building educational tools, code playgrounds, and interactive coding environments within web applications.

This library heavily relies on the types from [codevideo-types](https://github.com/codevideo/codevideo-types)

## Example Usage

```typescript
import { VirtualTerminal } from '@fullstackcraftllc/virtual-terminal';

// Initialize a VirtualTerminal instance with initial existing command history
const initialCommandHistory = [
  "cd my-new-project",
  "npm init -y",
  "touch index.js",
  "echo 'console.log(\"Hello, world!\")' > index.js",
  "node index.js"
];
const virtualTerminal = new VirtualTerminal(initialCommandHistory);

// Apply terminal editing actions
virtualTerminal.applyActions([
  { name: 'arrow-up', value: '1' },  // Go to the previous command
  { name: 'arrow-down', value: '1' }, // Go to the next command
  { name: 'type-terminal', value: 'npm install' }, // Type 'npm install'
  { name: 'enter-terminal', value: '1' }, // Execute the command, if any
]);

// Get the final code and actions applied
const finalTerminalState = virtualTerminal.getState();
const actionsApplied = virtualTerminal.getActionsApplied();

// Log the final code and actions applied
console.log('Final terminal state:');
console.log(finalTerminalState);
console.log('Actions applied:');
console.log(actionsApplied);
```

## Available Methods

### `applyAction(action: IAction): void`

Apply a single action to the code.

### `applyActions(actions: Array<IAction>): string`

Apply a series of actions to the code. Returns the final code as a string.

### `getCurrentCode(): Array<string>`

Get the current code lines.

### `getCurrentCaretPosition(): { row: number; column: number }`

Get the current caret position.

### `getActionsApplied(): Array<IAction>`

Get the actions that were applied to the code.

### `getCode(): string`

Get the code as a single string.

### `getCodeLinesHistory(): Array<Array<string>>`

Get the history of code lines.

### `getCodeAfterEachStep(): Array<string>`

Get the code after each step.

### `getEditorStateAfterEachStep(): Array<{ code: string; caretPosition: { row: number; col: number } }>`

Get the editor state after each step.

### `getDataForAnnotatedFrames(): Array<{ actionApplied: IAction; code: string; caretPosition: { row: number; col: number }; speechCaptions: Array<ISpeechCaption>; }>`

Get data for annotated frames.

## Why?

Why do we need a seemingly useless class? This library, along with the family of `virtual` components, are used in orchestration to create the `codevideo-virtual-ide`, a 100% time travalable, auditable, playable, and pausable IDE. This library is just a small part of a larger project to create a declarative way to build, edit, and generate step by step educational video software courses.

See more at [codevideo.io](https://codevideo.io)