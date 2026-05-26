import { parseEmailAddressParts } from "@/lib/email/address";

export function getContactId(userId: string, email: string): string {
	return `${userId}:${email.trim().toLowerCase()}`;
}

export function getContactNameFromAddress(address: string): string | null {
	return parseEmailAddressParts(address).name;
}
