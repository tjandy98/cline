import { Controller } from ".."
import { Empty, StringRequest } from "../../../shared/proto/common"
import { TaskMethodHandler } from "./index"

/**
 * Executes a custom direction prompt provided by the user
 * @param controller The controller instance
 * @param request The StringRequest containing the custom prompt
 * @returns Empty response
 */
export const executeCustomDirection: TaskMethodHandler = async (
	controller: Controller,
	request: StringRequest,
): Promise<Empty> => {
	if (!controller.task) {
		throw new Error("No active task")
	}

	if (!request.value) {
		throw new Error("Custom direction prompt is required")
	}

	// Notify user that we're processing their custom direction
	await controller.task.say("text", "Processing custom direction...")

	// Send the custom prompt to the AI
	await controller.task.say("text", request.value)

	return Empty.create()
}
