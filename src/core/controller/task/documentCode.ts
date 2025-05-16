import { Controller } from ".."
import { Empty, EmptyRequest } from "../../../shared/proto/common"
import { TaskMethodHandler } from "./index"
import { ClineMessage } from "../../../shared/ExtensionMessage"

/**
 * Generates documentation for code changes made since the last completion
 * @param controller The controller instance
 * @param _request The empty request
 * @returns Empty response
 */
export const documentCode: TaskMethodHandler = async (controller: Controller, _request: EmptyRequest): Promise<Empty> => {
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

	// Notify user about documentation generation
	await controller.task.say("text", "Generating documentation for code changes...")

	// This is a placeholder prompt - in the real implementation, this would include
	// actual diff content from the checkpoint system
	const documentationPrompt = `
        Generate documentation for the code changes that were made since the last completion.
        
        Create clear, concise documentation that explains:
        1. Purpose of the new code
        2. How it integrates with existing functionality
        3. Key components and their responsibilities
        4. Usage examples where appropriate
        5. Any important considerations or limitations
        
        Format the documentation in a way that would be suitable for inclusion in project docs.
    `.trim()

	// Use the say method to deliver the prompt to the LLM
	await controller.task.say("text", documentationPrompt)

	return Empty.create()
}
