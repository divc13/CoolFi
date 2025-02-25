import base64
import base58

def base64_to_base58(base64_string: str) -> str:
    # Decode Base64 to bytes
    binary_data = base64.b64decode(base64_string)

    # Encode bytes to Base58
    base58_string = base58.b58encode(binary_data).decode("utf-8")

    return base58_string

# Example usage
base64_string = "HeaBJ3xLgvZacQWmEctTeUqyfSU4SDEnEwckWxd92W2G"
base58_string = base64_to_base58(base64_string)
print("Base58 Encoded String:", base58_string)
