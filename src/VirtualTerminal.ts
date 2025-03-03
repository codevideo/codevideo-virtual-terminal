import {
  isRepeatableAction,
  TerminalAction,
} from "@fullstackcraftllc/codevideo-types";

/**
 * Represents a virtual terminal that can be interacted with
 * via a series of actions. The terminal maintains a command
 * history and a current command that can be modified.
 * The terminal also maintains a caret position that can be
 * moved around the current command.
 * Finally, the terminal is also responsible for it's entire own buffer, for easy rendering in UIs.
 */
export class VirtualTerminal {
  private presentWorkingDirectory = "~";
  private prompt = `[codevideo.studio] [${this.presentWorkingDirectory}] /> `;

  private caretPosition = 0;
  private currentCommand = "";
  private commandHistory: string[] = [];
  private historyIndex = -1;
  private actionsApplied: TerminalAction[] = [];
  private verbose = false;
  private bufferLines: string[] = [];

  constructor(initialCommand?: string, actions?: TerminalAction[], verbose?: boolean) {
    this.bufferLines.push(this.prompt);
    if (initialCommand) {
      this.currentCommand = initialCommand;
      this.caretPosition = initialCommand.length;
      this.bufferLines[0] += initialCommand;
    }
    if (actions) {
      this.applyActions(actions);
    }
    this.verbose = verbose || false;
  }

  /**
   * Applies a series of actions to the virtual terminal
   * @param actions The actions to apply
   * @returns The current command after applying the actions
   */
  applyActions(actions: TerminalAction[]): string {
    actions.forEach((action) => {
      this.applyAction(action);
    });
    return this.getCurrentCommand();
  }

  /**
   * Applies a single action to the virtual terminal
   * @param action The action to apply
   * @returns The current command after applying the action
   */
  applyAction(action: TerminalAction): string {
    let numTimes = 1;
    if (isRepeatableAction(action)) {
      numTimes = parseInt(action.value);
    }

    switch (action.name) {
      // we also need a way to programmatically set the output of a command. that is done here:
      case "terminal-set-output":
        this.addLinesToBufferLines(action.value);
        break;
      case "terminal-set-prompt":
        this.prompt = action.value;
        break;
      case "terminal-set-present-working-directory":
        this.setPresentWorkingDirectory(action.value);
        break;
      case "terminal-type":
        // Insert text at current caret position
        this.currentCommand =
          this.currentCommand.slice(0, this.caretPosition) +
          action.value +
          this.currentCommand.slice(this.caretPosition);
        this.caretPosition += action.value.length;
        // update current line in buffer
        this.bufferLines[this.bufferLines.length - 1] = this.prompt + this.currentCommand;
        break;

      case "terminal-enter":
        // update buffer with the executed command
        // this.bufferLines.push(this.prompt + this.currentCommand);

        // update command history and index
        if (this.currentCommand.trim()) {
          this.commandHistory.push(this.currentCommand);
        }
        this.historyIndex = this.commandHistory.length;

        // reset current command and caret position
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

      // is this like a delete key? we don't have the action name for it...
      // case "terminal-delete":
      //   for (let i = 0; i < numTimes; i++) {
      //     if (this.caretPosition < this.currentCommand.length) {
      //       this.currentCommand = 
      //         this.currentCommand.slice(0, this.caretPosition) + 
      //         this.currentCommand.slice(this.caretPosition + 1);
      //     }
      //   }
      //   break;

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

  /**
   * Returns the current state of the virtual terminal
   * @returns The current state of the virtual terminal
   */
  getCurrentCommand(): string {
    return this.currentCommand;
  }

  /**
   * Returns the command history of the virtual terminal
   * @returns The command history of the virtual terminal
   */
  getCommandHistory(): string[] {
    return this.commandHistory;
  }

  /**
   * Returns the current caret position of the virtual terminal
   * @returns The current caret position of the virtual terminal
   */
  getCurrentCaretPosition(): number {
    return this.caretPosition;
  }

  /**
   * Returns the actions applied to the virtual terminal
   * @returns The actions applied to the virtual terminal
   */
  getActionsApplied(): TerminalAction[] {
    return this.actionsApplied;
  }

  /**
   * Returns the prompt of the virtual terminal
   * @returns The prompt of the virtual terminal
   */
  getPrompt(): string {
    return this.prompt;
  }

  /**
   * Returns the present working directory of the virtual terminal
   * @returns The present working directory of the virtual
   */
  getPresentWorkingDirectory(): string {
    return this.presentWorkingDirectory;
  }

  /**
   * Returns the buffer of the virtual terminal
   * @returns The buffer of the virtual terminal
   */
  getBuffer(): string[] {
    return this.bufferLines;
  }

  /**
  * Sets the verbose mode for the virtual terminal
  * @param verbose Whether to enable verbose
  */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  private addLinesToBufferLines(content: string): void {
    // split content by newlines and add each line to the buffer
    const lines = content.split("\n");
    lines.forEach((line) => {
      this.bufferLines.push(line);
    });
  }

  private setPresentWorkingDirectory(presentWorkingDirectory: string): void {
    this.presentWorkingDirectory = presentWorkingDirectory;
    this.prompt = `[codevideo.studio] [${this.presentWorkingDirectory}] /> `;
  }
}