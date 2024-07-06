export type User = {
    email: string;
    password: string;
    username: string;
    imgUrl?: string;
    _id?: string;
    firstName: string;
    lastName:string;
    refreshTokens?: string[];
  }