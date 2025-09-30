import NextAuth from "next-auth";
import { redirect } from "next/dist/server/api-utils";

const IS4Provider = {
    id: "is4",
    name: "IdentityServer4",
    type: "oauth",
    wellKnown: `${process.env.OAUTH2_ISSUER}/.well-known/openid-configuration`,
    clientId: process.env.OAUTH2_CLIENTID,
    clientSecret: process.env.OAUTH2_SECRET,
    issuer: process.env.OAUTH2_ISSUER || "https://connect-staging.fi-group.com/identity",
    authorization: {
        params: {
            scope: process.env.OAUTH2_SCOPE || "openid profile email",
            response_type: process.env.OAUTH2_RESPONSE_TYPE || "id_token token",
            redirect_uri: process.env.NEXTAUTH_URL,
            state: Math.random().toString(36).substring(2) + Date.now().toString(36),
            nonce: Math.random().toString(36).substring(2) + Date.now().toString(36)
        }
    },
    idToken: true,
    // checks: ["pkce", "state"],
    // profile(profile: Record<string, any>) {
    //     console.log('[IS4][profile] Dados recebidos do provedor:', JSON.stringify(profile, null, 2));
    //     return {
    //         id: profile.sub,
    //         name: profile.name,
    //         email: profile.email,
    //     };
    // },
};

const handler = NextAuth({
    providers: [IS4Provider as any],
    // session: { strategy: "jwt" },
    // callbacks: {
    //     async jwt({ token, account, profile }) {
    //         debugger;
    //         process.stdout.write('[IS4][jwt callback] token (antes): ' + JSON.stringify(token, null, 2) + '\n');
    //         process.stdout.write('[IS4][jwt callback] account: ' + JSON.stringify(account, null, 2) + '\n');
    //         process.stdout.write('[IS4][jwt callback] profile: ' + JSON.stringify(profile, null, 2) + '\n');
    //         // Se houver id_token, decodifica manualmente o JWT
    //         if (account && account.id_token) {
    //             const base64Url = account.id_token.split('.')[1];
    //             const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //             const jsonPayload = decodeURIComponent(
    //                 atob(base64)
    //                     .split('')
    //                     .map(function (c) {
    //                         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    //                     })
    //                     .join('')
    //             );
    //             const jwtPayload = JSON.parse(jsonPayload);
    //             token.id = jwtPayload.sub;
    //             token.name = jwtPayload.name;
    //             token.email = jwtPayload.email;
    //             token.roles = jwtPayload.role || jwtPayload.roles;
    //         } else if (account && profile) {
    //             token.id = profile.sub;
    //             token.name = profile.name;
    //             token.email = profile.email;
    //         }
    //         process.stdout.write('[IS4][jwt callback] token (depois): ' + JSON.stringify(token, null, 2) + '\n');
    //         return token;
    //     },
    //     async session({ session, token }) {
    //         (session.user as any).id = token.id;
    //         (session.user as any).name = token.name;
    //         (session.user as any).email = token.email;
    //         (session.user as any).debug = token;
    //         return session;
    //     },
    // },
});

export { handler as GET, handler as POST };
