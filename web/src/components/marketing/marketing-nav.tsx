import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const productLinks = [
  {
    href: "/sms-api",
    title: "SMS API",
    description: "OTP, alerts, and transactional A2P SMS.",
  },
  {
    href: "/email-api",
    title: "Email API",
    description: "Receipts, password resets, and lifecycle email.",
  },
  {
    href: "/webhooks",
    title: "Webhooks",
    description: "Delivery events, retries, and signatures.",
  },
];

const resourceLinks = [
  { href: "/quickstart", title: "Quickstart" },
  { href: "/security", title: "Security" },
  { href: "/pricing", title: "Pricing" },
  { href: "/blog", title: "Blog" },
];

export function MarketingNav() {
  return (
    <header className="flex items-center justify-between gap-4">
      <a href="/" className="font-heading font-semibold text-lg">
        Dugble
      </a>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[520px] gap-2 p-2 md:grid-cols-3">
                {productLinks.map((link) => (
                  <NavigationMenuLink key={link.href} href={link.href}>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {link.title}
                      </p>
                      <p className="text-muted-foreground text-xs leading-5">
                        {link.description}
                      </p>
                    </div>
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[360px] gap-1 p-2">
                {resourceLinks.map((link) => (
                  <NavigationMenuLink key={link.href} href={link.href}>
                    {link.title}
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2">
        <Button variant="ghost" render={<a href="/login" />}>
          Sign in
        </Button>
        <Button render={<a href="/sign-up" />}>Start building</Button>
      </div>
    </header>
  );
}
