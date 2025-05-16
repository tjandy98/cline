import { Controller } from ".."
import { Empty, StringRequest } from "../../../shared/proto/common"
import { TaskMethodHandler } from "./index"

/**
 * Executes a custom direction prompt after task completion
 * @param controller The controller instance
 * @param request The request containing the custom prompt
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
		throw new Error("Custom prompt is required")
	}

	// Notify user about the custom direction
	await controller.task.say("text", "Executing custom direction...")

	// Use the custom prompt directly
	await controller.task.say("text", request.value)

	return Empty.create()
}
