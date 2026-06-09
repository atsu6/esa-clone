import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      screenName?: string;
    };
  }

  interface User {
    screenName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    screenName?: string;
  }
}
