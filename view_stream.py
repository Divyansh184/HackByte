import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)
last_id = '$'  # Start from latest

print("=== Listening to Redis stream (Ctrl+C to stop) ===")
while True:
    response = r.xread({"network_logs": last_id}, block=0)  # Block forever until new data
    for stream, messages in response:
        for entry_id, data in messages:
            print(f"\nNew Entry: {entry_id}")
            for k, v in data.items():
                print(f"  {k}: {v}")
            last_id = entry_id
