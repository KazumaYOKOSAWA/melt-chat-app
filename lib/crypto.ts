import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error("ENCRYPTION_KEY is not set")
  }

  const buffer = Buffer.from(key, "base64")

  if (buffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes base64")
  }

  return buffer
}

export function encryptText(plainText: string) {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  return [
    "v1",
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":")
}

export function decryptText(encryptedText: string) {
  const key = getEncryptionKey()

  const [version, ivBase64, authTagBase64, encryptedBase64] =
    encryptedText.split(":")

  if (version !== "v1") {
    throw new Error("Unsupported encrypted content version")
  }

  const iv = Buffer.from(ivBase64, "base64")
  const authTag = Buffer.from(authTagBase64, "base64")
  const encrypted = Buffer.from(encryptedBase64, "base64")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}