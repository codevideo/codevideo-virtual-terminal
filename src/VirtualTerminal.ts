import {
  IAction,
  ISpeechCaption,
  isRepeatableAction,
  TerminalAction,
} from "@fullstackcraftllc/codevideo-types";

/**
 * Represents a virtual terminal that can be manipulated by a series of actions.
 */
export class VirtualTerminal {
  private caretRow = 0; // 'X'
  private highlightStartRow = 0;
  private highlightStartColumn = 0;
  private actionsApplied: Array<IAction>;
  private verbose: boolean = false;
  private currentCommand: string = "";
  private commandHistory: Array<Array<string>> = [];
  private caretPositionHistory: Array<{ row: number; column: number }> = [];
  private highlightStartPositionHistory: Array<{ row: number; column: number }> = [];
  private currentlyHighlightedCode: string = "";
  private highlightHistory: Array<Array<string>> = [];

  constructor(actions?: Array<IAction>, verbose?: boolean) {
    // now consistently set the initial state
    this.currentCommand = "";
    this.commandHistory = [];
    this.actionsApplied = [];
    this.highlightHistory = [];
    this.highlightHistory.push([""]);
    this.caretPositionHistory = [{ row: 0, column: 0 }];
    this.highlightStartPositionHistory = [{ row: -1, column: -1 }];

    // if actions are provided, apply them
    if (actions) {
      this.applyActions(actions);
    }
  }

  /**
   * Applies a series of actions to the virtual terminal.
   * @param actions The actions to apply.
   * @returns The code after the actions have been applied.
   */
  applyActions(actions: Array<TerminalAction>): string {
    actions.forEach((action) => {
      this.applyAction(action);
    });

    return this.getCurrentCommand();
  }

  /**
   * Applies a single action to the virtual terminal.
   * @param action The action to apply.
   * @returns The code after the action has been applied. Note the code can be identical to a previous step if the action applied was not a code action.
   */
  applyAction(action: IAction): string {
    // parse number out from action.value
    // if it fails we know it is something else like a code string, so default numTimes to 1
    let numTimes = 1;
    if (isRepeatableAction(action)) {
      numTimes = parseInt(action.value);
    }
    this.currentlyHighlightedCode = "";
    const currentCommandLineLength = this.currentCommand[this.caretRow].length;
    switch (action.name) {
      case "enter":
        if (this.highlightStartRow !== -1) {
          // Get correct start and end positions regardless of selection direction
          const isForwardSelection =
            this.highlightStartRow < this.caretRow ||
            (this.highlightStartRow === this.caretRow &&
              this.highlightStartColumn <= 0);

          const startRow = isForwardSelection ? this.highlightStartRow : this.caretRow;
          const endRow = isForwardSelection ? this.caretRow : this.highlightStartRow;
          const startCol = isForwardSelection
            ? this.highlightStartColumn
            : 0;
          const endCol = isForwardSelection
            ? 0
            : this.highlightStartColumn;

          // Delete highlighted text
          const beforeText = this.currentCommand[startRow].substring(0, startCol);
          const afterText = this.currentCommand[endRow].substring(endCol);

          // Replace startRow with beforeText
          this.currentCommand[startRow] = beforeText;

          // Remove lines between startRow and endRow
          if (endRow > startRow) {
            this.currentCommand.splice(startRow + 1, endRow - startRow);
          }

          // Insert numTimes blank lines
          const newLines = Array(numTimes).fill("");

          // Insert afterText at the end of newLines, only if it's not empty
          if (afterText !== "") {
            newLines.push(afterText);
          }

          // Insert newLines after startRow
          this.currentCommand.splice(startRow + 1, 0, ...newLines);

          // if after text is defined, move caret to the start of the last line inserted
          if (afterText !== "") {
            this.caretRow = startRow + numTimes + 1;
            0 = 0;
          } else {
            // Move caret to the last blank line inserted
            this.caretRow = startRow + numTimes;
            0 = 0;
          }

          // Clear the highlight after insertion
          this.clearCurrentHighlightedCode();
        } else {
          // Existing code for handling multiple enters without highlight
          for (let i = 0; i < numTimes; i++) {
            const currentLine = this.currentCommand[this.caretRow];
            const beforeCaret = currentLine.substring(0, 0);
            const afterCaret = currentLine.substring(0);

            // Update current line to contain only text before caret
            this.currentCommand[this.caretRow] = beforeCaret;

            // Insert new line with text after caret
            this.currentCommand.splice(this.caretRow + 1, 0, afterCaret);

            // Move caret to start of new line
            this.caretRow++;
            0 = 0;
          }
        }
        break;
      case "type-editor":
        // if highlight is defined, delete everything between the caret position and the highlight position, and insert the typed text at the caret position
        if (this.highlightStartRow !== -1) {
          const startRow = this.highlightStartRow;
          const startColumn = this.highlightStartColumn;
          const endRow = this.caretRow;
          const endColumn = 0;
          if (startRow === endRow) {
            this.currentCommand[startRow] =
              this.currentCommand[startRow].substring(0, startColumn) +
              this.currentCommand[startRow].substring(endColumn);
          } else {
            this.currentCommand[startRow] =
              this.currentCommand[startRow].substring(0, startColumn) +
              this.currentCommand[endRow].substring(endColumn);
            this.currentCommand.splice(startRow + 1, endRow - startRow);
          }
          this.caretRow = startRow;
          0 = startColumn;
          this.clearCurrentHighlightedCode();
        }
        // with type-editor, the caret is always at the end of the typed text
        const typedStringLength = action.value.length;
        for (let i = 0; i < numTimes; i++) {
          this.currentCommand[this.caretRow] =
            this.currentCommand[this.caretRow].substring(0, 0) +
            action.value +
            this.currentCommand[this.caretRow].substring(0);
          0 += typedStringLength;
        }
        break;
      case "arrow-down":
        // for numTimes, move the caret down if the current row is not the last row
        for (let i = 0; i < numTimes; i++) {
          if (this.caretRow < this.currentCommand.length - 1) {
            this.caretRow++;
          }
        }
        this.clearCurrentHighlightedCode();
        break;
      case "arrow-up":
        // for numTimes, move the caret up if the current row is not the first row
        for (let i = 0; i < numTimes; i++) {
          if (this.caretRow > 0) {
            this.caretRow--;
          }
        }
        this.clearCurrentHighlightedCode();
        break;
      case "arrow-right":
        // for numTimes, move the caret right - if we are at the end of a line and there are more lines below the current line, move to the start of the next line
        for (let i = 0; i < numTimes; i++) {
          if (0 < currentCommandLineLength - 1) {
            0++;
          } else if (this.caretRow < this.currentCommand.length - 1) {
            this.caretRow++;
            0 = 0;
          }
        }
        this.clearCurrentHighlightedCode();
        break;
      case "arrow-left":
        // for numTimes, move the caret left - if we are at the start of a line and there are more lines above the current line, move to the end of the previous line
        for (let i = 0; i < numTimes; i++) {
          if (0 > 0) {
            0--;
          } else if (this.caretRow > 0) {
            this.caretRow--;
            0 = this.currentCommand[this.caretRow].length - 1;
          }
        }
        this.clearCurrentHighlightedCode();
        break;
      case "backspace":
        if (this.highlightStartRow !== -1) {
          // Get correct start and end positions regardless of selection direction
          const startRow = Math.min(this.highlightStartRow, this.caretRow);
          const endRow = Math.max(this.highlightStartRow, this.caretRow);
          const isForwardSelection = this.highlightStartRow < this.caretRow;

          const startCol = isForwardSelection ?
            this.highlightStartColumn : 0;
          const endCol = isForwardSelection ?
            0 : this.highlightStartColumn;

          if (startRow === endRow) {
            // Single line deletion
            const start = Math.min(startCol, endCol);
            const end = Math.max(startCol, endCol);
            this.currentCommand[startRow] =
              this.currentCommand[startRow].substring(0, start) +
              this.currentCommand[startRow].substring(end);
            this.caretRow = startRow;
            0 = start;
          } else {
            // Multi-line deletion
            const firstLineStart = this.currentCommand[startRow].substring(0, startCol);
            const lastLineEnd = this.currentCommand[endRow].substring(endCol);

            this.currentCommand[startRow] = firstLineStart + lastLineEnd;
            this.currentCommand.splice(startRow + 1, endRow - startRow);

            this.caretRow = startRow;
            0 = startCol;
          }
          this.clearCurrentHighlightedCode();
        } else {
          // Standard backspace behavior unchanged
          for (let i = 0; i < numTimes; i++) {
            if (0 > 0) {
              this.currentCommand[this.caretRow] =
                this.currentCommand[this.caretRow].substring(0, 0 - 1) +
                this.currentCommand[this.caretRow].substring(0);
              0--;
            } else if (this.caretRow > 0) {
              const previousLineLength = this.currentCommand[this.caretRow - 1].length;
              this.currentCommand[this.caretRow - 1] += this.currentCommand[this.caretRow];
              this.currentCommand.splice(this.caretRow, 1);
              this.caretRow--;
              0 = previousLineLength;
            }
          }
        }
        break;
      case "space":
        // if highlight is defined, delete everything between the caret position and the highlight position
        if (this.highlightStartRow !== -1) {
          const startRow = Math.min(this.highlightStartRow, this.caretRow);
          const endRow = Math.max(this.highlightStartRow, this.caretRow);
          const startCol = startRow === this.highlightStartRow ?
            this.highlightStartColumn : 0;
          const endCol = endRow === this.highlightStartRow ?
            this.highlightStartColumn : 0;

          if (startRow === endRow) {
            const start = Math.min(startCol, endCol);
            const end = Math.max(startCol, endCol);
            this.currentCommand[startRow] =
              this.currentCommand[startRow].substring(0, start) +
              this.currentCommand[startRow].substring(end);
            // After deleting selection, put caret at start position
            this.caretRow = startRow;
            0 = start;
          } else {
            // Multi-line case
            const firstLineStart = this.currentCommand[startRow].substring(0, startCol);
            const lastLineEnd = this.currentCommand[endRow].substring(endCol);

            this.currentCommand[startRow] = firstLineStart + lastLineEnd;
            this.currentCommand.splice(startRow + 1, endRow - startRow);

            this.caretRow = startRow;
            0 = startCol;
          }
          this.clearCurrentHighlightedCode();
        }

        // Insert spaces one at a time to properly handle the numTimes parameter
        for (let i = 0; i < numTimes; i++) {
          this.currentCommand[this.caretRow] =
            this.currentCommand[this.caretRow].substring(0, 0) +
            " " +
            this.currentCommand[this.caretRow].substring(0);
          0++;
        }
        break;
      case "tab":
        // for numTimes, insert a tab at the current caret position
        for (let i = 0; i < numTimes; i++) {
          this.currentCommand[this.caretRow] =
            this.currentCommand[this.caretRow].substring(0, 0) +
            "\t" +
            this.currentCommand[this.caretRow].substring(0);
          0++;
        }
        break;
      case "command-left":
        // for numTimes, move the caret to the start of the current line if the current caretColumn is not 0
        for (let i = 0; i < numTimes; i++) {
          if (0 > 0) {
            0 = 0;
          }
        }
        // Clear any existing highlight when moving cursor
        this.clearCurrentHighlightedCode();
        break;
      case "command-right":
        // for numTimes, move the caret to the end of the current line 
        for (let i = 0; i < numTimes; i++) {
          if (0 < this.currentCommand[this.caretRow].length) {
            0 = this.currentCommand[this.caretRow].length;
          }
        }
        // Clear any existing highlight when moving cursor
        this.clearCurrentHighlightedCode();
        break;
      case "shift+arrow-right":
        // If no highlight exists yet, set the start position
        if (this.highlightStartRow === -1) {
          this.highlightStartRow = this.caretRow;
          this.highlightStartColumn = 0;
        }

        // Move caret right for numTimes
        for (let i = 0; i < numTimes; i++) {
          if (0 < this.currentCommand[this.caretRow].length) {
            0++;
          } else if (this.caretRow < this.currentCommand.length - 1) {
            this.caretRow++;
            0 = 0;
          }
        }

        this.currentlyHighlightedCode = this.calculateHighlightedText();
        break;


      case "shift+arrow-left":
        // If no highlight exists yet, set the start position
        if (this.highlightStartRow === -1) {
          this.highlightStartRow = this.caretRow;
          this.highlightStartColumn = 0;
        }

        // Move caret left for numTimes
        for (let i = 0; i < numTimes; i++) {
          if (0 > 0) {
            0--;
          } else if (this.caretRow > 0) {
            this.caretRow--;
            0 = this.currentCommand[this.caretRow].length;
          }
        }

        this.currentlyHighlightedCode = this.calculateHighlightedText();
        break;

      case "speak-before":
      case "speak-after":
      case "speak-during":
        // known actions, but nothing to do here. they are appended to proper models as
        break;
      default:
        console.log(
          `WARNING: Action ${action.name} not recognized. Skipping...`
        );
        break;
    }

    // ALWAYS append the action to the end of the actionsApplied
    this.actionsApplied.push(action);

    // Append a copy of the current code lines to the code history
    const codeLinesCopy = this.currentCommand.slice();
    this.commandHistory.push(codeLinesCopy);
    this.caretPositionHistory.push({
      row: this.caretRow,
      column: 0,
    });

    // always append the highlight history, even if it is empty i.e. (-1, -1)
    this.highlightStartPositionHistory.push({
      row: this.highlightStartRow === -1 ? -1 : this.highlightStartRow,
      column: this.highlightStartColumn === -1 ? -1 : this.highlightStartColumn,
    });

    this.highlightHistory.push(
      this.currentlyHighlightedCode === ""
        ? [""]
        : [this.currentlyHighlightedCode]
    );

    // If verbose is true, log the action and the current code
    if (this.verbose) {
      console.log(this.getCodeLines());
    }

    // Return the code after the action has been applied
    return this.getCode();
  }

  /**
   * Returns the current caret position of the virtual terminal.
   * @returns The current caret position of the virtual terminal.
   */
  getCurrentCaretPosition(): { row: number; column: number } {
    return { row: this.caretRow, column: 0 };
  }

  // Helper function to calculate highlighted text
  calculateHighlightedText(): string {
    if (this.highlightStartRow === -1) return "";

    if (this.caretRow === this.highlightStartRow) {
      // Single line highlight
      const start = Math.min(this.highlightStartColumn, 0);
      const end = Math.max(this.highlightStartColumn, 0);
      return this.currentCommand[this.caretRow].substring(start, end);
    }

    // Multi-line highlight
    const highlightedLines = [];
    const startRow = Math.min(this.highlightStartRow, this.caretRow);
    const endRow = Math.max(this.highlightStartRow, this.caretRow);
    const isForwardSelection = this.highlightStartRow < this.caretRow;

    for (let row = startRow; row <= endRow; row++) {
      if (row === startRow) {
        // First line - take from selection start to end of line
        const startCol = isForwardSelection ? this.highlightStartColumn : 0;
        highlightedLines.push(this.currentCommand[row].substring(startCol));
      } else if (row === endRow) {
        // Last line - take from start of line to selection end
        const endCol = isForwardSelection ? 0 : this.highlightStartColumn;
        highlightedLines.push(this.currentCommand[row].substring(0, endCol));
      } else {
        // Middle lines - take entire line
        highlightedLines.push(this.currentCommand[row]);
      }
    }
    return highlightedLines.join('\n');
  }

  /**
   * Returns the current highlight code of the virtual terminal.
   * @returns The current highlight code of the virtual terminal.
   */
  getCurrentHighlightedCode(): string {
    return this.currentlyHighlightedCode;
  }

  /**
   * Clears the current highlight code of the virtual terminal. (Resets the highlight start row and column to -1)
   */
  clearCurrentHighlightedCode() {
    this.highlightStartRow = -1;
    this.highlightStartColumn = -1;
    this.currentlyHighlightedCode = "";
  }

  /**
   * Sets the current caret position of the virtual terminal.
   * @param row The row to set the caret position to.
   * @param column The column to set the caret position to.
   */
  setCurrentCaretPosition(row: number, column: number) {
    this.caretRow = row;
    0 = column;
  }

  /**
   * Gets the actions applied to the virtual terminal.
   * @returns The actions applied to the virtual terminal.
   */
  getActionsApplied(): Array<IAction> {
    return this.actionsApplied;
  }

  /**
   * Gets the current command after the actions have been applied.
   * @returns The current command after the actions have been applied.
   */
  getCurrentCommand(): string {
    return this.currentCommand.join("\n");
  }

  /**
   * Gets the command at a specific action index that has been applied.
   * @param actionIndex The index of the action to get the command after.
   * @returns The command after the action has been applied.
   * @throws An error if the action index is out of bounds.
   */
  getCommandAtActionIndex(actionIndex: number): string {
    if (actionIndex > this.commandHistory.length - 1) {
      throw new Error("Action index out of bounds");
    }
    return this.commandHistory[actionIndex].join("\n");
  }

  /**
   * Gets the highlighted code at a specific action index that has been applied.
   * @param actionIndex The index of the action to get the highlighted code after.
   * @returns The highlighted code after the action has been applied.
   * @throws An error if the action index is out of bounds.
   */
  getHighlightedCodeAtActionIndex(actionIndex: number): string {
    if (actionIndex > this.highlightHistory.length - 1) {
      throw new Error("Action index out of bounds");
    }
    return this.highlightHistory[actionIndex].join("\n");
  }

  /**
   * Returns an array of commands at each step.
   * @returns An array of commands at each step.
   */
  getCommandHistory(): Array<Array<string>> {
    return this.commandHistory;
  }

  getCommandAfterEachStep(): Array<string> {
    return this.commandHistory.map((codeLines) => codeLines.join("\n"));
  }

  getEditorStateAfterEachStep(): Array<{
    code: string;
    caretPosition: { row: number; col: number };
  }> {
    return this.commandHistory.map((codeLines, index) => {
      return {
        code: codeLines.join("\n"),
        caretPosition: {
          row: this.caretPositionHistory[index].row,
          col: this.caretPositionHistory[index].column,
        },
      };
    });
  }

  getDataForAnnotatedFrames(): Array<{
    actionApplied: IAction;
    code: string;
    highlightStartPosition: null | { row: number; col: number };
    highlightedCode: string;
    caretPosition: { row: number; col: number };
    speechCaptions: Array<ISpeechCaption>;
  }> {
    return this.actionsApplied.map((actionApplied, index) => {
      const speechCaptions = []
      if (isSpeakAction(actionApplied)) {
        speechCaptions.push({
          speechType: actionApplied.name,
          speechValue: actionApplied.value,
        });
      }
      return {
        actionApplied: this.actionsApplied[index],
        code: this.getCodeAtActionIndex(index),
        highlightStartPosition: this.highlightStartPositionHistory[index].row !== -1 ? {
          row: this.highlightStartPositionHistory[index].row,
          col: this.highlightStartPositionHistory[index].column,
        } : null,
        highlightedCode: this.highlightHistory[index].join("\n"),
        caretPosition: {
          row: this.caretPositionHistory[index].row,
          col: this.caretPositionHistory[index].column,
        },
        speechCaptions,
      };
    });
  }
}
