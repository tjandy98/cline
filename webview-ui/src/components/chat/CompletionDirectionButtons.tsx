import { useState, useRef, useEffect } from "react"
import styled from "styled-components"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"

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
}

// Styled Components
// -------------------------------------------------------------------------------

/**
 * Container for all buttons - maintains a single row layout
 * that adapts to screen width
 */
const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 8px;
	width: 100%;
	padding: 10px 0px 0px 0px;
	margin: 0 15px; /* Use margin instead of padding to allow buttons to span full width */
`

/**
 * Props for the DirectionButton styled component
 */
interface DirectionButtonProps {
	/** Whether the button is disabled */
	disabled?: boolean
	/** Whether this is the primary action button (blue) */
	isPrimary?: boolean
	/** Whether to hide text labels (icon-only mode) */
	hideLabels?: boolean
	/** Whether to use horizontal layout (icons beside text) */
	horizontalLayout?: boolean
}

/**
 * Direction button with responsive layout capabilities
 * Adapts its appearance based on available space:
 * - Icon only on narrow screens
 * - Vertical layout (icon above text) on medium screens
 * - Horizontal layout (icon beside text) on wide screens
 */
const DirectionButton = styled.button<DirectionButtonProps>`
	/* Size and layout */
	height: ${(props) => (props.horizontalLayout ? "36px" : "48px")};
	flex: 1;
	display: flex;
	flex-direction: ${(props) => (props.horizontalLayout ? "row" : "column")};
	justify-content: center;
	align-items: center;
	min-width: ${(props) => (props.hideLabels ? "42px" : "80px")};
	padding: ${(props) => {
		if (props.hideLabels) return "6px 6px"
		if (props.horizontalLayout) return "6px 12px"
		return "6px 12px"
	}};

	/* Appearance */
	background-color: ${(props) => (props.isPrimary ? "var(--vscode-button-background)" : CODE_BLOCK_BG_COLOR)};
	color: ${(props) => (props.isPrimary ? "var(--vscode-button-foreground)" : "var(--vscode-input-foreground)")};
	border: 1px solid var(--vscode-editorGroup-border);
	border-radius: 3px;
	opacity: ${(props) => (props.disabled ? "0.5" : "1")};

	/* Behavior */
	cursor: ${(props) => (props.disabled ? "default" : "pointer")};
	white-space: normal; /* Allow text to wrap inside button */

	&:hover {
		background-color: ${(props) =>
			props.isPrimary ? "var(--vscode-button-hoverBackground)" : "var(--vscode-list-hoverBackground)"};
	}

	/* Icon styling */
	.icon {
		font-size: 16px;
		margin-right: ${(props) => (props.horizontalLayout ? "8px" : "0")};
		margin-bottom: ${(props) => (props.horizontalLayout ? "0" : props.hideLabels ? "0" : "4px")};
	}

	/* Label styling */
	.label {
		font-size: 12px;
		display: ${(props) => (props.hideLabels ? "none" : "block")};
	}
`

/**
 * Dropdown menu for custom options
 * Appears above the Custom button when clicked
 */
const CustomOptionsMenu = styled.div`
	position: absolute;
	bottom: 100%;
	right: 15px;
	margin-bottom: 8px;
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-editorWidget-border);
	border-radius: 4px;
	overflow: hidden;
	z-index: 10;
	width: 200px;
	max-height: 300px;
	overflow-y: auto;
`

/**
 * Individual item in the custom options dropdown
 */
const CustomOptionItem = styled.div`
	padding: 8px 12px;
	cursor: pointer;
	font-size: 12px;

	&:hover {
		background-color: var(--vscode-list-hoverBackground);
	}
`

/**
 * Button definitions with their properties
 */
const DIRECTION_BUTTONS = [
	{
		id: "review",
		label: "Code Review",
		icon: "codicon-checklist",
		position: 1,
	},
	{
		id: "document",
		label: "Document",
		icon: "codicon-book",
		position: 2,
	},
	{
		id: "custom",
		label: "Custom",
		icon: "codicon-tools",
		position: 3,
		requiresOptions: true,
	},
	{
		id: "newTask",
		label: "New Task",
		icon: "codicon-add",
		position: 4,
		isPrimary: true,
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

		return (
			<DirectionButton
				key={button.id}
				disabled={disabled || customDisabled}
				hideLabels={hideLabels}
				horizontalLayout={horizontalLayout}
				isPrimary={button.isPrimary}
				onClick={() => handleButtonClick(button.id)}>
				<span className={`codicon ${button.icon} icon`}></span>
				<span className="label">{button.label}</span>
			</DirectionButton>
		)
	}

	return (
		<ButtonContainer ref={containerRef}>
			{/* Render buttons in their defined order */}
			{DIRECTION_BUTTONS.sort((a, b) => a.position - b.position).map(renderButton)}

			{/* Custom options dropdown menu */}
			{showCustomOptions && (
				<CustomOptionsMenu>
					{customOptions.map((option) => (
						<CustomOptionItem key={option.id} onClick={() => handleCustomOptionSelect(option)}>
							{option.text}
						</CustomOptionItem>
					))}
				</CustomOptionsMenu>
			)}
		</ButtonContainer>
	)
}
