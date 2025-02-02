import {
  isRepeatableAction,
  TerminalAction,
} from "@fullstackcraftllc/codevideo-types";

export class VirtualTerminal {
  private caretPosition = 0;
  private currentCommand = "";
  private commandHistory: string[] = [];
  private historyIndex = -1;
  private actionsApplied: TerminalAction[] = [];
  private verbose = false;

  constructor(initialCommand?: string, actions?: TerminalAction[], verbose?: boolean) {
    if (initialCommand) {
      this.currentCommand = initialCommand;
      this.caretPosition = initialCommand.length;
    }
    if (actions) {
      this.applyActions(actions);
    }
    this.verbose = verbose || false;
  }

  applyActions(actions: TerminalAction[]): string {
    actions.forEach((action) => {
      this.applyAction(action);
    });
    return this.getCurrentCommand();
  }

  applyAction(action: TerminalAction): string {
    let numTimes = 1;
    if (isRepeatableAction(action)) {
      numTimes = parseInt(action.value);
    }

    switch (action.name) {
      case "terminal-type":
        // Insert text at current caret position
        this.currentCommand = 
          this.currentCommand.slice(0, this.caretPosition) + 
          action.value + 
          this.currentCommand.slice(this.caretPosition);
        this.caretPosition += action.value.length;
        break;

      case "terminal-enter":
        if (this.currentCommand.trim()) {
          this.commandHistory.push(this.currentCommand);
        }
        this.historyIndex = this.commandHistory.length;
        this.currentCommand = "";
        this.caretPosition = 0;
        break;

      case "terminal-arrow-up":
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.currentCommand = this.commandHistory[this.historyIndex];
          this.caretPosition = this.currentCommand.length;
        }
        break;

      case "terminal-arrow-down":
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.currentCommand = this.commandHistory[this.historyIndex];
          this.caretPosition = this.currentCommand.length;
        } else if (this.historyIndex === this.commandHistory.length - 1) {
          this.historyIndex++;
          this.currentCommand = "";
          this.caretPosition = 0;
        }
        break;

      case "terminal-arrow-left":
        for (let i = 0; i < numTimes && this.caretPosition > 0; i++) {
          this.caretPosition--;
        }
        break;

      case "terminal-arrow-right":
        for (let i = 0; i < numTimes && this.caretPosition < this.currentCommand.length; i++) {
          this.caretPosition++;
        }
        break;

      case "terminal-backspace":
        for (let i = 0; i < numTimes; i++) {
          if (this.caretPosition > 0) {
            this.currentCommand = 
              this.currentCommand.slice(0, this.caretPosition - 1) + 
              this.currentCommand.slice(this.caretPosition);
            this.caretPosition--;
          }
        }
        break;

      case "terminal-backspace":
        for (let i = 0; i < numTimes; i++) {
          if (this.caretPosition < this.currentCommand.length) {
            this.currentCommand = 
              this.currentCommand.slice(0, this.caretPosition) + 
              this.currentCommand.slice(this.caretPosition + 1);
          }
        }
        break;

      case "terminal-space":
        this.currentCommand = 
          this.currentCommand.slice(0, this.caretPosition) + 
          " " + 
          this.currentCommand.slice(this.caretPosition);
        this.caretPosition++;
        break;

      case "terminal-tab":
        this.currentCommand = 
          this.currentCommand.slice(0, this.caretPosition) + 
          "\t" + 
          this.currentCommand.slice(this.caretPosition);
        this.caretPosition++;
        break;

      case "terminal-command-left":
        this.caretPosition = 0;
        break;

      case "terminal-command-right":
        this.caretPosition = this.currentCommand.length;
        break;

      case "terminal-command-c":
        // Copy functionality would go here
        break;

      case "terminal-command-v":
        // Paste functionality would go here
        break;
    }

    this.actionsApplied.push(action);

    if (this.verbose) {
      console.log(`Action: ${action.name}, Command: ${this.currentCommand}, Caret: ${this.caretPosition}`);
    }

    return this.getCurrentCommand();
  }

  getCurrentCommand(): string {
    return this.currentCommand;
  }

  getCommandHistory(): string[] {
    return this.commandHistory;
  }

  getCurrentCaretPosition(): number {
    return this.caretPosition;
  }

  getActionsApplied(): TerminalAction[] {
    return this.actionsApplied;
  }
}