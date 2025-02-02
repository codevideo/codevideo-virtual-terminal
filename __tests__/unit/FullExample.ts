import { VirtualTerminal } from "../../src/VirtualTerminal";
import { describe, expect, it } from "@jest/globals";
import { TerminalAction } from "@fullstackcraftllc/codevideo-types";

describe("VirtualTerminal", () => {
  describe("basic functionality", () => {
    it("should initialize with empty state", () => {
      const virtualTerminal = new VirtualTerminal();
      expect(virtualTerminal.getCurrentCommand()).toBe("");
      expect(virtualTerminal.getCommandHistory()).toEqual([]);
      expect(virtualTerminal.getCurrentCaretPosition()).toBe(0);
    });
  });

  describe("command execution and history", () => {
    it("should correctly handle typing and executing commands", () => {
      const virtualTerminal = new VirtualTerminal();
      const actions: TerminalAction[] = [
        { name: "terminal-type", value: "npm install" },
        { name: "terminal-enter", value: "1" },
      ];

      virtualTerminal.applyActions(actions);
      expect(virtualTerminal.getCommandHistory()).toEqual(["npm install"]);
      expect(virtualTerminal.getCurrentCommand()).toBe("");
    });

    it("should maintain command history and navigate through it", () => {
      const virtualTerminal = new VirtualTerminal();
      const actions: TerminalAction[] = [
        { name: "terminal-type", value: "npm install" },
        { name: "terminal-enter", value: "1" },
        { name: "terminal-type", value: "git status" },
        { name: "terminal-enter", value: "1" },
        { name: "terminal-arrow-up", value: "1" },
      ];

      virtualTerminal.applyActions(actions);
      expect(virtualTerminal.getCurrentCommand()).toBe("git status");
      
      virtualTerminal.applyAction({ name: "terminal-arrow-up", value: "1" });
      expect(virtualTerminal.getCurrentCommand()).toBe("npm install");
      
      virtualTerminal.applyAction({ name: "terminal-arrow-down", value: "1" });
      expect(virtualTerminal.getCurrentCommand()).toBe("git status");
    });
  });

  describe("cursor movement and editing", () => {
    it("should handle cursor movement correctly", () => {
      const virtualTerminal = new VirtualTerminal();
      virtualTerminal.applyAction({ name: "terminal-type", value: "test" });
      
      virtualTerminal.applyAction({ name: "terminal-arrow-left", value: "2" });
      expect(virtualTerminal.getCurrentCaretPosition()).toBe(2);
      
      virtualTerminal.applyAction({ name: "terminal-arrow-right", value: "1" });
      expect(virtualTerminal.getCurrentCaretPosition()).toBe(3);
      
      virtualTerminal.applyAction({ name: "terminal-command-left", value: "1" });
      expect(virtualTerminal.getCurrentCaretPosition()).toBe(0);
      
      virtualTerminal.applyAction({ name: "terminal-command-right", value: "1" });
      expect(virtualTerminal.getCurrentCaretPosition()).toBe(4);
    });

    it("should handle backspace correctly", () => {
      const virtualTerminal = new VirtualTerminal();
      virtualTerminal.applyActions([
        { name: "terminal-type", value: "test" },
        { name: "terminal-backspace", value: "2" },
      ]);
      
      expect(virtualTerminal.getCurrentCommand()).toBe("te");
      expect(virtualTerminal.getCurrentCaretPosition()).toBe(2);
    });

    it("should handle delete correctly", () => {
      const virtualTerminal = new VirtualTerminal();
      virtualTerminal.applyActions([
        { name: "terminal-type", value: "test" },
        { name: "terminal-arrow-left", value: "2" },
        { name: "terminal-backspace", value: "1" },
      ]);
      
      expect(virtualTerminal.getCurrentCommand()).toBe("tst");
      expect(virtualTerminal.getCurrentCaretPosition()).toBe(1);
    });
  });

  describe("complex scenarios", () => {
    it("should handle editing in the middle of a command", () => {
      const virtualTerminal = new VirtualTerminal();
      const actions: TerminalAction[] = [
        { name: "terminal-type", value: "npm react" },
        { name: "terminal-arrow-left", value: "5" },
        { name: "terminal-type", value: "install " },
      ];

      virtualTerminal.applyActions(actions);
      expect(virtualTerminal.getCurrentCommand()).toBe("npm install react");
    });

    it("should handle command history navigation and editing", () => {
      const virtualTerminal = new VirtualTerminal();
      const actions: TerminalAction[] = [
        { name: "terminal-type", value: "npm install" },
        { name: "terminal-enter", value: "1" },
        { name: "terminal-type", value: "git status" },
        { name: "terminal-enter", value: "1" },
        { name: "terminal-arrow-up", value: "1" },
        { name: "terminal-arrow-left", value: "6" },
        { name: "terminal-type", value: "commit " },
      ];

      virtualTerminal.applyActions(actions);
      expect(virtualTerminal.getCurrentCommand()).toBe("git commit status");
    });

    it("should handle rapid successive actions correctly", () => {
      const virtualTerminal = new VirtualTerminal();
      const actions: TerminalAction[] = [
        { name: "terminal-type", value: "test command" },
        { name: "terminal-command-left", value: "1" },
        { name: "terminal-arrow-right", value: "5" },
        { name: "terminal-backspace", value: "1" },
        { name: "terminal-type", value: "-" },
        { name: "terminal-command-right", value: "1" },
      ];

      virtualTerminal.applyActions(actions);
      expect(virtualTerminal.getCurrentCommand()).toBe("test-command");
      expect(virtualTerminal.getCurrentCaretPosition()).toBe("test-command".length);
    });

    it("should handle initial command in the constructor", () => {
      const virtualTerminal = new VirtualTerminal("npm install");
      expect(virtualTerminal.getCurrentCommand()).toBe("npm install");
    });
  });
});