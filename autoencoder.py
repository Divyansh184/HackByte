import tensorflow as tf
from tensorflow.keras.layers import Input, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.regularizers import l2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

class Autoencoder:
    def __init__(self, num_features, mse_threshold=0.5, 
                 archi="U64,D,U32,D,U16,D,U32,D,U64", 
                 reg='l2', l1_value=0.0, l2_value=0.0001, 
                 dropout=0.1, loss='mae', verbose=True):
        self.mse_threshold = mse_threshold
        self.model = self.build_model(num_features, archi, reg, l1_value, l2_value, dropout, loss)
        
        if verbose:
            self.model.summary()

    def build_model(self, num_features, archi, reg, l1_value, l2_value, dropout, loss):
        if reg == 'l2':
            regularizer = tf.keras.regularizers.l2(l2_value)
        else:
            regularizer = tf.keras.regularizers.l1_l2(l1=l1_value, l2=l2_value)

        input_layer = Input(shape=(num_features,))
        previous = input_layer

        layers = archi.split(',')
        for layer in layers:
            if layer[0] == 'U':
                units = int(layer[1:])
                previous = Dense(units, activation='relu', kernel_regularizer=regularizer)(previous)
            elif layer[0] == 'D':
                previous = Dropout(dropout)(previous)

        output_layer = Dense(num_features, activation=None)(previous)

        model = Model(input_layer, output_layer)
        optimizer = Adam(learning_rate=0.001)
        model.compile(
            loss='mae' if loss == 'mae' else 'mse',
            optimizer=optimizer,
            metrics=[self.accuracy]
        )
        return model

    def accuracy(self, y_true, y_pred):
        mse = tf.reduce_mean(tf.square(y_true - y_pred), axis=1)
        return tf.reduce_mean(tf.cast(mse < self.mse_threshold, tf.float32))

    def train(self, X_train, X_val, epochs=150, batch_size=128):
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
            ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6)
        ]

        history = self.model.fit(
            X_train, X_train,
            validation_data=(X_val, X_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        return history
