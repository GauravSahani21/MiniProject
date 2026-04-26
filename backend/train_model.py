# ──────────────────────────────────────────────
# AutiSense — ML Model Training Script
# Run this ONCE to train and save the model
#
# Dataset: archive/Toddler Autism dataset July 2018.csv
# Run from the backend/ folder:
#   cd backend
#   python train_model.py
# ──────────────────────────────────────────────

import os, sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, roc_auc_score, roc_curve)
import pickle
import warnings
warnings.filterwarnings('ignore')

# ── Resolve dataset path ──────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(SCRIPT_DIR, '..', 'archive')
CSV_PATH    = os.path.join(DATASET_DIR, 'Toddler Autism dataset July 2018.csv')

if not os.path.exists(CSV_PATH):
    print(f"ERROR: Dataset not found at {CSV_PATH}")
    sys.exit(1)

print(f"Loading: {CSV_PATH}")

# ── 1. LOAD DATA ──────────────────────────────
df = pd.read_csv(CSV_PATH)
print("Shape:", df.shape)
print(df.head())
print(df.info())
print("\nColumns:", df.columns.tolist())

# ── 2. Detect target column ───────────────────
# Ensure we pick 'Class/ASD Traits ' instead of 'Family_mem_with_ASD'
target_col = None
for col in df.columns:
    if 'Class' in col:
        target_col = col
        break
if target_col is None:
    # Try last column
    target_col = df.columns[-1]
print(f"\nTarget column: '{target_col}'")
print("Class distribution:\n", df[target_col].value_counts())

# ── 3. PREPROCESSING ──────────────────────────
df.rename(columns={target_col: 'target'}, inplace=True)

# Drop irrelevant/ID columns
drop_cols = ['Case_No', 'Who completed the test', 'Qchat-10-Score']
df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True, errors='ignore')

# Encode target
df['target'] = df['target'].astype(str).str.strip()
df['target'] = df['target'].map({'YES': 1, 'NO': 0, 'Yes': 1, 'No': 0})
df.dropna(subset=['target'], inplace=True)
df['target'] = df['target'].astype(int)

# Encode categorical columns
cat_cols = df.select_dtypes(include='object').columns.tolist()
le = LabelEncoder()
encoders = {}
for col in cat_cols:
    df[col] = df[col].fillna('Unknown').astype(str).str.strip()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# Fill numeric missing values
df.fillna(df.median(numeric_only=True), inplace=True)

print("\nCleaned shape:", df.shape)
print("Columns:", df.columns.tolist())

# ── 4. FEATURES & TARGET ─────────────────────
X = df.drop(columns=['target'])
y = df['target']

feature_names = X.columns.tolist()
print("\nFeatures:", feature_names)
print("Target distribution:", y.value_counts().to_dict())

# ── 5. SPLIT ──────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\nTrain: {X_train.shape}, Test: {X_test.shape}")

# ── 6. SCALE ──────────────────────────────────
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

# ── 7. TRAIN MULTIPLE MODELS ──────────────────
models = {
    'Random Forest':       RandomForestClassifier(n_estimators=100, random_state=42),
    'Gradient Boosting':   GradientBoostingClassifier(n_estimators=100, random_state=42),
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'SVM':                 SVC(probability=True, random_state=42),
}

results = {}
for name, model in models.items():
    if name in ['Logistic Regression', 'SVM']:
        model.fit(X_train_sc, y_train)
        preds = model.predict(X_test_sc)
        proba = model.predict_proba(X_test_sc)[:, 1]
    else:
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        proba = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, proba)
    cv  = cross_val_score(model, X, y, cv=5, scoring='accuracy').mean()

    results[name] = {'accuracy': acc, 'auc': auc, 'cv': cv}
    print(f"\n{'-'*40}")
    print(f"Model: {name}")
    print(f"  Accuracy   : {acc:.4f}")
    print(f"  AUC-ROC    : {auc:.4f}")
    print(f"  CV (5-fold): {cv:.4f}")
    print(classification_report(y_test, preds, target_names=['No ASD', 'ASD']))

# ── 8. HYPERPARAMETER TUNING (Random Forest) ─
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5],
}
grid = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=1
)
grid.fit(X_train, y_train)
print("\nBest params:", grid.best_params_)
print("Best CV score:", grid.best_score_)

tuned_model = grid.best_estimator_
tuned_preds = tuned_model.predict(X_test)
tuned_proba = tuned_model.predict_proba(X_test)[:, 1]
tuned_acc   = accuracy_score(y_test, tuned_preds)
print(f"Tuned Accuracy: {tuned_acc:.4f}")

# ── 9. FEATURE IMPORTANCE ─────────────────────
importances = tuned_model.feature_importances_
feat_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': importances
}).sort_values('Importance', ascending=False)
print("\nTop Features:\n", feat_df.head(10))

# ── 10. PLOTS ─────────────────────────────────
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('AutiSense ML Model Analysis', fontsize=16, fontweight='bold')

cm = confusion_matrix(y_test, tuned_preds)
sns.heatmap(cm, annot=True, fmt='d', cmap='Oranges',
            xticklabels=['No ASD', 'ASD'],
            yticklabels=['No ASD', 'ASD'], ax=axes[0][0])
axes[0][0].set_title('Confusion Matrix')

feat_df.head(10).plot(kind='barh', x='Feature', y='Importance',
                      ax=axes[0][1], color='#FF6B2B', legend=False)
axes[0][1].set_title('Top 10 Feature Importances')
axes[0][1].invert_yaxis()

fpr, tpr, _ = roc_curve(y_test, tuned_proba)
axes[1][0].plot(fpr, tpr, color='#FF6B2B', lw=2,
                label=f'AUC = {roc_auc_score(y_test, tuned_proba):.3f}')
axes[1][0].plot([0,1],[0,1],'k--')
axes[1][0].set_xlabel('False Positive Rate')
axes[1][0].set_ylabel('True Positive Rate')
axes[1][0].set_title('ROC Curve')
axes[1][0].legend()

model_names = list(results.keys())
accs = [results[m]['accuracy'] for m in model_names]
axes[1][1].bar(model_names, accs, color=['#FF6B2B','#E85520','#FF8C55','#FFD166'])
axes[1][1].set_ylim(0.7, 1.0)
axes[1][1].set_title('Model Accuracy Comparison')
axes[1][1].tick_params(axis='x', rotation=15)
for i, v in enumerate(accs):
    axes[1][1].text(i, v+0.005, f'{v:.3f}', ha='center', fontweight='bold')

plt.tight_layout()
out_png = os.path.join(SCRIPT_DIR, 'model_analysis.png')
plt.savefig(out_png, dpi=150, bbox_inches='tight')
plt.show()
print(f"\nPlot saved: {out_png}")

# ── 11. SAVE MODEL ────────────────────────────
model_path = os.path.join(SCRIPT_DIR, 'autism_model.pkl')
with open(model_path, 'wb') as f:
    pickle.dump({
        'model':    tuned_model,
        'scaler':   scaler,
        'encoders': encoders,
        'features': feature_names,
        'accuracy': round(tuned_acc * 100, 1),
    }, f)
print(f"[OK] Model saved: {model_path}")
print(f"     Features: {feature_names}")
