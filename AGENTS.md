# AGENTS.md

## Cursor Cloud specific instructions

### Overview
This is a Google Cloud serverless three-tier app ("Amazing Employees") with:
- **Frontend**: Angular 15 SPA in `app/frontend/` (npm, `package-lock.json`)
- **Backend**: Python Flask API in `app/backend/` (`requirements.txt`)
- **Infra**: Terraform in `infra/`

### Node.js version
Angular 15 requires Node 18. The VM uses nvm; run `nvm use 18` (or `nvm install 18 && nvm alias default 18` on first setup).

### Frontend
- Install: `npm install` in `app/frontend/`
- Dev server: `npx ng serve --host 0.0.0.0 --port 4200` (serves at http://localhost:4200)
- Build: `npx ng build` or `npx ng build --configuration development`
- TypeScript check: `npx tsc --noEmit -p tsconfig.app.json`
- No lint config is set up (no ESLint). `ng lint` suggests adding `@angular-eslint/schematics`.
- Tests (`ng test`): The existing spec file (`app.component.spec.ts`) is a stale Angular scaffold that doesn't match the actual component — it references `app.title` which doesn't exist. Tests will fail with TS compilation errors.

### Backend
- The pinned `requirements.txt` targets Python 3.7 and contains packages (gevent 21.1.2, greenlet 1.1.0) incompatible with Python 3.12. For local dev, install only what the app actually imports: `pip install Flask==1.1.2 Flask-Cors==3.0.10 google-cloud-firestore==2.1.0 Jinja2==2.11.3 MarkupSafe==1.1.1 Werkzeug==1.0.1 itsdangerous==1.1.0 click==7.1.2 "setuptools<70"`
- The `"setuptools<70"` pin is required because Python 3.12 removed `pkg_resources` from stdlib and setuptools 70+ also dropped it; google-cloud-firestore 2.1.0 still depends on `pkg_resources`.
- Flask starts with: `GOOGLE_APPLICATION_CREDENTIALS=/tmp/dummy-credentials.json PORT=8080 python3 firestore.py`
- Without real GCP credentials, the Firestore client will connect but fail on actual DB operations (expected). The server still starts and routes respond.
- To generate a dummy credentials file for local dev: `python3 -c "import subprocess, json; r=subprocess.run(['openssl','genrsa','2048'],capture_output=True,text=True); json.dump({'type':'service_account','project_id':'dummy','private_key_id':'d','private_key':r.stdout,'client_email':'d@d.iam.gserviceaccount.com','client_id':'0','auth_uri':'https://accounts.google.com/o/oauth2/auth','token_uri':'https://oauth2.googleapis.com/token'},open('/tmp/dummy-credentials.json','w'))"`

### GCP dependency
The app is designed for full GCP deployment (Firestore, Firebase Auth, API Gateway, Cloud Run). Local dev is limited: the frontend renders but Firebase Auth login won't work without real Firebase config, and the backend can't reach Firestore without a real GCP project. See `README.md` for full deployment steps.
