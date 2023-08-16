variable "project_id" {
  description = "Project ID of the GCP project where resources will be deployed"
  type        = string
  default     = "PLEASE UPDATE"
}

variable "location" {
  description = "Location (region) where resources will be deployed"
  type        = string
  default     = "PLEASE UPDATE"
}

variable "enable_api_gateway" {
  description = "Feature flag to enable/disable API Gateway. Leverage this to deploy infra sequentially."
  type        = bool
  default     = false
}

