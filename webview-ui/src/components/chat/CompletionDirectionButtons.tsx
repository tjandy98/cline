import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import styled from "styled-components"

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

// Button container with horizontal layout
const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 8px;
	width: 100%;
	padding: 10px 15px 0px 15px;
	flex-wrap: wrap; // Allow wrapping on small screens
`

// Style for the direction buttons - double height and full width
const DirectionButton = styled(VSCodeButton)`
	height: 48px; // Double height
	flex: 1;
	min-width: 130px; // Minimum width to avoid too narrow buttons
	justify-content: center;
	align-items: center;
	white-space: normal; // Allow text to wrap inside button

	&:hover {
		background-color: var(--vscode-button-hoverBackground);
	}
`

// Custom options menu that appears when clicking "Custom..."
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
			<DirectionButton appearance="primary" disabled={disabled} onClick={handleReviewClick}>
				Review New Code
			</DirectionButton>

			<DirectionButton appearance="primary" disabled={disabled} onClick={handleDocumentClick}>
				Document New Code
			</DirectionButton>

			<DirectionButton appearance="primary" disabled={disabled} onClick={handleNewTaskClick}>
				Create New Task
			</DirectionButton>

			<DirectionButton appearance="primary" disabled={disabled || customOptions.length === 0} onClick={handleCustomClick}>
				Custom...
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
