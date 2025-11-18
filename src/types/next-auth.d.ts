import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "customer";
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "customer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "customer";
  }
}

























