terraform {
  required_providers {
    google = {
      source = "hashicorp/google-beta"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.location
}
