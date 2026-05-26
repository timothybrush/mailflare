"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import { MarkAsRead } from "@/components/mark-read";
import { MessageActions } from "@/components/message-actions/message-actions";
import { getMessageBackHref } from "@/components/message-actions/utils";
import { getEmailAddress, getEmailDisplayName } from "@/lib/email/address";
import type { MessageDetailResponse } from "./types";
import { fetchMessageDetail } from "./utils";

export default function MessageDetailPage() {
	const params = useParams<{ messageId: string }>();
	const messageId = params.messageId;
	const [data, setData] = useState<MessageDetailResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadMessage() {
			setLoading(true);
			const nextData = await fetchMessageDetail(messageId);
			if (!cancelled) {
				setData(nextData);
				setLoading(false);
			}
		}

		void loadMessage();
		return () => {
			cancelled = true;
		};
	}, [messageId]);

	if (loading) {
		return <p className="px-6 py-4 text-sm text-neutral-500">Loading...</p>;
	}

	if (!data?.message) {
		return <p className="px-6 py-4 text-sm text-neutral-500">{data?.error ?? "Message not found"}</p>;
	}

	const { message, body } = data;
	const fromName = message.fromContactName ?? getEmailDisplayName(message.fromAddr);
	const fromAddress = getEmailAddress(message.fromAddr);
	const toName = message.toContactName ?? getEmailDisplayName(message.toAddr);
	const toAddress = getEmailAddress(message.toAddr);

	return (
		<div className="h-full overflow-auto">
			{message.direction === "inbound" && !message.read && (
				<MarkAsRead messageId={message.id} />
			)}
			<div className="flex py-2 items-center justify-between px-2">
				<div className="flex items-center flex-row gap-6">
					<Link
						href={getMessageBackHref(message.direction, message.status)}
						className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</div>
				<MessageActions
					messageId={message.id}
					direction={message.direction}
					status={message.status}
					read={message.read}
				/>
			</div>
			<article className="px-6">
				<h1 className="text-2xl text-neutral-900 mb-4">
					{message.subject ?? "(no subject)"}
				</h1>

				<div className="mb-6 flex items-start justify-between border-b border-neutral-100 pb-5">
					<div>
						<p className="text-sm font-semibold text-neutral-900">{fromName}</p>
						<p className="text-xs text-neutral-500">
							{fromAddress}
							<span className="mx-1">to</span>
							{toName}
							{toAddress !== toName && <span className="ml-1">({toAddress})</span>}
						</p>
					</div>
					<p className="text-xs text-neutral-400">
						{dayjs(message.createdAt).format("MMM DD, YYYY, hh:mmA")}
					</p>
				</div>
				<div className="prose max-w-none text-neutral-900">
					{body?.htmlBody ? (
						<div dangerouslySetInnerHTML={{ __html: body.htmlBody }} />
					) : (
						<pre className="whitespace-pre-wrap text-sm">
							{body?.textBody ?? message.snippet}
						</pre>
					)}
				</div>
			</article>
		</div>
	);
}
