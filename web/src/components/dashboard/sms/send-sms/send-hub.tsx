import { SendHeader } from "./send-header";
import { NewMessageCta } from "./new-message-cta";
import { MessageTemplatesGrid } from "./message-templates-grid";
import { RecentSendsList } from "./recent-sends-list";
import { getMockMessagePool } from "../sms-dashboard/types";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export function SendHub() {
    const sentToday = getMockMessagePool().filter(
        (message) => Date.now() - message.sentAt.getTime() < ONE_DAY_MS,
    ).length;

    return (
        <div className="mx-auto w-full max-w-6xl pb-6 animate-fade-up">
            <SendHeader sentTodayCount={sentToday} />
            <div className="space-y-6">
                <NewMessageCta />
                <MessageTemplatesGrid />
                <RecentSendsList />
            </div>
        </div>
    );
}
