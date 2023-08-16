data "google_project" "project" {

  depends_on = [
    google_project_service.project["cloudresourcemanager.googleapis.com"],
    google_project_service.project["iam.googleapis.com"],
    google_project_service.project["compute.googleapis.com"],
  ]
}

# ##################################################
# Frontend Service Account
# ##################################################

resource "google_service_account" "frontend_service_account" {
  project      = var.project_id
  account_id   = "employees-frontend-sa"
  display_name = "employees-frontend-sa"
  description  = "Service account for Amazing Employees Frontend"

  depends_on = [
    google_project_service.project["cloudresourcemanager.googleapis.com"],
    google_project_service.project["iam.googleapis.com"],
    google_project_service.project["compute.googleapis.com"],
  ]
}

# ##################################################
# Backend Service Account
# ##################################################

resource "google_service_account" "backend_service_account" {
  project      = var.project_id
  account_id   = "employees-backend-sa"
  display_name = "employees-backend-sa"
  description  = "Service account for Amazing Employees Backend"

  depends_on = [
    google_project_service.project["cloudresourcemanager.googleapis.com"],
    google_project_service.project["iam.googleapis.com"],
    google_project_service.project["compute.googleapis.com"],
  ]
}

resource "google_project_iam_member" "backend_iam_member" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.backend_service_account.email}"

  depends_on = [
    google_project_service.project["cloudresourcemanager.googleapis.com"],
    google_project_service.project["iam.googleapis.com"],
    google_project_service.project["compute.googleapis.com"],
  ]
}

resource "google_project_iam_member" "backend_run_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.backend_service_account.email}"

  depends_on = [
    google_project_service.project["cloudresourcemanager.googleapis.com"],
    google_project_service.project["iam.googleapis.com"],
    google_project_service.project["compute.googleapis.com"],
  ]
}

# ##################################################
# Cloud Build Service Account
# ##################################################

resource "google_project_iam_member" "cloud_build_sa" {
  for_each = toset([
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"

  depends_on = [
    google_project_service.project["cloudresourcemanager.googleapis.com"],
    google_project_service.project["iam.googleapis.com"],
    google_project_service.project["compute.googleapis.com"],
  ]
}