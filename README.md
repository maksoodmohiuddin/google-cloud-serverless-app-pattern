# Google Cloud Serverless Application Pattern using Cloud Run, API Gateway and Firebase

This repository contains the source code and configuration files for a Google Cloud Serverless Application Pattern using Cloud Run, API Gateway and Firebase.  

The application consists of a frontend developed using Angular, a backend developed using Pyhton Flask, and a Firestore database. The infrastructure is managed using Terraform, and application code/containers build & deployment is managed using Cloud Build. 


## Architecture

The application follows a three-tier architecture, with separate layers for the frontend, backend, and database. Here's an overview of each component:

**Frontend**: The frontend is built using Angular, a popular web development framework. It runs on Cloud Run, a fully managed serverless platform on Google Cloud. Cloud Run provides automatic scaling and handles container orchestration.

**Backend**: The backend is developed using Flask, a lightweight Python web framework. It also runs on Cloud Run, allowing for easy scalability and management. The backend handles the business logic of the application and interacts with the Firestore database. Backend is exposed via API gateway, a fully managed gateway for serverless workloads in Google Cloud. U

**Database**: The application uses Firestore, a NoSQL document database provided by Google Cloud. Firestore offers a flexible data model and automatic scalability. It is used to store and retrieve data required by the application.

## A note about cost  

Benefit of running serverless application is charges are based on usage only and there's no heavy lifting to setup virtual private networks or firewalls. Moreover, google cloud free tier has a generous  offering for the serverless services used in this project: 
- Learn more about [Cloud Run Free Tier](https://cloud.google.com/free/docs/free-cloud-features#cloud-run)
- Learn more about [Cloud Build Free Tier](https://cloud.google.com/free/docs/free-cloud-features#cloud-build)
- Learn more [Firestore Free Tier](https://cloud.google.com/free/docs/free-cloud-features#firestore)

Only servive that is not part of free tier is API Gateway, however, it allows 0-2 millon API call per account per month free! 

- Learn more about [API Gateway Pricing Free Tier](https://cloud.google.com/api-gateway/pricing)

So, in most cases, you should be able to deploy and run this application with very low to no cost. 

## Getting Started

To simplify and centralize, we use this single repository to hold all of the application, infrastructure, and pipeline code. 

Projects are required to manage and organize resources in Google Cloud. We recommend creating a new project for this tutorial. This tutorial assumes that you have a Google Cloud project with admin access and you will be using the Google Cloud Cloud Shell.

To access your project in the Google Cloud console, navigate to the Google Cloud console and log in (or create an account), then select your project. If you do not already have a Google Cloud project, navigate to **Menu** > **IAM & Admin** > **Create a Project** then follow the prompts in the console.

## Initial Setup
In this section, you will do initial setup. 

**Step 1**
[Open a new Cloud Shell session.](https://console.cloud.google.com/?cloudshell=true)

**Step 2 - Download the source code for this tutorial** 

```
 git clone https://github.com/maksoodmohiuddin/serverless-cloudrun-apigw-firebase.git
```

```
cd serverless-cloudrun-apigw-firebase
```

**Step 3 - Update Terraform to use your Google Project**
```
nano ./infra/variables.tf 
```
Update project_id and location with google cloud project you are using and a target google cloud region (e.g. us-west4) where you like to deploy this application:

- Learn more about [Google Cloud Region](https://cloud.withgoogle.com/region-picker/).
Choose a region that support Cloud Builds, Cloud Run and Firebase and Cloud Builds
- Learn more about [Google Cloud Region that supports Firebase](https://cloud.google.com/firestore/docs/locations).
- Learn more about [Google Cloud Region that supports Cloud Build](https://cloud.google.com/build/docs/locations).
- Learn more about [Google Cloud Region that supports Cloud Run](https://cloud.google.com/run/docs/locations).

For personal account, Cloud Build restricted to limited regions. Therefore, if you are using a personal account, We recommned using one of the below regions: 

us-west2 
asia-east1
australia-southeast1 
southamerica-east1  


```
variable "project_id" {
  description = "Project ID of the GCP project where resources will be deployed"
  type        = string
  default     = "PLEASE UPDATE WITH YOUR GOOGLE PROJECT ID"
}

variable "location" {
  description = "Location (region) where resources will be deployed"
  type        = string
  default     = "PLEASE UPDATE YOUR GOOGLE CLOUD REGION"
}
```

If not already updated, update Google Cloud Shell Console to use your project: 
```
gcloud config set project [YOUR GOOGLE CLOUD PROJECT]
```

Verify: 
```
gcloud config list
```

## Deploying Initial Infrastructure

In this section, you will deploy the infrastructure with Terraform. 

Due to dependency mapping that is not known to Terraform, we will need to target specific resources and setup the application sequentially.

This application uses Terraform to manage infrastructure. By default, Terraform stores state locally in a file named terraform.tfstate. For purpose of this tutotial, you can use the local state. Howver, if preferred, state can be sttored in a remote state using Google Cloud Storage. Below are the steps for that. Note, this is optional. 

#### [Optional] Configure Terraform with Remote State

A Cloud Storage bucket Bucket can be used to store the Terraform State.

In the Google Cloud console, navigate to the Cloud Storage Buckets page > Create bucket.

- For **name**, create a globally unique name (e.g., `<random-prefix>-<app-name>-tfstate`)
- For **location type**, choose **Multi-Region, US**
- For **storage class**, choose **Standard**.
- For **access control**, check **Enforce public access prevention** on this bucket and select **Uniform access control**
- For **data protection**, select **Object versioning**

Alternatively, you can create the bucket using gcloud command: 

```
gcloud storage buckets create gs://BUCKET_NAME
```

Note: If you are especially savvy with Terraform, you may find it easier to create the bucket with Terraform local state, then migrate the state into the bucket. See the Google Cloud documentation for more details.

Now,  we will continue with the initial infra deployment: 

**Step 1**
Navigate to the `infra` folder:

```
cd ./infra
```
       
**Step 2** 
Initialize Terraform:

```
terraform init
```

**Step 3** 
Validate Terraform Plan:

``` 
terraform plan
```

Output should be: 
Plan: 18 to add, 0 to change, 0 to destroy.

**Step 4** 
Apply the Terraform for the initial resources

``` 
terraform apply
```

When prompted, type yes to deploy the resources. It should match the plan. 

 ## Deploying Backend, API Gateway & Frontend 

**Step 1 -  Update backend python flask application code to use your Google Project**

Navigate to backend folder: 

```
cd ../app/backend/
```

open the `firestore.py` file: 
```
nano -l firestore.py
```

Update line 10 client with the google cloud project you are using for this: 

```
client = firestore.Client(project="PLEASE UPDATE WITH YOUR GOOGLE CLOUD PROJECT")
```

**Step 2 - Trigger Cloud Build to deploy Backend** 

You can review the cloud build file: 
``` 
cat backend-cloudbuild.yaml
```

Use gcloud command line to deploy backend cloud run based on cloud build file: 
``` 
gcloud builds submit  --region=[YOUR GOOGLE CLOUD REGION] --config backend-cloudbuild.yaml
```

e.g. 
``` 
gcloud builds submit  --region=us-west2 --config backend-cloudbuild.yaml
```

**Step 3 - Update Swagger Spec** 

We use API Gatewway with Open API Swagger specifications to connect the backend cloud run to API Gateway and setup the API Gateway configuration. 

Note that, firebase is used as authetication for API Gateway. 

Learn more about 

- Learn more about [Open API Specification for API Gateway](https://cloud.google.com/api-gateway/docs/openapi-overview).

- Learn more about [Swagger](https://swagger.io)

- Learn more about [Firebase as authetication for API Gateway](https://cloud.google.com/api-gateway/docs/authenticating-users-firebase)


Update line 127 & 129 with your google cloud project name 

``` 
cd ../../infra
```

``` 
nano -l api-gateway--espv2-definition.yml.tmpl
```

``` 
x-google-issuer: "https://securetoken.google.com/PLEASE UPDATE"
x-google-jwks_uri: "https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com"
x-google-audiences: "PLEASE UPDATE"
```

**Step 4 - Deploy API Gateway** 

First enable enable_api_gateway flag to true: 

```
nano variables.tf 
```

```
variable "enable_api_gateway" {
  description = "Feature flag to enable/disable API Gateway. Leverage this to deploy infra sequentially."
  type        = bool
  default     = true
}
```
Run the terraform plan and then apply: 

``` 
terraform plan
```
Output should be: 
Plan: 3 to add, 0 to change, 0 to destroy.

``` 
terraform apply
```

When prompted, type yes to deploy the resources. It should match the plan. 

**Step 5 - Configure Firebase** 

Navigate to `https://console.firebase.google.com` 
Create/Add project -> select your google cloud project from the dropdown -> Accept Terms -> Continue -> Confirm Plan -> Choose to enable Google Analytics or not -> Continue. 

In the landing page of your firebase project, add your app as a web app to Firebase. Alternatively,  under project overview > click on the gear icon >  navigate to project settings > register your app as a web app to Firebase. 

Register your app with your chosen name (e.g. you can use your google project name). 

Once app is registered, under SDK setup and configuration section (you can toggle to config section), copy the value for `const firebaseConfig` and paste the value into `app/frontend/src/environments/environments.ts` 

**Wanring** Make sure to not check in the values of environments.ts into a git repositiory as these are sensitive information. 

Navigate to frontend folder: 

```
cd ../app/frontend/src/environments/
```

```
nano -l environment.ts 
```

``` 
export const environment = {
  firebase: {
    apiKey: "PLEASE UPDATE",
    authDomain: "PLEASE UPDATE",
    projectId: "PLEASE UPDATE",
    storageBucket: "PLEASE UPDATE",
    messagingSenderId: "PLEASE UPDATE",
    appId: "PLEASE UPDATE",
    measurementId: "PLEASE UPDATE" // if measurement is enabled
  },
  production: false
};
```

**Step 6 - Configure Firebase Auth** 
To use the Google provider for Firebase auth, while in Firebase console - 

All products -> Authentication -> Get Started ->  Google  -> Enable -> Add support email -> Save

**Step 7 - Set Frontend API GateWay Config** 

Run the following command to get the api-gateway config: 

```
gcloud api-gateway gateways describe employee-gateway --location LOCATION --project PROJECT_ID --format 'value(defaultHostname)'
```

Output will look like below: 

```
employee-gateway-#.#.gateway.dev
```

Update the three urls in `app/frontend/src/employee/services/firestore.service.ts` (keep the path e.g. employee as is), e.g.: 

```
cd ../employee/services
```

```
nano -l firestore.service.ts
```

Update line 
```
addEmployeeUrl = 'https://employee-gateway-#.#.gateway.dev/employee';
employeesUrl = 'https://employee-gateway-#.#.gateway.dev/employees';
deleteEmployeeUrl = 'https://employee-gateway-#.ue.gateway.dev/employee';
```

**Step 8 - Trigger Cloud Build to deploy Frontend** 
While in frontend folder, you can review the cloud build file: 
``` 
cat frontend-cloudbuild.yaml
```

Use gcloud command line to deploy backend cloud run based on cloud build file: 
``` 
gcloud builds submit  --region=[YOUR GOOGLE CLOUD REGION]] --config frontend-cloudbuild.yaml
```

e.g. 
``` 
gcloud builds submit  --region=us-west2 --config frontend-cloudbuild.yaml
```

**Step 9 - Update Firebase authorized domain with Frontend Cloud Run URL** 

Frontend Cloud Run URL need to be authorized for OAuth operations in Firebase app. 

You can use gcloud to get the cloud run URL: 

``` 
gcloud run services describe SERVICE --region REGION --format 'value(status.url)'
```

e.g. 
``` 
gcloud run services describe amazing-employees-frontend-service --region us-west2 --format 'value(status.url)'
```
Output should be: 
https://amazing-employees-frontend-service-###.a.run.app



Copy that URL and to the OAuth redirect domains list in the Firebase: 
browse to https://console.firebase.google.com/ and select your project: 

Click on Authentication -> Settings Tab -> Authorized domains -> Add domain -> paste your Frontend Cloud Run URL. 

**Step 10 - Validate end to end appL** 

Browse to your frontend cloud run URL (https://amazing-employees-frontend-service-###.a.run.app), use a google account to log in to the app - your Google Cloud Serverless Application Pattern using Cloud Run, API Gateway and Firebase is up and running! 

### Cleaning up

We will not be able to run a terraform destroy here due to API GW config dependencies. 

To avoid incurring charges to your Google Cloud account for the resources used in this tutorial, you can delete the project.

Deleting a project has the following consequences:

- If you used an existing project, you'll also delete any other work that you've done in the project.
- You can't reuse the project ID of a deleted project. If you created a custom project ID that you plan to use in the future, delete the resources inside the project instead. This ensures that URLs that use the project ID, such as an `appspot.com` URL, remain available.

To delete a project, do the following:

In the Cloud console, go to the [Projects page](https://console.cloud.google.com/iam-admin/projects).
In the project list, select the project you want to delete and click **Delete**.
In the dialog, type the project ID, and then click **Shut down** to delete the project.

## What's next

Please folliow McKinsey Digital in Medium. 
