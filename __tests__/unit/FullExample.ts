import { VirtualTerminal } from "./../../src/VirtualTerminal";
import { describe, expect } from "@jest/globals";
import { IAction } from "@fullstackcraftllc/codevideo-types";

describe("VirtualTerminal", () => {
  describe("full audit of complex steps", () => {
    it("should have correct state for everything at every step", () => {
      const virtualTerminal = new VirtualTerminal([]);
      const realExampleActions: IAction[] = [
        { name: 'arrow-up', value: '1' },  // Go to the previous command
        { name: 'arrow-down', value: '1' }, // Go to the next command
        { name: 'type-terminal', value: 'npm install' }, // Type 'npm install'
        { name: 'enter-terminal', value: '1' }, // Execute the command, if any
      ]
      virtualTerminal.applyActions(realExampleActions);
      const dataForAnnotatedFrames =
        virtualTerminal.getDataForAnnotatedFrames();
      // +1 due to initialization
      expect(dataForAnnotatedFrames.length).toEqual(
        realExampleActions.length + 1
      );

      // <no index in real steps>: initialization
      expect(dataForAnnotatedFrames[0].actionApplied).toEqual({
        name: "type-editor",
        value: "",
      });
      expect(dataForAnnotatedFrames[0].code).toEqual("");
      expect(dataForAnnotatedFrames[0].caretPosition).toEqual({
        row: 0,
        col: 0,
      });
      expect(dataForAnnotatedFrames[0].speechCaptions).toEqual([
      ]);

      // index 0: speak-before
      expect(dataForAnnotatedFrames[1].actionApplied).toEqual(
        realExampleActions[0]
      );
      expect(dataForAnnotatedFrames[1].code).toEqual("");
      expect(dataForAnnotatedFrames[1].caretPosition).toEqual({
        row: 0,
        col: 0,
      });
      // TODO: investigate speech bug
    //   expect(dataForAnnotatedFrames[1].speechCaptions).toEqual([
    //     {
    //       speechType: "speak-before",
    //       speechValue:
    //         "Let's learn how to use the console.log function in JavaScript!",
    //     },
    //     {
    //       speechType: "speak-before",
    //       speechValue:
    //         "First, to make it clear that this is a JavaScript file, I'll just put a comment here",
    //     },
    //   ]);

      // index 1: speak-before
      expect(dataForAnnotatedFrames[2].actionApplied).toEqual(
        realExampleActions[1]
      );
      expect(dataForAnnotatedFrames[2].code).toEqual("");
      expect(dataForAnnotatedFrames[2].caretPosition).toEqual({
        row: 0,
        col: 0,
      });
      // TODO: investigate speech bug
    //   expect(dataForAnnotatedFrames[2].speechCaptions).toEqual([
    //     {
    //       speechType: "speak-before",
    //       speechValue:
    //         "Let's learn how to use the console.log function in JavaScript!",
    //     },
    //     {
    //       speechType: "speak-before",
    //       speechValue:
    //         "First, to make it clear that this is a JavaScript file, I'll just put a comment here",
    //     },
    //     {
    //         speechType: '',
    //         speechValue: ''
    //     }
    //   ]);
    
        // index 2: type-editor
        expect(dataForAnnotatedFrames[3].actionApplied).toEqual(
          realExampleActions[2]
        );
        expect(dataForAnnotatedFrames[3].code).toEqual("// index.js");
        expect(dataForAnnotatedFrames[3].caretPosition).toEqual({
          row: 0,
          col: 11,
        });

        // index 3: enter
        expect(dataForAnnotatedFrames[4].actionApplied).toEqual(
          realExampleActions[3]
        );
        expect(dataForAnnotatedFrames[4].code).toEqual("// index.js\n");
        expect(dataForAnnotatedFrames[4].caretPosition).toEqual({
          row: 1,
          col: 0,
        });

        // index 4: speak-before
        expect(dataForAnnotatedFrames[5].actionApplied).toEqual(
          realExampleActions[4]
        );
        expect(dataForAnnotatedFrames[5].code).toEqual("// index.js\n");
        expect(dataForAnnotatedFrames[5].caretPosition).toEqual({
          row: 1,
          col: 0,
        });

        // index 5: type-editor
        expect(dataForAnnotatedFrames[6].actionApplied).toEqual(
          realExampleActions[5]
        );
        expect(dataForAnnotatedFrames[6].code).toEqual("// index.js\nconsole.log('Hello, world!');");
        expect(dataForAnnotatedFrames[6].caretPosition).toEqual({
          row: 1,
          col: 29,
        });

        // index 6: speak-before
        expect(dataForAnnotatedFrames[7].actionApplied).toEqual(
          realExampleActions[6]
        );
        expect(dataForAnnotatedFrames[7].code).toEqual("// index.js\nconsole.log('Hello, world!');");
        expect(dataForAnnotatedFrames[7].caretPosition).toEqual({
          row: 1,
          col: 29,
        });

        // index 7: backspace
        expect(dataForAnnotatedFrames[8].actionApplied).toEqual(
          realExampleActions[7]
        );
        expect(dataForAnnotatedFrames[8].code).toEqual("// index.js\n");
        expect(dataForAnnotatedFrames[8].caretPosition).toEqual({
          row: 1,
          col: 0,
        });

        // index 8: type-editor
        expect(dataForAnnotatedFrames[9].actionApplied).toEqual(
          realExampleActions[8]
        );
        expect(dataForAnnotatedFrames[9].code).toEqual("// index.js\nconst myVariable = 5;");
        expect(dataForAnnotatedFrames[9].caretPosition).toEqual({
          row: 1,
          col: 21,
        });

        // index 9: enter
        expect(dataForAnnotatedFrames[10].actionApplied).toEqual(
          realExampleActions[9]
        );
        expect(dataForAnnotatedFrames[10].code).toEqual("// index.js\nconst myVariable = 5;\n");
        expect(dataForAnnotatedFrames[10].caretPosition).toEqual({
          row: 2,
          col: 0,
        });

        // index 10: type-editor
        expect(dataForAnnotatedFrames[11].actionApplied).toEqual(
          realExampleActions[10]
        );
        expect(dataForAnnotatedFrames[11].code).toEqual("// index.js\nconst myVariable = 5;\nconsole.log(myVariable);");
        expect(dataForAnnotatedFrames[11].caretPosition).toEqual({
          row: 2,
          col: 24,
        });

        // index 11: speak-before
        expect(dataForAnnotatedFrames[12].actionApplied).toEqual(
          realExampleActions[11]
        );
        expect(dataForAnnotatedFrames[12].code).toEqual("// index.js\nconst myVariable = 5;\nconsole.log(myVariable);");
        expect(dataForAnnotatedFrames[12].caretPosition).toEqual({
          row: 2,
          col: 24,
        });

        // index 12: enter
        expect(dataForAnnotatedFrames[13].actionApplied).toEqual(
          realExampleActions[12]
        );
        expect(dataForAnnotatedFrames[13].code).toEqual("// index.js\nconst myVariable = 5;\nconsole.log(myVariable);\n");
        expect(dataForAnnotatedFrames[13].caretPosition).toEqual({
          row: 3,
          col: 0,
        });

        // index 13: type-editor
        expect(dataForAnnotatedFrames[14].actionApplied).toEqual(
          realExampleActions[13]
        );
        expect(dataForAnnotatedFrames[14].code).toEqual("// index.js\nconst myVariable = 5;\nconsole.log(myVariable);\n// 5");
        expect(dataForAnnotatedFrames[14].caretPosition).toEqual({
          row: 3,
          col: 4,
        });

        // index 14: speak-before
        expect(dataForAnnotatedFrames[15].actionApplied).toEqual(
          realExampleActions[14]
        );
        expect(dataForAnnotatedFrames[15].code).toEqual("// index.js\nconst myVariable = 5;\nconsole.log(myVariable);\n// 5");
        expect(dataForAnnotatedFrames[15].caretPosition).toEqual({
          row: 3,
          col: 4,
        });
    });
  });
});