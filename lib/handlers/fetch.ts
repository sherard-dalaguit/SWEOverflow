import {ActionResponse} from "@/types/global";
import logger from "@/lib/logger";
import handleError from "@/lib/handlers/error";
import {RequestError} from "@/lib/http-errors";

interface FetchOptions extends RequestInit {
	timeout?: number;
}

function isError(error: unknown): error is Error {
	return error instanceof Error;
}

export async function fetchHandler<T>(
	url: string,
	options: FetchOptions = {}
): Promise<ActionResponse<T>> {
	try {
		const { timeout = 100000, headers: customHeaders = {}, ...restOptions } = options;

		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeout);

		const defaultHeaders: HeadersInit = {
			"Content-Type": "application/json",
			Accept: "application/json",
		};

		const headers = { ...defaultHeaders, ...customHeaders };
		const config: RequestInit = {
			...restOptions,
			headers,
			signal: controller.signal,
		}

		try {
			const response = await fetch(url, config);

			clearTimeout(id);

			if (!response.ok) {
				throw new RequestError(response.status, `HTTP error: ${response.status}`);
			}

			return await response.json();
		} catch (err) {
			const error = isError(err) ? err : new Error("Unknown error occurred");

			if (error.name === "AbortError") {
				logger.warn(`Request to ${url} timed out after ${timeout}ms`);
			} else {
				logger.error(`Error fetching ${url}: ${error.message}`);
			}

			return handleError(error) as ActionResponse<T>;
		}
	} catch (error) {
		console.error("Fetch error:", error);
		throw error;
	}
}