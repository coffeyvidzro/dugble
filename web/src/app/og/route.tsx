import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET(request: Request) {
    const url = new URL(request.url);
    const title = url.searchParams.get("title") ?? "Dugble";
    const label =
        url.searchParams.get("label") ?? "A2P Messaging Infrastructure";

    return new ImageResponse(
        <div
            style={{
                alignItems: "center",
                background: "linear-gradient(135deg, #020617 0%, #172554 100%)",
                color: "white",
                display: "flex",
                height: "100%",
                justifyContent: "center",
                padding: "72px",
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "28px",
                }}
            >
                <div
                    style={{
                        color: "#93c5fd",
                        fontSize: "32px",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        fontSize: "72px",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 0.95,
                        maxWidth: "960px",
                    }}
                >
                    {title}
                </div>
                <div style={{ color: "#bfdbfe", fontSize: "30px" }}>
                    Developer-first A2P email and SMS APIs
                </div>
            </div>
        </div>,
        {
            height: 630,
            width: 1200,
        },
    );
}
