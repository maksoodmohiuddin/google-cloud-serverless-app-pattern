resource "google_api_gateway_api" "api" {
  count = var.enable_api_gateway ? 1 : 0

  provider = google-beta
  api_id   = "employees-api"
  project  = var.project_id
}

resource "google_api_gateway_api_config" "api_cfg" {
  count = var.enable_api_gateway ? 1 : 0

  provider      = google-beta
  api           = google_api_gateway_api.api[count.index].api_id
  api_config_id = "employees-config"
  project       = var.project_id

  openapi_documents {
    document {
      path     = "spec.yaml"
      contents = base64encode(templatefile("api-gateway--espv2-definition.yml.tmpl", { url = data.google_cloud_run_service.backend_run_service[count.index].status[0].url, project_id = var.project_id }))
    }
  }
  gateway_config {
    backend_config {
      google_service_account = google_service_account.backend_service_account.email
    }
  }

  depends_on = [
    google_project_service.project["apigateway.googleapis.com"]
  ]
}

resource "google_api_gateway_gateway" "api_gw" {
  count = var.enable_api_gateway ? 1 : 0

  provider   = google-beta
  api_config = google_api_gateway_api_config.api_cfg[count.index].id
  gateway_id = "employee-gateway"
  region     = var.location
}

data "google_cloud_run_service" "backend_run_service" {
  count = var.enable_api_gateway ? 1 : 0

  name     = "amazing-employees-backend-service"
  location = var.location
  project  = var.project_id

  depends_on = [
    google_project_service.project["run.googleapis.com"]
  ]
}

