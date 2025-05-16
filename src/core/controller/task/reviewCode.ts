import { Controller } from ".."
import { Empty, EmptyRequest } from "../../../shared/proto/common"
import { TaskMethodHandler } from "./index"
import { ClineMessage } from "../../../shared/ExtensionMessage"

/**
 * Reviews code changes made since the last completion
 * @param controller The controller instance
 * @param _request The empty request
 * @returns Empty response
 */
export const reviewCode: TaskMethodHandler = async (controller: Controller, _request: EmptyRequest): Promise<Empty> => {
	if (!controller.task) {
		throw new Error("No active task")
	}

	// Helper function to find last index since findLastIndex isn't available in current TypeScript lib
	function findLastIndex(array: ClineMessage[], predicate: (message: ClineMessage) => boolean): number {
		for (let i = array.length - 1; i >= 0; i--) {
			if (predicate(array[i])) {
				return i
			}
		}
		return -1
	}

	// Get the most recent completion checkpoint hash
	const lastCompletionIndex = findLastIndex(
		controller.task.clineMessages,
		(m: ClineMessage) => m.say === "completion_result" || m.ask === "completion_result",
	)

	if (lastCompletionIndex < 0) {
		throw new Error("No completion found")
	}

	const lastCompletionMessage = controller.task.clineMessages[lastCompletionIndex]

	// Find previous completion checkpoint
	const prevCompletionIndex = findLastIndex(
		controller.task.clineMessages.slice(0, lastCompletionIndex),
		(m: ClineMessage) => m.say === "completion_result" || m.ask === "completion_result",
	)

	const prevCheckpointHash =
		prevCompletionIndex >= 0
			? controller.task.clineMessages[prevCompletionIndex].lastCheckpointHash
			: controller.task.clineMessages.find((m) => m.say === "checkpoint_created")?.lastCheckpointHash

	if (!lastCompletionMessage.lastCheckpointHash || !prevCheckpointHash) {
		throw new Error("Checkpoint information not available")
	}

	// For implementation purposes, we'll need to access checkpoint data
	// In a real implementation, this would call the proper public method on the task
	await controller.task.say("text", "Analyzing code changes since last completion...")

	// Notify user about the code review
	await controller.task.say("text", "Reviewing code changes...")

	// This is a placeholder prompt - in the real implementation, this would include
	// actual diff content from the checkpoint system
	const reviewPrompt = `
        Review the code changes that were made since the last completion.
        
        Focus on:
        1. Potential bugs or logic errors
        2. Type safety issues
        3. Missing error handling
        4. Performance concerns
        5. Security vulnerabilities
        
        Reference other code files as needed for context.
    `.trim()

	// Use the say method to deliver the prompt to the LLM
	await controller.task.say("text", reviewPrompt)

	return Empty.create()
}
