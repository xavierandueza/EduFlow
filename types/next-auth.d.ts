import "next-auth";

declare module "next-auth" {
  interface User {
    stripeCustomerId?: string | null;
    subscriptionActive?: boolean | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
    relevantId?: string | null;
    subscriptionName?: string | null;
  }

  interface Session {
    user: User;
  }
}
