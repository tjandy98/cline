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

	try {
		// Check if there are changes to document using the public API
		if (await controller.task.doesLatestTaskCompletionHaveNewChanges()) {
			// First display the diff to the user in the VSCode UI
			const messageTs = Date.now() // Use current timestamp
			await controller.task.presentMultifileDiff(messageTs, true)

			// Get the actual diff content
			const diffContent = await controller.task.getDiffSinceLastCompletion()

			// Notify user of what we're doing
			await controller.task.say("text", "Generating documentation for code changes...")

			// Construct the documentation prompt, including the diff if available
			const documentationPrompt =
				`Analyzing code changes for documentation...\n\n` +
				(diffContent
					? `The following code changes were made:\n\`\`\`diff\n${diffContent}\n\`\`\`\n\n`
					: `No textual diff to show, but changes were detected. Please analyze the current state of the relevant files.\n\n`) +
				`Generate documentation for the code changes.\n\n` +
				`Create clear, concise comments and documentation that explains:\n` +
				`1. Purpose of the new code\n` +
				`2. How it integrates with existing functionality\n` +
				`3. Key components and their responsibilities\n` +
				`4. Usage examples where appropriate\n` +
				`5. Any important considerations or limitations\n\n` +
				`Reference other code files as needed for context, using the read_file tool or targeted grep commands.`

			// Start a new task with the documentation prompt
			await controller.initTask(documentationPrompt, [])
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
