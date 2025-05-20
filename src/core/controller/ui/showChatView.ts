import { Controller } from ".."
import { Empty, EmptyRequest } from "../../../shared/proto/common"
import { UiMethodHandler } from "./index"

/**
 * Shows the chat view in the UI
 * @param controller The controller instance
 * @param _request The empty request (not used)
 * @returns Empty response
 */
export const showChatView: UiMethodHandler = async (controller: Controller, _request: EmptyRequest): Promise<Empty> => {
	controller.postMessageToWebview({
		type: "action",
		action: "chatButtonClicked",
	})
	return Empty.create()
}
