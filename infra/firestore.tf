resource "google_firestore_database" "database" {
  project                     = var.project_id
  name                        = "(default)"
  location_id                 = var.location
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode            = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"

  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_project_service.project["firestore.googleapis.com"]]
}
