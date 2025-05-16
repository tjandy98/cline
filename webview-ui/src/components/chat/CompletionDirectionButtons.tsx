import { useState } from "react"
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

// Button container with horizontal layout (single row)
const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 8px;
	width: 100%;
	padding: 10px 15px 0px 15px;
`

// Style for the direction buttons - same color as background with icons
const DirectionButton = styled.button<{ disabled?: boolean }>`
	height: 48px; // Double height
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: ${CODE_BLOCK_BG_COLOR};
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-editorGroup-border);
	border-radius: 3px;
	cursor: ${(props) => (props.disabled ? "default" : "pointer")};
	white-space: normal; // Allow text to wrap inside button
	padding: 6px 12px;
	opacity: ${(props) => (props.disabled ? "0.5" : "1")};

	&:hover {
		background-color: var(--vscode-list-hoverBackground);
	}

	.icon {
		font-size: 16px;
		margin-bottom: 4px;
	}

	.label {
		font-size: 12px;
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

	// Hardcoded placeholder custom options
	const customOptions: CustomOption[] = [
		{ id: "custom_1", text: "Generate Tests", prompt: "Generate unit tests for the code you just wrote" },
		{ id: "custom_2", text: "Explain Code", prompt: "Provide a detailed explanation of how the code works" },
	]

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
		<ButtonContainer>
			<DirectionButton disabled={disabled} onClick={handleNewTaskClick}>
				<span className="codicon codicon-add icon"></span>
				<span className="label">New Task</span>
			</DirectionButton>

			<DirectionButton disabled={disabled} onClick={handleReviewClick}>
				<span className="codicon codicon-checklist icon"></span>
				<span className="label">Code Review</span>
			</DirectionButton>

			<DirectionButton disabled={disabled} onClick={handleDocumentClick}>
				<span className="codicon codicon-book icon"></span>
				<span className="label">Document</span>
			</DirectionButton>

			<DirectionButton disabled={disabled || customOptions.length === 0} onClick={handleCustomClick}>
				<span className="codicon codicon-tools icon"></span>
				<span className="label">Custom</span>
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
