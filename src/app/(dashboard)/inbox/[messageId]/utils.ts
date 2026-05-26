import { authFetch } from "@/lib/auth/client";
import type { MessageDetailResponse } from "./types";

export async function fetchMessageDetail(messageId: string): Promise<MessageDetailResponse> {
	const response = await authFetch(`/api/messages/${messageId}`);
	return (await response.json()) as MessageDetailResponse;
}
