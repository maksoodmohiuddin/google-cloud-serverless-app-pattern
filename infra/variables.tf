variable "project_id" {
  description = "Project ID of the GCP project where resources will be deployed"
  type        = string
  default     = "PLEASE_UPDATE_PROJECT_ID"
}

variable "location" {
  description = "Location (region) where resources will be deployed"
  type        = string
  default     = "PLEASE_UPDATE"
}

variable "enable_api_gateway" {
  description = "Feature flag to enable/disable API Gateway. Leverage this to deploy infra sequentially."
  type        = bool
  default     = false
}

