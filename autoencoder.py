import tensorflow as tf
from tensorflow.keras.layers import Input, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.regularizers import l1_l2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

class Autoencoder:
    def __init__(self, num_features, mse_threshold=0.5, 
                 archi="U15,D,U9,D,U6,D,U9,D,U15", 
                 reg='l1l2', l1_value=0.0001, l2_value=0.0001, 
                 dropout=0.1, loss='mse', verbose=True):
        self.mse_threshold = mse_threshold
        self.model = self.build_model(num_features, archi, reg, l1_value, l2_value, dropout, loss)
        
        if verbose:
            self.model.summary()

    def build_model(self, num_features, archi, reg, l1_value, l2_value, dropout, loss):
        """Builds an optimized autoencoder."""
        
        # Regularization setup.
        if reg == 'l1':
            regularizer = tf.keras.regularizers.l1(l1_value)
        elif reg == 'l2':
            regularizer = tf.keras.regularizers.l2(l2_value)
        else:
            regularizer = l1_l2(l1=l1_value, l2=l2_value)
        
        # Input Layer.
        input_layer = Input(shape=(num_features,))
        previous = input_layer

        # Build the encoder and decoder layers based on the architecture string.
        layers = archi.split(',')
        for layer in layers:
            if layer[0] == 'U':  # Dense layer.
                units = int(layer[1:])
                current = Dense(units, activation='relu', kernel_regularizer=regularizer)(previous)
                previous = current
            elif layer[0] == 'D':  # Dropout layer.
                current = Dropout(dropout)(previous)
                previous = current

        # Output Layer with sigmoid activation to bring outputs into [0, 1].
        output_layer = Dense(num_features, activation='sigmoid')(previous)

        # Compile Model.
        model = Model(input_layer, output_layer)
        optimizer = Adam(learning_rate=0.001)
        model.compile(loss='mean_squared_error' if loss == 'mse' else 'mean_absolute_error',
                      optimizer=optimizer,
                      metrics=[self.accuracy])
        return model

    def accuracy(self, y_true, y_pred):
        """Custom accuracy based on a reconstruction error threshold."""
        mse = tf.reduce_mean(tf.square(y_true - y_pred), axis=1)
        return tf.reduce_mean(tf.cast(mse < self.mse_threshold, tf.float32))

    def train(self, X_train, X_val, epochs=100, batch_size=32):
        """Trains the autoencoder with early stopping & learning rate adjustments."""
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
