import pyshark
import time
from collections import deque

log_file = "pyshark_network_log.txt"
seen_streams = {}
history_window = 2  # seconds
recent_connections = deque()  # stores (timestamp, src, dst, dport, flags)

# Full KDD feature list without label
all_fields = [
    "duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes", "land", "wrong_fragment",
    "urgent", "hot", "num_failed_logins", "logged_in", "num_compromised", "root_shell",
    "su_attempted", "num_root", "num_file_creations", "num_shells", "num_access_files",
    "num_outbound_cmds", "is_host_login", "is_guest_login", "count", "srv_count", "serror_rate",
    "srv_serror_rate", "rerror_rate", "srv_rerror_rate", "same_srv_rate", "diff_srv_rate",
    "srv_diff_host_rate", "dst_host_count", "dst_host_srv_count", "dst_host_same_srv_rate",
    "dst_host_diff_srv_rate", "dst_host_same_src_port_rate", "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate", "dst_host_srv_serror_rate", "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate"
]

print("Starting real-time packet capture using PyShark...")


def extract_features(pkt):
    features = {}
    now = time.time()

    try:
        if 'IP' not in pkt or pkt.transport_layer is None:
            return features

        ip = pkt.ip
        src = ip.src
        dst = ip.dst
        protocol = pkt.transport_layer.lower()

        if not hasattr(pkt, protocol):
            return features

        trans_layer = getattr(pkt, protocol)
        srcport = getattr(trans_layer, 'srcport', None)
        dstport = getattr(trans_layer, 'dstport', None)
        if not srcport or not dstport:
            return features

        flags = pkt.tcp.flags if 'TCP' in pkt else ''
        conn_key = (src, dst)

        if conn_key not in seen_streams:
            seen_streams[conn_key] = {"start_time": now}
        duration = round(now - seen_streams[conn_key]["start_time"], 3)
        features["duration"] = duration
        features["protocol_type"] = "tcp" if 'TCP' in pkt else "udp"
        features["service"] = "http"  # hardcoded example
        features["flag"] = "SF"  # hardcoded example
        features["src_bytes"] = int(pkt.length) if ip.src == src else 0
        features["dst_bytes"] = int(pkt.length) if ip.src == dst else 0
        features["land"] = int(src == dst and srcport == dstport)
        features["wrong_fragment"] = int(getattr(pkt.ip, 'frag_offset', '0') != '0')
        features["urgent"] = int(pkt.tcp.flags_urg == '1') if 'TCP' in pkt else 0

        # Add to history
        recent_connections.append((now, src, dst, dstport, flags))
        while recent_connections and now - recent_connections[0][0] > history_window:
            recent_connections.popleft()

        same_host = 0
        same_service = 0
        syn_error = 0
        syn_total = 0

        for ts, h_src, h_dst, h_dport, h_flags in recent_connections:
            if h_dst == dst:
                same_host += 1
                if h_dport == dstport:
                    same_service += 1
                if '0x00000002' in h_flags:
                    syn_total += 1
                    if '0x00000004' in h_flags:
                        syn_error += 1

        features["count"] = same_host
        features["srv_count"] = same_service
        features["serror_rate"] = round(syn_error / syn_total, 2) if syn_total else 0
        features["srv_serror_rate"] = round(syn_error / same_service, 2) if same_service else 0

        # Hardcoded values for non-computable features
        hardcoded_defaults = {
            "hot": 0, "num_failed_logins": 0, "logged_in": 1, "num_compromised": 0,
            "root_shell": 0, "su_attempted": 0, "num_root": 0, "num_file_creations": 0,
            "num_shells": 0, "num_access_files": 0, "num_outbound_cmds": 0, "is_host_login": 0,
            "is_guest_login": 0, "rerror_rate": 0.0, "srv_rerror_rate": 0.0, "same_srv_rate": 1.0,
            "diff_srv_rate": 0.0, "srv_diff_host_rate": 0.0, "dst_host_count": 10, "dst_host_srv_count": 10,
            "dst_host_same_srv_rate": 1.0, "dst_host_diff_srv_rate": 0.0, "dst_host_same_src_port_rate": 0.1,
            "dst_host_srv_diff_host_rate": 0.0, "dst_host_serror_rate": 0.0, "dst_host_srv_serror_rate": 0.0,
            "dst_host_rerror_rate": 0.0, "dst_host_srv_rerror_rate": 0.0
        }

        for key, val in hardcoded_defaults.items():
            features[key] = val

    except Exception as e:
        print("Error:", e)

    return features


def write_log(feature_dict):
    row = []
    for feat in all_fields:
        row.append(str(feature_dict.get(feat, 0)))
    with open(log_file, "a") as f:
        f.write(",".join(row) + "\n")


capture = pyshark.LiveCapture(interface='Wi-Fi')
for packet in capture.sniff_continuously():
    feats = extract_features(packet)
    if feats:
        write_log(feats)
