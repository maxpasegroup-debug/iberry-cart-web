export function hasMongoConfig() {
  return Boolean(process.env.MONGODB_URI);
}
