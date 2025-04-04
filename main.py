import argparse
import pandas as pd
import helper
from sklearn import preprocessing
import numpy as np
import autoencoder
from datetime import datetime
from sklearn.model_selection import train_test_split
from io import StringIO

def predict_single_row(model, row, threshold):
    """
    Predicts using a single row.
    The row is expected to be a list of numeric values.
    """
    row_values = np.array(row).reshape(1, -1)
    prediction = model.predict(row_values)
    reconstruction_error = np.mean(np.square(row_values - prediction), axis=1)
    
    print(f"Reconstruction Error: {reconstruction_error}")
    print(f"Threshold: {threshold}")
    
    is_suspicious = reconstruction_error >= threshold
    return "Suspicious Activity Detected" if is_suspicious else "Normal Activity"

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_path', 
                        default=r'C:\Users\Anshuman\Desktop\Rishabh\hacka\zero-day-detection\DataFiles\KDD\kddcup.data_10_percent_corrected',
                        help='Path to the dataset CSV file')
    parser.add_argument('--output', default='Results.csv')
    parser.add_argument('--epochs', type=int, default=50)
    parser.add_argument('--archi', default='U20,D,U15,D,U10,D,U15,D,U20',
                        help='Architecture string for the autoencoder')
    parser.add_argument('--regu', default='l1l2')
    parser.add_argument('--l1_value', type=float, default=0.0001)
    parser.add_argument('--l2_value', type=float, default=0.0001)
    parser.add_argument('--correlation_value', type=float, default=0.9)
    parser.add_argument('--dropout', type=float, default=0.1)
    parser.add_argument('--model', default='autoencoder')
    parser.add_argument('--loss', default='mse')
    args = parser.parse_args()
    
    # --- Load and Preprocess Dataset ---
    num_columns = 42
    columns = [f'col{i}' for i in range(num_columns)]
    df = pd.read_csv(args.data_path, header=None, names=columns)
    
    # Filter for normal activity rows.
    df = df[df['col41'].str.strip().str.lower().str.startswith('normal')]
    
    # Drop non-numeric columns: columns 0,1,2,3 and the class label (column 41).
    df_numeric = df.drop(columns=['col0', 'col1', 'col2', 'col3', 'col41'])
    
    # Convert remaining columns to float.
    df_numeric = df_numeric.astype(float)
    
    # Optionally drop highly correlated columns.
    df_numeric, dropped_cols = helper.dataframe_drop_correlated_columns(
        df_numeric, threshold=args.correlation_value, verbose=True)
    print("Dropped columns due to high correlation:", dropped_cols)
    
    # Scale the data.
    standard_scaler = preprocessing.StandardScaler()
    x_scaled = standard_scaler.fit_transform(df_numeric.values)
    df_processed = pd.DataFrame(x_scaled, columns=df_numeric.columns)
    
    # Split into training and validation sets.
    train_X, valid_X = train_test_split(df_processed, test_size=0.25, random_state=1)
    
    # --- Train Autoencoder ---
    if args.model == 'autoencoder':    
        wrapper = autoencoder.Autoencoder(
            num_features=len(df_processed.columns),
            archi=args.archi,
            reg=args.regu,
            l1_value=args.l1_value,
            l2_value=args.l2_value,
            dropout=args.dropout,
            loss=args.loss
        )
        wrapper.model.fit(train_X, train_X, batch_size=1024, epochs=args.epochs,
                          validation_data=(valid_X, valid_X))
    
    # --- Compute Threshold ---
    normal_predictions = wrapper.model.predict(train_X)
    reconstruction_errors = np.mean(np.square(train_X - normal_predictions), axis=1)
    threshold = np.mean(reconstruction_errors) + 3 * np.std(reconstruction_errors)
    print(f"Computed Threshold: {threshold}")
    
    # --- Test Single Row Prediction ---
    # Provided test row (as a CSV string):
    test_row_str = """0,tcp,smtp,SF,3714,393,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,0.00,0.00,0.00,0.00,1.00,0.00,0.00,12,86,0.75,0.17,0.08,0.05,0.00,0.00,0.00,0.00,normal"""
    
    # Convert the test row string to a DataFrame.
    test_df = pd.read_csv(StringIO(test_row_str), header=None, names=columns)
    
    # Drop non-numeric columns (same as training).
    test_df_numeric = test_df.drop(columns=['col0', 'col1', 'col2', 'col3', 'col41'])
    
    # Convert to numeric (coerce errors, then fill NaNs with 0).
    test_df_numeric = test_df_numeric.apply(pd.to_numeric, errors='coerce')
    test_df_numeric.fillna(0, inplace=True)
    
    # Ensure we keep only the columns used during training.
    test_df_numeric = test_df_numeric[df_numeric.columns]
    
    # Scale the test row using the same scaler.
    test_scaled = standard_scaler.transform(test_df_numeric.values)
    test_row = test_scaled[0].tolist()
    
    result = predict_single_row(wrapper.model, test_row, threshold)
    print(f"Test row prediction: {result}")
