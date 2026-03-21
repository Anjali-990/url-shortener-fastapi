import shortuuid

def generate_short_code():
    return shortuuid.ShortUUID().random(length=6)