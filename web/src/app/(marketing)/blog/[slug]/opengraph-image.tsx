import { ImageResponse } from "next/og";
import { getBlogPost } from "../utils";

export const alt = "Dugble Engineering Blog";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    // Fallbacks just in case of an invalid slug
    const title = post ? post.metadata.title : "Engineering & Product Updates";
    const category = post ? post.metadata.category : "BLOG";

    return new ImageResponse(
        <div
            style={{
                background:
                    "linear-gradient(to bottom right, #09090b, #18181b)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "80px",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <span
                        style={{
                            color: "#3ED98E",
                            fontSize: "20px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                        }}
                    >
                        {category}
                    </span>
                </div>

                <div
                    style={{
                        fontSize: "64px",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        color: "#ffffff",
                        maxWidth: "900px",
                    }}
                >
                    {title}
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div
                    style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Dugble
                </div>
                <div
                    style={{
                        fontSize: "24px",
                        color: "#a1a1aa",
                    }}
                >
                    dugble.com/blog
                </div>
            </div>
        </div>,
        {
            ...size,
        },
    );
}
