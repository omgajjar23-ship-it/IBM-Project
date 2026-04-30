# 🚀 IncomeInsight AI: Intelligent Loan Risk Assessment



## 📌 Problem Statement
Traditional financial auditing and loan processing are often bogged down by manual verification, subjective bias, and slow turnaround times. Financial institutions need a robust, automated way to predict individual income levels and assess loan risks based on demographic and employment data.

**IncomeInsight AI** solves this by leveraging Machine Learning to categorize applicants into income brackets and provide a data-driven risk assessment, enabling instant decision-making and enhanced security.

---

## 🛠️ Tech Stack

### Backend
- **Python / Django**: Core business logic and API orchestration.
- **Django REST Framework (DRF)**: Professional-grade API endpoints.
- **SimpleJWT**: Secure authentication with HttpOnly cookie support.
- **SQLite / PostgreSQL**: Reliable data persistence.

### Frontend
- **React.js**: Modern, responsive user interface.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: Utility-first styling for premium aesthetics.
- **Recharts**: Dynamic data visualization for financial trends.

### Machine Learning
- **Scikit-learn**: Random Forest Classifier for high-accuracy predictions.
- **Pandas**: Efficient data manipulation and preprocessing.
- **Joblib**: Optimized model serialization and loading.

### Security
- **Zero Trust Architecture**: Strict identity verification.
- **HttpOnly Cookies**: Advanced protection against XSS attacks.
- **Rate Limiting**: Throttling to prevent brute-force and DoS.

---

## 🚀 How to Run

### 1. Clone the Repository
```bash
git clone https://github.com/omgajjar23-ship-it/income-insight.git
cd income-insight
```

### 2. Setup Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Train the ML Model (Required first time)
python backend/ml_pipeline/train_model.py

# Start the server
python manage.py runserver
```

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 📊 Features
- **AI-Powered Income Prediction**: Predicts if an applicant earns >$50K based on the Adult Census dataset.
- **Automated Risk Scoring**: Calculates "Low", "Medium", or "High" risk based on income and employment history.
- **Secure Authentication**: Enterprise-grade login with HttpOnly JWT storage.
- **Bulk Import**: Support for processing multiple applications via CSV upload.
- **Performance Analytics**: Visual dashboards showing loan approval rates and risk distributions.



## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Contributors
- **Om Gajjar** - [GitHub](https://github.com/omgajjar23-ship-it)
