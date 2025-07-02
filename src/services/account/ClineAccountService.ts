import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import type { BalanceResponse, PaymentTransaction, UsageTransaction, UserResponse } from "@shared/ClineAccount"
import { AuthService } from "../auth/AuthService"

export class ClineAccountService {
	private static instance: ClineAccountService
	private _authService: AuthService
	// private readonly _authServiceUrl = "https://staging-app.cline.bot/auth"
	// private readonly _baseUrl = "https://app.cline.bot/v1"
	// TODO: replace this with a global API Host
	private readonly _baseUrl = "https://core-api.staging.int.cline.bot"

	constructor() {
		this._authService = AuthService.getInstance()
	}

	/**
	 * Returns the singleton instance of ClineAccountService
	 * @returns Singleton instance of ClineAccountService
	 */
	public static getInstance(): ClineAccountService {
		if (!ClineAccountService.instance) {
			ClineAccountService.instance = new ClineAccountService()
		}
		return ClineAccountService.instance
	}

	/**
	 * Returns the base URL for the Cline API
	 * @returns The base URL as a string
	 */
	get baseUrl(): string {
		return this._baseUrl
	}

	/**
	 * Helper function to make authenticated requests to the Cline API
	 * @param endpoint The API endpoint to call (without the base URL)
	 * @param config Additional axios request configuration
	 * @returns The API response data
	 * @throws Error if the API key is not found or the request fails
	 */
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const url = `${this._baseUrl}${endpoint}`

		const clineAccountAuthToken = await this._authService.getAuthToken()

		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				Authorization: `Bearer ${clineAccountAuthToken}`,
				"Content-Type": "application/json",
				...config.headers,
			},
		}

		const response: AxiosResponse<{ data?: T; error: string; success: boolean }> = await axios.get(url, requestConfig)
		const status = response.status
		if (status < 200 || status >= 300) {
			throw new Error(`Request to ${endpoint} failed with status ${status}`)
		}
		if (!response.data || !response.data.data) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}
		if (!response.data.success) {
			throw new Error(`API error: ${response.data.error}`)
		}

		return response.data.data
	}

	/**
	 * RPC variant that fetches the user's current credit balance without posting to webview
	 * @returns Balance data or undefined if failed
	 */
	async fetchBalanceRPC(): Promise<BalanceResponse | undefined> {
		try {
			const me = await this.authenticatedRequest<UserResponse>(`/api/v1/users/me`)
			const data = await this.authenticatedRequest<BalanceResponse>(`/api/v1/users/${me.id}/balance`)
			return data
		} catch (error) {
			console.error("Failed to fetch balance (RPC):", error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's usage transactions without posting to webview
	 * @returns Usage transactions or undefined if failed
	 */
	async fetchUsageTransactionsRPC(): Promise<UsageTransaction[] | undefined> {
		try {
			const me = await this.authenticatedRequest<UserResponse>(`/api/v1/users/me`)
			const data = await this.authenticatedRequest<{ items: UsageTransaction[] }>(`/api/v1/users/${me.id}/usages`)
			return data.items
		} catch (error) {
			console.error("Failed to fetch usage transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's payment transactions without posting to webview
	 * @returns Payment transactions or undefined if failed
	 */
	async fetchPaymentTransactionsRPC(): Promise<PaymentTransaction[] | undefined> {
		try {
			const me = await this.authenticatedRequest<UserResponse>(`/api/v1/users/me`)
			const data = await this.authenticatedRequest<{ paymentTransactions: PaymentTransaction[] }>(
				`/api/v1/users/${me.id}/payments`,
			)
			return data.paymentTransactions
		} catch (error) {
			console.error("Failed to fetch payment transactions (RPC):", error)
			return undefined
		}
	}
}
