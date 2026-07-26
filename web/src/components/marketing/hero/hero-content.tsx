export function HeroContent() {
  return (
    <div className="space-y-5 animate-fade-up [animation-delay:80ms]">
      <h1 className="max-w-xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
        Send messages your product can{" "}
        <span className="text-signal">prove were delivered.</span>
      </h1>
      <p className="max-w-lg text-pretty text-base leading-7 text-muted-foreground md:text-lg">
        Dugble is an email and SMS API for OTPs, receipts, and account alerts
        with a status for every message and a webhook for every state change, so
        nothing gets lost between your server and your customer.
      </p>
    </div>
  );
}
