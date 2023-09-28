export type SessionKeyType = 'main_session_key' | 'sub_session_key'
export type WebauthnKeyType = 'main_key' | 'sub_key'

export type CredentialKeyType = SessionKeyType | WebauthnKeyType

export enum SigningAlg {
    RS256 = -257,
    ES256 = -7,
}


export function appendBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
    tmp.set(new Uint8Array(buffer1), 0)
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
    return tmp.buffer
}

export function generateRandomBytes(len = 32) {
    const buf = new Uint8Array(len)
    return window.crypto.getRandomValues(buf)
}


/**
 * Convert from a Base64URL-encoded string to an Array Buffer. Best used when converting a
 * credential ID from a JSON string to an ArrayBuffer, like in allowCredentials or
 * excludeCredentials
 *
 * Helper method to compliment `bufferToBase64URLString`
 */
export function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
    // Convert from Base64URL to Base64
    const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/')
    /**
     * Pad with '=' until it's a multiple of four
     * (4 - (85 % 4 = 1) = 3) % 4 = 3 padding
     * (4 - (86 % 4 = 2) = 2) % 4 = 2 padding
     * (4 - (87 % 4 = 3) = 1) % 4 = 1 padding
     * (4 - (88 % 4 = 0) = 4) % 4 = 0 padding
     */
    const padLength = (4 - (base64.length % 4)) % 4
    const padded = base64.padEnd(base64.length + padLength, '=')

    // Convert to a binary string
    const binary = atob(padded)

    // Convert binary string to buffer
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }

    return buffer
}

/**
 * Convert the given array buffer into a Base64URL-encoded string. Ideal for converting various
 * credential response ArrayBuffers to string for sending back to the server as JSON.
 *
 * Helper method to compliment `base64URLStringToBuffer`
 */
export function bufferToBase64URLString(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let str = ''

    for (let i = 0; i < bytes.length; i++) {
        const charCode = bytes[i]
        str += String.fromCharCode(charCode)
    }

    const base64String = btoa(str)

    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function hexToArrayBuffer(input: string): ArrayBuffer {
    const view = new Uint8Array(input.length / 2)
    for (let i = 0; i < input.length; i += 2) {
        view[i / 2] = parseInt(input.substring(i, i + 2), 16)
    }

    return view.buffer
}

export function bufferToHex(buffer: ArrayBuffer) {
    return [...new Uint8Array(buffer)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

export function base64ToInt(s: string) {
    const buf = base64URLStringToBuffer(s)
    const hex = bufferToHex(buf)
    return parseInt(hex, 16)
}

export function bufferToUTF8String(value: ArrayBuffer): string {
    return new TextDecoder('utf-8').decode(value)
}

export function utf8StringToBuffer(value: string): ArrayBuffer {
    return new TextEncoder().encode(value)
}

export async function stringToHash(s: string) {
    const data = utf8StringToBuffer(s)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return hash
}

/**
 * A simple test to determine if a hostname is a properly-formatted domain name
 *
 * A "valid domain" is defined here: https://url.spec.whatwg.org/#valid-domain
 *
 * Regex sourced from here:
 * https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch08s15.html
 */
export function isValidDomain(hostname: string): boolean {
    return (
        // Consider localhost valid as well since it's okay wrt Secure Contexts
        hostname === 'localhost' ||
        /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname)
    )
}

export function isBlobUrl(url: string) {
    return url.startsWith('blob:https://')
}

export function isValidUrl(s: string) {
    let url
    try {
        url = new URL(s)
    } catch (_) {
        return false
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
}

export function isString(s?: string): s is string {
    return typeof s === 'string'
}

export function isAlphaNumericString(s?: string): boolean {
    return isString(s) && /^[a-zA-Z0-9]+$/.test(s)
}

export function isValidUsername(s?: string): boolean {
    return (
        isString(s) && s.length >= 4 && s.length <= 16 && isAlphaNumericString(s)
    )
}

export function isNumbericString(s?: string): boolean {
    return isString(s) && /^[0-9]+$/.test(s)
}

export function isValidCCID(ccid?: string): boolean {
    return isString(ccid) && ccid.length >= 4 && isNumbericString(ccid)
}

export function isValidJoyID(joyId: string): boolean {
    const [username, ccid] = joyId.split('#')
    return isValidUsername(username) && isValidCCID(ccid)
}

export function isHasWhiteSpace(s?: string): boolean {
    return isString(s) && /\s/g.test(s)
}

export function remove0x(hex: string) {
    return hex.startsWith('0x') ? hex.slice(2) : hex
}

export function append0x(hex: string) {
    return hex.startsWith('0x') ? hex : `0x${hex}`
}

export function hexToString(hex: string) {
    let str = ''
    for (let i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    return str
}

export const generateRandomBase64URLString = (length: number = 32) =>
    bufferToBase64URLString(generateRandomBytes(length))

export const generateRandomHexString = (length: number = 32) =>
    bufferToHex(generateRandomBytes(length))

export function truncateMiddle(
    str = '',
    takeLength = 6,
    tailLength = takeLength,
    pad = '...'
): string {
    if (takeLength + tailLength >= str.length) return str
    return `${str.slice(0, takeLength)}${pad}${str.slice(-tailLength)}`
}

export function base64urlToHex(s: string) {
    return bufferToHex(base64URLStringToBuffer(s))
}

export function is3dRenderer(url?: string) {
    if (!url) return false
    return /\.(usdz|glb|gltf)$/.test(url)
}

/**
 * Web crypto use IEEE P1363 ECDSA signature format
 * ref: https://stackoverflow.com/questions/39554165/ecdsa-signatures-between-node-js-and-webcrypto-appear-to-be-incompatible
 * code from: https://github.com/java-crypto/cross_platform_crypto/blob/main/docs/ecdsa_signature_conversion.md
 */
export function derToIEEE(sig: ArrayBuffer) {
    const signature = Array.from(new Uint8Array(sig), (x) =>
        `00${x.toString(16)}`.slice(-2)
    ).join('')
    const rLength = parseInt(signature.substr(6, 2), 16) * 2
    let r = signature.substr(8, rLength)
    let s = signature.substr(12 + rLength)
    r = r.length > 64 ? r.substr(-64) : r.padStart(64, '0')
    s = s.length > 64 ? s.substr(-64) : s.padStart(64, '0')
    const p1363Sig = `${r}${s}`
    return new Uint8Array(
        p1363Sig.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16))
    )
}
