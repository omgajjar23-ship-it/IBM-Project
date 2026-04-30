import os
import joblib
import pandas as pd
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

def train_and_save_model():
    print("Fetching adult dataset from OpenML... This might take a minute.")
    # ID 1590 is the adult dataset
    data = fetch_openml(data_id=1590, as_frame=True, parser="auto")
    df = data.frame
    
    # We only care about the features requested by the user
    features = ['age', 'workclass', 'education', 'occupation', 'hours-per-week']
    target = 'class' # <=50K, >50K
    
    df = df.dropna(subset=[target])
    X = df[features]
    y = df[target].apply(lambda x: 1 if '>50K' in str(x) else 0)
    
    # Preprocessing
    numeric_features = ['age', 'hours-per-week']
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_features = ['workclass', 'education', 'occupation']
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Append classifier to preprocessing pipeline
    # Now we have a full prediction pipeline
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Classifier...")
    clf.fit(X_train, y_train)
    
    train_score = clf.score(X_train, y_train)
    test_score = clf.score(X_test, y_test)
    print(f"Train Accuracy: {train_score:.3f}")
    print(f"Test Accuracy: {test_score:.3f}")
    
    # Save the model
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model.joblib')
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train_and_save_model()
