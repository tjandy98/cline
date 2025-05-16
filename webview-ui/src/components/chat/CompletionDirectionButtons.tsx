import { useState, useRef, useEffect } from "react"
import styled from "styled-components"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"

// Props for the CompletionDirectionButtons component
interface CompletionDirectionButtonsProps {
	onOptionSelected: (optionId: string, customPrompt?: string) => void
	disabled?: boolean
}

// Custom options that could later be loaded from settings
interface CustomOption {
	id: string
	text: string
	prompt?: string
}

// Width thresholds for responsive layouts
const NARROW_THRESHOLD = 345 // px - below this width, show icons only (no labels)
const WIDE_THRESHOLD = 700 // px - above this width, show icons beside text (horizontal layout)

// Button container with horizontal layout (single row)
const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 8px;
	width: 100%;
	padding: 10px 0px 0px 0px; // Remove horizontal padding to span full width
	margin: 0 15px; // Add margin instead to keep the same spacing
`

// Style for the direction buttons with responsive layout
const DirectionButton = styled.button<{
	disabled?: boolean
	isPrimary?: boolean
	hideLabels?: boolean
	horizontalLayout?: boolean
}>`
	height: ${(props) => (props.horizontalLayout ? "36px" : "48px")}; // Shorter height for horizontal layout
	flex: 1;
	display: flex;
	flex-direction: ${(props) => (props.horizontalLayout ? "row" : "column")};
	justify-content: center;
	align-items: center;
	background-color: ${(props) => (props.isPrimary ? "var(--vscode-button-background)" : CODE_BLOCK_BG_COLOR)};
	color: ${(props) => (props.isPrimary ? "var(--vscode-button-foreground)" : "var(--vscode-input-foreground)")};
	border: 1px solid var(--vscode-editorGroup-border);
	border-radius: 3px;
	cursor: ${(props) => (props.disabled ? "default" : "pointer")};
	white-space: normal; // Allow text to wrap inside button
	padding: ${(props) => {
		if (props.hideLabels) return "6px 6px"
		if (props.horizontalLayout) return "6px 12px"
		return "6px 12px"
	}};
	opacity: ${(props) => (props.disabled ? "0.5" : "1")};
	min-width: ${(props) => (props.hideLabels ? "42px" : "80px")};

	&:hover {
		background-color: ${(props) =>
			props.isPrimary ? "var(--vscode-button-hoverBackground)" : "var(--vscode-list-hoverBackground)"};
	}

	.icon {
		font-size: 16px;
		margin-right: ${(props) => (props.horizontalLayout ? "8px" : "0")};
		margin-bottom: ${(props) => (props.horizontalLayout ? "0" : props.hideLabels ? "0" : "4px")};
	}

	.label {
		font-size: 12px;
		display: ${(props) => (props.hideLabels ? "none" : "block")};
	}
`

// Custom options menu that appears when clicking "Custom"
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

const CustomOptionItem = styled.div`
	padding: 8px 12px;
	cursor: pointer;
	font-size: 12px;

	&:hover {
		background-color: var(--vscode-list-hoverBackground);
	}
`

export const CompletionDirectionButtons: React.FC<CompletionDirectionButtonsProps> = ({ onOptionSelected, disabled = false }) => {
	const [showCustomOptions, setShowCustomOptions] = useState(false)
	const [hideLabels, setHideLabels] = useState(false)
	const [horizontalLayout, setHorizontalLayout] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	// Hardcoded placeholder custom options
	const customOptions: CustomOption[] = [
		{ id: "custom_1", text: "Generate Tests", prompt: "Generate unit tests for the code you just wrote" },
		{ id: "custom_2", text: "Explain Code", prompt: "Provide a detailed explanation of how the code works" },
	]

	// Set up ResizeObserver to detect container width and adjust layout
	useEffect(() => {
		if (!containerRef.current) return

		// Create a new ResizeObserver
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

		// Stop observing when component unmounts
		return () => {
			observer.disconnect()
		}
	}, [])

	const handleCustomClick = () => {
		setShowCustomOptions(!showCustomOptions)
	}

	const selectCustomOption = (option: CustomOption) => {
		onOptionSelected(option.id, option.prompt)
		setShowCustomOptions(false)
	}

	// Click event handlers for main buttons
	const handleReviewClick = () => onOptionSelected("review")
	const handleDocumentClick = () => onOptionSelected("document")
	const handleNewTaskClick = () => onOptionSelected("newTask")

	return (
		<ButtonContainer ref={containerRef}>
			<DirectionButton
				disabled={disabled}
				hideLabels={hideLabels}
				horizontalLayout={horizontalLayout}
				onClick={handleReviewClick}>
				<span className="codicon codicon-checklist icon"></span>
				<span className="label">Code Review</span>
			</DirectionButton>

			<DirectionButton
				disabled={disabled}
				hideLabels={hideLabels}
				horizontalLayout={horizontalLayout}
				onClick={handleDocumentClick}>
				<span className="codicon codicon-book icon"></span>
				<span className="label">Document</span>
			</DirectionButton>

			<DirectionButton
				disabled={disabled || customOptions.length === 0}
				hideLabels={hideLabels}
				horizontalLayout={horizontalLayout}
				onClick={handleCustomClick}>
				<span className="codicon codicon-tools icon"></span>
				<span className="label">Custom</span>
			</DirectionButton>

			{/* New Task button moved to the right and styled as primary */}
			<DirectionButton
				disabled={disabled}
				hideLabels={hideLabels}
				horizontalLayout={horizontalLayout}
				isPrimary={true}
				onClick={handleNewTaskClick}>
				<span className="codicon codicon-add icon"></span>
				<span className="label">New Task</span>
			</DirectionButton>

			{showCustomOptions && (
				<CustomOptionsMenu>
					{customOptions.map((option) => (
						<CustomOptionItem key={option.id} onClick={() => selectCustomOption(option)}>
							{option.text}
						</CustomOptionItem>
					))}
				</CustomOptionsMenu>
			)}
		</ButtonContainer>
	)
}
