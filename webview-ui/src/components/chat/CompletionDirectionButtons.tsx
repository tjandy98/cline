import { useState, useRef, useEffect } from "react"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"

/**
 * Custom CSS for tooltips applied directly in the component
 * This ensures tooltips work in the VSCode webview context
 */
const tooltipStyles = `
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--vscode-editorWidget-background);
  color: var(--vscode-foreground);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  border: 1px solid var(--vscode-editorWidget-border);
  z-index: 50;
  margin-bottom: 8px;
  max-width: 200px;
  word-wrap: break-word;
}

.tooltip::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: var(--vscode-editorWidget-background) transparent transparent transparent;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  margin-bottom: -5px;
  z-index: 51;
}

.tooltip:hover::after,
.tooltip:hover::before {
  opacity: 1;
  visibility: visible;
}

.dropdown-tooltip::after {
  left: 100%;
  bottom: 50%;
  transform: translateY(50%);
  margin-left: 10px;
  margin-bottom: 0;
}

.dropdown-tooltip::before {
  left: 100%;
  bottom: 50%;
  transform: translateY(50%);
  border-color: transparent var(--vscode-editorWidget-background) transparent transparent;
  margin-left: -5px;
  margin-bottom: 0;
}
`

/**
 * Thresholds for responsive layouts (in pixels)
 * - Below NARROW_THRESHOLD: Icon-only mode (no labels)
 * - Between thresholds: Vertical layout (icons above text)
 * - Above WIDE_THRESHOLD: Horizontal layout (icons beside text)
 */
const NARROW_THRESHOLD = 345
const WIDE_THRESHOLD = 700

// Type Definitions
// -------------------------------------------------------------------------------

/**
 * Props for the CompletionDirectionButtons component
 */
interface CompletionDirectionButtonsProps {
	/** Callback function when a direction button is selected */
	onOptionSelected: (optionId: string, customPrompt?: string) => void
	/** Whether the buttons should be in a disabled state */
	disabled?: boolean
}

/**
 * Direction button definition with its properties
 */
interface DirectionButton {
	/** Unique identifier for the button */
	id: string
	/** Display text on the button */
	label: string
	/** Icon codicon class name */
	icon: string
	/** Position in the button row (1-based) */
	position: number
	/** Tooltip text displayed on hover */
	tooltip: string
	/** Whether this button requires custom options to function */
	requiresOptions?: boolean
	/** Whether this is the primary action button */
	isPrimary?: boolean
}

/**
 * Custom option definition - can be extended in the future
 * to support user-defined custom actions
 */
interface CustomOption {
	/** Unique identifier for the option */
	id: string
	/** Display text in the dropdown menu */
	text: string
	/** Optional prompt to send to the AI when selected */
	prompt?: string
	/** Optional tooltip text to display on hover */
	tooltip?: string
}

/**
 * Button definitions with their properties
 */
const DIRECTION_BUTTONS: DirectionButton[] = [
	{
		id: "review",
		label: "Code Review",
		icon: "codicon-checklist",
		position: 1,
		tooltip: "Review code changes made during the task for bugs or issues",
	},
	{
		id: "document",
		label: "Document",
		icon: "codicon-book",
		position: 2,
		tooltip: "Generate documentation for code added during the task",
	},
	{
		id: "custom",
		label: "Custom",
		icon: "codicon-tools",
		position: 3,
		requiresOptions: true,
		tooltip: "Choose from custom actions defined in settings",
	},
	{
		id: "newTask",
		label: "New Task",
		icon: "codicon-add",
		position: 4,
		isPrimary: true,
		tooltip: "Start a new task with a clean context",
	},
]

/**
 * CompletionDirectionButtons Component
 *
 * Displays a set of direction buttons after task completion that allow the user
 * to choose what to do next. Buttons adapt their layout based on available space:
 * - Narrow view: Icon-only buttons
 * - Medium view: Icons above text
 * - Wide view: Icons beside text in a compact horizontal layout
 */
export const CompletionDirectionButtons: React.FC<CompletionDirectionButtonsProps> = ({ onOptionSelected, disabled = false }) => {
	// State
	const [showCustomOptions, setShowCustomOptions] = useState(false)
	const [hideLabels, setHideLabels] = useState(false)
	const [horizontalLayout, setHorizontalLayout] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	// Hardcoded placeholder custom options (would be loaded from settings in the future)
	const customOptions: CustomOption[] = [
		{ id: "custom_1", text: "Generate Tests", prompt: "Generate unit tests for the code you just wrote" },
		{ id: "custom_2", text: "Explain Code", prompt: "Provide a detailed explanation of how the code works" },
	]

	/**
	 * Sets up responsive layouts based on container width
	 * Uses ResizeObserver to detect size changes and adapt the UI accordingly
	 */
	useEffect(() => {
		if (!containerRef.current) return

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width

				// Update layout based on width thresholds
				setHideLabels(width < NARROW_THRESHOLD)
				setHorizontalLayout(width > WIDE_THRESHOLD)
			}
		})

		// Start observing the container
		observer.observe(containerRef.current)

		// Clean up on unmount
		return () => observer.disconnect()
	}, [])

	/**
	 * Handler functions for button clicks
	 */
	const handleButtonClick = (buttonId: string) => {
		// Special handling for custom button
		if (buttonId === "custom") {
			setShowCustomOptions(!showCustomOptions)
			return
		}

		// All other buttons trigger the onOptionSelected callback
		onOptionSelected(buttonId)
	}

	/**
	 * Handler for selecting a custom option from the dropdown
	 */
	const handleCustomOptionSelect = (option: CustomOption) => {
		onOptionSelected(option.id, option.prompt)
		setShowCustomOptions(false)
	}

	/**
	 * Renders a direction button with appropriate styling and handlers
	 */
	const renderButton = (button: (typeof DIRECTION_BUTTONS)[0]) => {
		const isCustom = button.id === "custom"
		const customDisabled = isCustom && customOptions.length === 0
		const isDisabled = disabled || customDisabled

		// Base button classes that apply to all buttons
		const baseButtonClasses = `
      flex-1 rounded border border-[var(--vscode-editorGroup-border)] 
      ${isDisabled ? "opacity-50 cursor-default" : "cursor-pointer"}
    `

		// Background and text color classes
		const colorClasses = button.isPrimary
			? "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)]"
			: "bg-[var(--vscode-editor-background)] text-[var(--vscode-input-foreground)]"

		// Hover effect classes
		const hoverClasses = !isDisabled
			? button.isPrimary
				? "hover:bg-[var(--vscode-button-hoverBackground)]"
				: "hover:bg-[var(--vscode-list-hoverBackground)]"
			: ""

		// Layout classes based on current view mode
		const layoutClasses = horizontalLayout
			? "h-9 flex flex-row justify-center items-center py-1.5 px-3 whitespace-nowrap"
			: "h-12 flex flex-col justify-center items-center py-1.5 px-3"

		// Additional size constraints
		const sizeClasses = hideLabels ? "min-w-[42px] p-1.5" : "min-w-[80px]"

		// Combine all classes
		const buttonClasses = `tooltip ${baseButtonClasses} ${colorClasses} ${hoverClasses} ${layoutClasses} ${sizeClasses}`

		// Icon margin classes based on layout
		const iconClasses = `${button.icon} icon text-base ${horizontalLayout ? "mr-2 align-middle" : hideLabels ? "" : "mb-1"}`

		return (
			<button
				key={button.id}
				disabled={isDisabled}
				className={`${buttonClasses} relative`}
				onClick={() => handleButtonClick(button.id)}
				title={button.tooltip}
				aria-label={`${button.label}: ${button.tooltip}`}
				data-tooltip={button.tooltip}>
				<span className={`codicon ${iconClasses}`}></span>
				<span
					className={`label text-xs ${hideLabels ? "hidden" : horizontalLayout ? "inline-block align-middle" : "block"}`}>
					{button.label}
				</span>
			</button>
		)
	}

	// Apply CSS styles for tooltips
	useEffect(() => {
		const styleEl = document.createElement("style")
		styleEl.innerHTML = tooltipStyles
		document.head.appendChild(styleEl)

		return () => {
			document.head.removeChild(styleEl)
		}
	}, [])

	return (
		<div ref={containerRef} className="flex flex-row gap-2 w-full pt-2.5 px-0 mx-[15px]">
			{/* Render buttons in their defined order */}
			{DIRECTION_BUTTONS.sort((a, b) => a.position - b.position).map(renderButton)}

			{/* Custom options dropdown menu */}
			{showCustomOptions && (
				<div
					className="
          absolute bottom-full right-[15px] mb-2
          bg-[var(--vscode-editor-background)]
          border border-[var(--vscode-editorWidget-border)]
          rounded overflow-hidden z-10 w-[200px] max-h-[300px] overflow-y-auto">
					{customOptions.map((option) => {
						const tooltipText = option.prompt || `Execute custom action: ${option.text}`
						return (
							<div
								key={option.id}
								className="p-3 cursor-pointer text-xs hover:bg-[var(--vscode-list-hoverBackground)] dropdown-tooltip tooltip"
								onClick={() => handleCustomOptionSelect(option)}
								title={tooltipText}
								data-tooltip={tooltipText}
								aria-label={tooltipText}>
								{option.text}
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
