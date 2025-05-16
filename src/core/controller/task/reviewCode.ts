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

	// Notify user that we're analyzing code changes
	await controller.task.say("text", "Analyzing code changes since last completion...")

	try {
		// Check if there are changes to review using the public API
		if (await controller.task.doesLatestTaskCompletionHaveNewChanges()) {
			// The AI will show the changes since the last completion
			// Since we don't want to implement our own diff system,
			// just provide instructions to analyze the code

			// Create prompt for code review
			const reviewPrompt =
				`Review the code changes shown above that were made since the last completion.\n\n` +
				`Focus on:\n` +
				`1. Potential bugs or logic errors\n` +
				`2. Type safety issues\n` +
				`3. Missing error handling\n` +
				`4. Performance concerns\n` +
				`5. Security vulnerabilities\n\n` +
				`Reference other code files as needed for context.`

			// Notify user about the code review and send the review prompt
			await controller.task.say("text", "Reviewing code changes...")
			await controller.task.say("text", reviewPrompt)
		} else {
			await controller.task.say("text", "No significant changes found to review.")
			return Empty.create()
		}
	} catch (error) {
		console.error("Error getting diff between checkpoints:", error)
		await controller.task.say(
			"text",
			`Error analyzing code changes: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	// Helper function to generate a simple diff text
	function generateDiffText(before: string, after: string): string {
		const beforeLines = before.split("\n")
		const afterLines = after.split("\n")

		// Simple line-by-line diff (not a sophisticated diff algorithm)
		let result = ""

		// Add removed lines
		for (const line of beforeLines) {
			if (!afterLines.includes(line)) {
				result += `- ${line}\n`
			}
		}

		// Add added lines
		for (const line of afterLines) {
			if (!beforeLines.includes(line)) {
				result += `+ ${line}\n`
			}
		}

		return result.length > 0 ? result : "// No visible changes (might be whitespace only)"
	}

	return Empty.create()
}
