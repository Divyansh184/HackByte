import argparse
import pandas as pd
import preprocess
from sklearn import preprocessing
import numpy as np
import autoencoder
from datetime import datetime
from sklearn.model_selection import train_test_split
from io import StringIO
import os
import joblib
import json
import redis
from tensorflow.keras.models import load_model
import tensorflow.keras.losses

def predict_single_row(model, row, threshold):
    row_values = np.array(row).reshape(1, -1)
    prediction = model.predict(row_values)
    reconstruction_error = np.mean(np.square(row_values - prediction), axis=1)

    print(f"Reconstruction Error: {reconstruction_error}")
    print(f"Threshold: {threshold}")

    is_suspicious = reconstruction_error >= threshold
    return "S" if is_suspicious else "N"

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_path', default=r'C:\Users\PARAS AGARWAL\Desktop\HackByte\HackByte\DataFiles\KDD\kddcup.data_10_percent_corrected')
    parser.add_argument('--epochs', type=int, default=300)
    parser.add_argument('--archi', default='U20,D,U15,D,U10,D,U15,D,U20')
    parser.add_argument('--regu', default='l1l2')
    parser.add_argument('--l1_value', type=float, default=0.0001)
    parser.add_argument('--l2_value', type=float, default=0.0001)
    parser.add_argument('--correlation_value', type=float, default=0.9)
    parser.add_argument('--dropout', type=float, default=0.1)
    parser.add_argument('--model', default='autoencoder')
    parser.add_argument('--loss', default='mse')
    args = parser.parse_args()

    num_columns = 42
    columns = [f'col{i}' for i in range(num_columns)]
    df = pd.read_csv(args.data_path, header=None, names=columns)

    df = df[df['col41'].str.strip().str.lower().str.startswith('normal')]
    df_numeric = df.drop(columns=['col0', 'col1', 'col2', 'col3', 'col41']).astype(float)

    df_numeric, dropped_cols = preprocess.dataframe_drop_correlated_columns(
        df_numeric, threshold=args.correlation_value, verbose=True)
    print("Dropped columns due to high correlation:", dropped_cols)

    standard_scaler = preprocessing.StandardScaler()
    x_scaled = standard_scaler.fit_transform(df_numeric.values)
    df_processed = pd.DataFrame(x_scaled, columns=df_numeric.columns)

    train_X, valid_X = train_test_split(df_processed, test_size=0.25, random_state=1)

    model_path = 'saved_model.h5'
    scaler_path = 'scaler.pkl'
    threshold_path = 'threshold.json'

    if os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(threshold_path):
        print("Loading saved model, scaler, and threshold...")

        custom_objects = {'mse': tensorflow.keras.losses.MeanSquaredError()}
        wrapper_model = load_model(model_path, custom_objects=custom_objects, compile=False)
        wrapper_model.compile(optimizer='adam', loss='mse')

        standard_scaler = joblib.load(scaler_path)
        with open(threshold_path) as f:
            threshold = json.load(f)['threshold']

    else:
        print("Training new model...")
        wrapper = autoencoder.Autoencoder(
            num_features=len(df_processed.columns),
            archi=args.archi,
            reg=args.regu,
            l1_value=args.l1_value,
            l2_value=args.l2_value,
            dropout=args.dropout,
            loss=args.loss
        )
        wrapper.train(train_X, valid_X, epochs=args.epochs, batch_size=1024)

        normal_predictions = wrapper.model.predict(train_X)
        reconstruction_errors = np.mean(np.square(train_X - normal_predictions), axis=1)
        threshold = np.mean(reconstruction_errors) + 3 * np.std(reconstruction_errors)

        wrapper.model.save(model_path)
        joblib.dump(standard_scaler, scaler_path)
        with open(threshold_path, 'w') as f:
            json.dump({'threshold': threshold}, f)

        wrapper_model = wrapper.model

    # ----------- REDIS STREAM LOGIC STARTS HERE -----------
   # ----------- REDIS STREAM LOGIC STARTS HERE -----------
    # ----------- REDIS STREAM LOGIC STARTS HERE -----------
    print("Listening to Redis stream...")

    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    last_id = '$'
    # KDD features (same order used when writing to Redis)
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


    while True:
        response = r.xread({'network_logs': last_id}, count=1, block=1)
        for stream, messages in response:
            for entry_id, data in messages:
                last_id = entry_id

                line = ','.join([data.get(feat, '0') for feat in all_fields])
                print(line);
                log_df = pd.read_csv(StringIO(line), header=None, names=columns)
                log_df_numeric = log_df.drop(columns=['col0', 'col1', 'col2', 'col3', 'col41'])
                log_df_numeric = log_df_numeric.apply(pd.to_numeric, errors='coerce').fillna(0)

                log_df_numeric = log_df_numeric[df_numeric.columns]
                log_scaled = standard_scaler.transform(log_df_numeric.values)
                log_row = log_scaled[0].tolist()

                result = predict_single_row(wrapper_model, log_row, threshold)

                # Save in format: label, full_log_string
                # Efficient overwrite: keeps only the latest log entry
                with open("classified_results.txt", "w") as output_file:
                    output_file.write(f"{result}, {line}\n")


# ----------- REDIS STREAM LOGIC ENDS HERE -----------


# ----------- REDIS STREAM LOGIC ENDS HERE -----------

    # ----------- REDIS STREAM LOGIC ENDS HERE -----------
