import { VirtualTerminal } from "../../src/VirtualTerminal";
import { describe, expect, it } from "@jest/globals";

describe("VirtualTerminal", () => {
  describe("cross setter functionality (via file explorer related commands in codevideo-virtual-ide)", () => {
    it("should have a correct buffer state at initialization", () => {
      const virtualTerminal = new VirtualTerminal();
      expect(virtualTerminal.getBuffer()).toEqual([
        "[codevideo.studio] [~] /> ",
      ]);
    });

    it("should correctly add content to the buffer via terminal-set-output", () => {
      const virtualTerminal = new VirtualTerminal();
      virtualTerminal.applyAction({ name: "terminal-set-output", value: "test" });
      expect(virtualTerminal.getBuffer()).toEqual([
        "[codevideo.studio] [~] /> ",
        "test",
      ]);
    });

    it("should correctly set the prompt via terminal-set-prompt", () => {
      const virtualTerminal = new VirtualTerminal();
      virtualTerminal.applyAction({ name: "terminal-set-prompt", value: "user@root [~]" });
      expect(virtualTerminal.getPrompt()).toEqual("user@root [~]");
    });

    it("should correctly set the present working directory and update the prompt via terminal-set-present-working-directory", () => {
      const virtualTerminal = new VirtualTerminal();
      virtualTerminal.applyAction({ name: "terminal-set-present-working-directory", value: "~/home/user" });
      expect(virtualTerminal.getPresentWorkingDirectory()).toEqual("~/home/user");
      expect(virtualTerminal.getPrompt()).toEqual("[codevideo.studio] [~/home/user] /> ");
    });

  });
});