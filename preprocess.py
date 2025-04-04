import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import scipy.stats as stats
import pandas as pd

def dataframe_drop_correlated_columns(df, threshold=0.95, verbose=False):
    if verbose:
        print('Dropping correlated columns')
    if threshold == -1:
         return df, []

    # Create correlation matrix.
    corr_matrix = df.corr().abs()
    
    # Select upper triangle of correlation matrix.
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))

    # Find index of feature columns with correlation greater than threshold.
    to_drop = [column for column in upper.columns if any(upper[column] > threshold)]

    # Drop features.
    df = df.drop(columns=to_drop, errors='ignore')

    return df, to_drop

def file_write_args(args, file_name, one_line=False):
    args = vars(args)
    with open(file_name, "a") as file:
        file.write('BEGIN ARGUMENTS\n')
        if one_line:
            file.write(str(args))
        else:
            for key in args.keys():
                file.write('{}, {}\n'.format(key, args[key]))
        file.write('END ARGUMENTS\n')

def plot_probability_density(array, output_file, cutoffvalue=2):
    array[array > cutoffvalue] = cutoffvalue
    plt.clf()
    sns_plot = sns.distplot(array, hist=True, kde=True, rug=False, fit=stats.norm,
                              color='darkblue', 
                              hist_kws={'edgecolor': 'black'},
                              kde_kws={'linewidth': 4, 'label': 'KDE'},
                              fit_kws={'color': 'red', 'linewidth': 4, 'label': 'PDF'})
    plt.xlabel("MSE")
    plt.ylabel("Density")
    plt.title("PDF of Mean Square Error (cut-off at MSE = 2)")
    plt.legend(loc='best')
    sns_plot.figure.savefig(output_file)
   
def plot_model_history(hist, output_file):
    plt.clf()
    plt.plot(hist.history['accuracy'], label='Training Accuracy')
    plt.plot(hist.history['val_accuracy'], label='Validation Accuracy')
    plt.plot(hist.history['loss'], label='Training Loss')
    plt.plot(hist.history['val_loss'], label='Validation Loss')
    plt.ylabel('Value')
    plt.xlabel('Epoch')
    plt.legend(loc='center right')
    plt.savefig(output_file)

def add_kdd_main_classes(dataset):
    base_classes_map = {
        'normal': 'normal',
        'back': 'dos',
        'buffer_overflow': 'u2r',
        'ftp_write': 'r2l',
        'guess_passwd': 'r2l',
        'imap': 'r2l',
        'ipsweep': 'probe',
        'land': 'dos',
        'loadmodule': 'u2r',
        'multihop': 'r2l',
        'nmap': 'probe',
        'neptune': 'dos',
        'perl': 'u2r',
        'phf': 'r2l',
        'pod': 'dos',
        'portsweep': 'probe',
        'rootkit': 'u2r',
        'satan': 'probe',
        'smurf': 'dos',
        'spy': 'r2l',
        'teardrop': 'dos',
        'warezclient': 'r2l',
        'warezmaster': 'r2l'
    }
    
    for key in base_classes_map:
        dataset[dataset[:, 41] == key, 42] = base_classes_map[key]
    return dataset

def process_new_dataset(df):
    """
    Process the new dataset:
      - Assign column names if not present.
      - Filter for rows labeled as normal.
      - Drop the ID and label columns.
      - Encode categorical features.
    """
    # If the file has no header and 42 columns, assign column names.
    if df.shape[1] == 42:
        df.columns = ["id", "protocol", "service", "flag", "f1", "f2", "f3", "f4", "f5", "f6", 
                      "f7", "f8", "f9", "f10", "f11", "f12", "f13", "f14", "f15", "f16", 
                      "f17", "f18", "f19", "f20", "f21", "f22", "f23", "f24", "f25", "f26", 
                      "f27", "f28", "f29", "f30", "f31", "f32", "f33", "f34", "f35", "f36", "label"]
    
    # Filter for normal rows (assumes normal rows contain 'normal' in the label).
    df = df[df["label"].str.contains("normal", case=False, na=False)]
    
    # Drop ID and label columns.
    df = df.drop(["id", "label"], axis=1)
    
    # Encode categorical columns.
    from sklearn.preprocessing import LabelEncoder
    for col in ["protocol", "service", "flag"]:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
    return df
