export const MONGO_URI = process.env.MONGO_URI ?? "";
export enum GenreEnum {
  Action = 0,
  Drama = 1,
}
export enum FormatEnum {
  Novel = 0,
  Manga = 1,
}
export enum StateEnum {
  Ended = 0,
  OnGoing = 1,
  Hiatus = 2,
}
