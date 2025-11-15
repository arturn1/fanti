import NextAuth from "next-auth";

const IS4Provider = {
  id: "is4",
  name: "IdentityServer4",
  type: "oauth",
  wellKnown: `https://connect-staging.fi-group.com/identity/.well-known/openid-configuration`,
  clientId: 'ext.local',
  clientSecret: "WWpKNGFGcFlWbnBpTTFaMldqSTVjbVJSUFQwPQ==",
  issuer: "https://connect-staging.fi-group.com/identity",
  authorization: {
    params: {
      scope: "openid profile email",
      response_type: "id_token token",
      redirect_uri: "http://localhost:3000",
      state: Math.random().toString(36).substring(2) + Date.now().toString(36),
      nonce: Math.random().toString(36).substring(2) + Date.now().toString(36)
    }
  },
  idToken: true,
};

const handler = NextAuth({
  providers: [IS4Provider as any],
});

export { handler as GET, handler as POST };
