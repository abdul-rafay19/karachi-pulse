import { ChatToolDef } from "./chatClient";

/**
 * Tools the model can call to actually *do* something in the app, instead of
 * only describing what the user should click. This is what separates the
 * civic assistant from a plain FAQ bot: it can fly the map to an area, open
 * the report form pre-filled, or jump to the right authority — grounded in
 * the same live data it's answering questions with.
 */
export const CHAT_TOOLS: ChatToolDef[] = [
  {
    type: "function",
    function: {
      name: "fly_to_area",
      description:
        "Move the live Karachi map to a specific area and open its full risk panel (score, trend, weather, recommended actions). Call this whenever the user names a specific locality, asks 'is it safe in X', or asks to see an area on the map.",
      parameters: {
        type: "object",
        properties: {
          areaId: {
            type: "string",
            description:
              "The exact area id from the AREA CONTEXT list in the system prompt (e.g. 'korangi', 'gulshan-e-iqbal'). Never invent an id that isn't in the list.",
          },
        },
        required: ["areaId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_report_form",
      description:
        "Open the citizen complaint/report form so the user can file a new report, optionally pre-selecting an area. Call this when the user says they want to report, file, log, or flag a problem.",
      parameters: {
        type: "object",
        properties: {
          areaId: {
            type: "string",
            description: "Optional area id from AREA CONTEXT to preselect in the form.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_authorities",
      description:
        "Open the civic authority directory (which department to contact for which issue), optionally focused on one category. Call this when the user asks who to contact, which authority handles something, or how to escalate.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["electricity", "water", "flooding", "roads", "waste", "sewage", "other"],
            description: "Optional complaint category to focus the directory on.",
          },
        },
      },
    },
  },
];
