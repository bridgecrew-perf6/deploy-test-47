import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verify(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const user = {
      googleId: payload.sub,
      email: payload.email,
      picture: payload.picture,
      displayName: payload.name,
      password: null,
    };
    return user;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

export { verify };