import { Controller } from ".."
import { Empty, EmptyRequest } from "../../../shared/proto/common"
import { TaskMethodHandler } from "./index"

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

	// Notify user that we're analyzing code changes
	await controller.task.say("text", "Analyzing code changes for documentation...")

	try {
		// Check if there are changes to document using the public API
		if (await controller.task.doesLatestTaskCompletionHaveNewChanges()) {
			// Create a documentation prompt
			const documentationPrompt =
				`Generate documentation for the code changes since the last completion.\n\n` +
				`Create clear, concise documentation that explains:\n` +
				`1. Purpose of the new code\n` +
				`2. How it integrates with existing functionality\n` +
				`3. Key components and their responsibilities\n` +
				`4. Usage examples where appropriate\n` +
				`5. Any important considerations or limitations\n\n` +
				`Format the documentation in a way that would be suitable for inclusion in project docs.`

			// Notify user and send the documentation prompt
			await controller.task.say("text", "Generating documentation for code changes...")
			await controller.task.say("text", documentationPrompt)
		} else {
			await controller.task.say("text", "No significant changes found to document.")
			return Empty.create()
		}
	} catch (error) {
		console.error("Error checking for code changes:", error)
		await controller.task.say(
			"text",
			`Error analyzing code changes: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	return Empty.create()
}
